import { readFileSync } from "node:fs";
import { join } from "node:path";
import axios from "axios";
import { AXIOS_TIMEOUT_MS } from "@shared/const";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// 使用 v1 API + gemini-pro（最基礎、最通用的模型，應該所有專案都支援）
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

// —— 輕量 RAG：載入知識庫、分塊與檢索 ——
let knowledgeBaseFull: string = "";
try {
  knowledgeBaseFull = readFileSync(join(process.cwd(), "kb.txt"), "utf-8");
} catch (error) {
  console.error("[Gemini] Failed to load knowledge base:", error);
}

type KBChunk = { text: string; termFreq: Map<string, number>; section: string };
const kbChunks: KBChunk[] = [];
const idfMap: Map<string, number> = new Map();

// 定義各產出對應的知識庫章節
const SECTION_MAPPING = {
  positioning: ["一、流量/轉換邏輯（總綱）"],
  topics: ["二、熱門話題類型（選題方向）"],
  script: ["三、標題與開場鉤子（Hook）", "四、常用腳本結構（按目標選）", "六、CTA 模板（按目標切）", "八、平台備註（簡表）"],
};

function tokenize(input: string): string[] {
  // 以字母/數字/常見中日韓漢字為主的簡單 tokenizer；全部轉小寫
  const lowered = input.toLowerCase();
  const tokens = lowered
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .filter(t => t.length > 1);
  return tokens;
}

function buildKbIndex() {
  if (!knowledgeBaseFull) return;
  const lines = knowledgeBaseFull.split("\n");
  const chunkSize = 12;
  
  // 識別當前章節
  let currentSection = "";
  
  for (let i = 0; i < lines.length; i += chunkSize) {
    const slice = lines.slice(i, i + chunkSize).join("\n").trim();
    if (!slice) continue;
    
    // 檢查 slice 中是否包含章節標題行
    for (const line of slice.split("\n")) {
      // 匹配格式：一、流量/轉換邏輯（總綱） 或 一、文案腳本與流量技巧
      const titleMatch = line.match(/([一二三四五六七八九十]、[^/\n]+)/);
      if (titleMatch) {
        currentSection = titleMatch[1].trim();
        break;
      }
    }
    
    const tf = new Map<string, number>();
    for (const tok of tokenize(slice)) {
      tf.set(tok, (tf.get(tok) ?? 0) + 1);
    }
    kbChunks.push({ text: slice, termFreq: tf, section: currentSection || "" });
  }

  // 計算簡易 IDF
  const docCount = kbChunks.length || 1;
  const vocab = new Map<string, number>();
  for (const chunk of kbChunks) {
    const seen = new Set<string>();
    for (const term of Array.from(chunk.termFreq.keys())) {
      if (seen.has(term)) continue;
      seen.add(term);
      vocab.set(term, (vocab.get(term) ?? 0) + 1);
    }
  }
  for (const [term, df] of Array.from(vocab.entries())) {
    const idf = Math.log((1 + docCount) / (1 + df)) + 1; // smoothed idf
    idfMap.set(term, idf);
  }
}

function scoreChunk(queryTf: Map<string, number>, chunk: KBChunk): number {
  // cosine on tf-idf
  let dot = 0;
  let qNorm = 0;
  let cNorm = 0;
  for (const [term, qtf] of Array.from(queryTf.entries())) {
    const idf = idfMap.get(term) ?? 1;
    const q = qtf * idf;
    qNorm += q * q;
    const ctf = chunk.termFreq.get(term) ?? 0;
    if (ctf > 0) dot += q * (ctf * idf);
  }
  for (const [term, ctf] of Array.from(chunk.termFreq.entries())) {
    const idf = idfMap.get(term) ?? 1;
    const v = ctf * idf;
    cNorm += v * v;
  }
  if (qNorm === 0 || cNorm === 0) return 0;
  return dot / (Math.sqrt(qNorm) * Math.sqrt(cNorm));
}

function retrieveContext(query: string, outputType: "positioning" | "topics" | "script" = "script", topK = 5): string {
  if (kbChunks.length === 0) return "";
  
  // 根據產出類型篩選對應章節
  const targetSections = SECTION_MAPPING[outputType];
  const filteredChunks = kbChunks.filter(chunk => {
    // 檢查 chunk 的 section 是否匹配目標章節（匹配章節編號：一、二、三、四、六、八）
    return targetSections.some(section => {
      const sectionNum = section.split("、")[0]; // 提取「一」「二」「三」等
      return chunk.section.startsWith(sectionNum);
    });
  });
  
  if (filteredChunks.length === 0) return "";
  
  const tf = new Map<string, number>();
  for (const tok of tokenize(query)) {
    tf.set(tok, (tf.get(tok) ?? 0) + 1);
  }
  
  const scored = filteredChunks
    .map(ch => ({ ch, s: scoreChunk(tf, ch) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, topK)
    .map(x => x.ch.text);
  
  return scored.join("\n\n");
}

buildKbIndex();

// 將文字截斷到指定長度（以避免 prompt 過長）
function trimContext(text: string, maxChars: number): string {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(0, maxChars - 20)) + "\n...（後略）";
}

interface GenerateRequest {
  topic: string;
  targetAudience: string;
  goal: string;
  platform: string;
  style?: string;
}

interface GenerateResponse {
  positioning: string;
  topics: string;
  script: string;
}

/**
 * 呼叫 Gemini API 生成短影音內容
 * 輸出規範:
 * - 不使用 Markdown 粗體符號 ** 或 __
 * - 全部輸出為純文字
 * - 不加 Markdown 標題符號 (#、##)
 * - 列點格式用「•」或「-」,不用 *
 * - 可使用 emoji 和自然語言
 */
export async function generateContent(request: GenerateRequest): Promise<GenerateResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const userQuery = [
    request.topic,
    request.targetAudience,
    request.goal,
    request.platform,
    request.style ?? "",
  ].filter(Boolean).join(" \n ");

  // —— 併發限制（避免多人同時使用時觸發 503）——
  // 注意：由於改為串行執行，這裡主要防止多個用戶同時請求
  const MAX_CONCURRENT = 1; // 串行模式下，每個用戶的請求也是串行的，所以設為 1
  let active = (globalThis as any).__gemini_active__ || 0;
  const setActive = (v: number) => ((globalThis as any).__gemini_active__ = v);
  
  async function withSemaphore<T>(fn: () => Promise<T>): Promise<T> {
    while (active >= MAX_CONCURRENT) {
      await new Promise(resolve => setTimeout(resolve, 500)); // 增加等待間隔
    }
    active += 1;
    setActive(active);
    try {
      // 在請求前加一個小延遲，避免同時發送
      await new Promise(resolve => setTimeout(resolve, 100));
      return await fn();
    } finally {
      active -= 1;
      setActive(active);
    }
  }

  // 配置 axios 實例（統一的重試與錯誤處理）
  const axiosInstance = axios.create({
    timeout: AXIOS_TIMEOUT_MS,
    headers: { "Content-Type": "application/json" },
  });

  // 重試機制：自動處理 503/429/500 和網路錯誤
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // 確保 config 存在（某些錯誤可能沒有 config）
      if (!error.config) {
        return Promise.reject(error);
      }
      
      const config = error.config;
      const status = error.response?.status;
      const errorCode = error.code;
      
      // 判斷是否是可重試的錯誤
      const isRetryableError = 
        status === 503 || 
        status === 429 || 
        status === 500 ||
        errorCode === 'EAI_AGAIN' ||
        errorCode === 'ENOTFOUND' ||
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ECONNRESET' ||
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('timeout') ||
        (error.cause && (error.cause.code === 'EAI_AGAIN' || error.cause.code === 'ENOTFOUND'));
      
      if (!isRetryableError) {
        return Promise.reject(error);
      }
      
      // 取得當前重試次數（如果沒有則初始化）
      config.__retryCount = config.__retryCount || 0;
      
      // 503/429 錯誤重試更多次（最多 6 次），其他錯誤 3 次
      const maxRetries = (status === 503 || status === 429) ? 6 : 3;
      
      // 如果未超過重試次數，則重試
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        
        // 503/429 用更長的延遲（指數退避 + 隨機抖動）
        // 對於 503，延遲更長：5秒、10秒、15秒、20秒、25秒、30秒
        const baseDelay = (status === 503 || status === 429) 
          ? 5000 * config.__retryCount  // 5秒、10秒、15秒、20秒、25秒、30秒
          : 1500 * config.__retryCount; // 1.5秒、3秒、4.5秒
        // 加入隨機抖動（±20%），避免所有請求同時重試
        const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
        const delay = Math.max(2000, baseDelay + jitter); // 最少 2 秒
        
        const errorMsg = error.response?.data?.error?.message || error.message || 'Unknown error';
        console.warn(
          `[Gemini] ${status ? `HTTP ${status}` : `Network (${errorCode})`} error, retrying (${config.__retryCount}/${maxRetries}) after ${Math.round(delay)}ms...`,
          errorMsg.substring(0, 100)
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 重試請求（使用相同的 config）
        return axiosInstance(config);
      }
      
      // 超過重試次數，記錄失敗
      console.error(`[Gemini] Failed after ${config.__retryCount} retries:`, {
        status,
        code: errorCode,
        message: error.response?.data?.error?.message || error.message,
      });
      
      return Promise.reject(error);
    }
  );

  // 單段生成函數（帶併發限制）
  async function generateSegment(
    prompt: string, 
    maxTokens: number, 
    segmentName: string
  ): Promise<string> {
    try {
      const response = await withSemaphore(() =>
        axiosInstance.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
            maxOutputTokens: maxTokens,
          },
        })
      );

      const data = response.data;
      
      // 詳細日誌：查看 API 回應結構
      console.log(`[Gemini] ${segmentName} API response structure:`, JSON.stringify({
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        firstCandidate: data.candidates?.[0] ? {
          finishReason: data.candidates[0].finishReason,
          hasContent: !!data.candidates[0].content,
          hasParts: !!data.candidates[0].content?.parts,
          partsLength: data.candidates[0].content?.parts?.length || 0,
          partsTypes: data.candidates[0].content?.parts?.map((p: any) => typeof p?.text) || [],
        } : null,
      }, null, 2));
    
      // 檢查是否有候選回應
      if (!data.candidates || data.candidates.length === 0) {
        console.warn(`[Gemini] ${segmentName}: No candidates, returning placeholder`);
        return `[${segmentName}] 生成失敗，請稍後再試。`;
      }

      const candidate = data.candidates[0];
      const finishReason = candidate?.finishReason;
      
      // 允許 MAX_TOKENS（可能還有部分內容）
      if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
        console.warn(`[Gemini] ${segmentName}: Stopped with reason ${finishReason}`);
      }

      // 提取文字內容（嘗試多種格式）
      const parts = candidate?.content?.parts;
      if (Array.isArray(parts) && parts.length > 0) {
        const text = parts
          .map((p: any) => {
            // 檢查不同的文字欄位
            if (typeof p?.text === "string") return p.text;
            if (typeof p?.text?.content === "string") return p.text.content;
            return "";
          })
          .filter(Boolean)
          .join("\n")
          .trim();
        
        if (text) {
          console.log(`[Gemini] ${segmentName}: Generated ${text.length} chars`);
          return text;
        }
      }
      
      // 如果 parts 是空的，嘗試直接從 candidate 提取
      const directText = candidate?.content?.text || candidate?.text;
      if (directText && typeof directText === "string") {
        console.log(`[Gemini] ${segmentName}: Generated ${directText.length} chars (direct text)`);
        return directText.trim();
      }

      // 如果沒有內容，返回占位訊息
      console.warn(`[Gemini] ${segmentName}: No text content, returning placeholder. FinishReason: ${finishReason}`);
      console.warn(`[Gemini] ${segmentName}: Full candidate structure:`, JSON.stringify(candidate, null, 2));
      return finishReason === "MAX_TOKENS" 
        ? `[${segmentName}] 內容達到長度限制，請稍後再試。`
        : `[${segmentName}] 生成失敗，請稍後再試。`;
    } catch (error: any) {
      // 記錄錯誤（但不拋出，返回佔位內容）
      const retryCount = error.config?.__retryCount || 0;
      const errorCode = error.response?.status || error.code;
      const errorMessage = error.response?.data?.error?.message || error.message || '';
      
      if (retryCount > 0) {
        console.error(`[Gemini] ${segmentName} error after ${retryCount} retries:`, {
          code: errorCode,
          message: errorMessage.substring(0, 100),
          status: error.response?.status,
        });
      } else {
        console.error(`[Gemini] ${segmentName} error:`, {
          code: errorCode,
          message: errorMessage.substring(0, 100),
          status: error.response?.status,
        });
      }
      
      // 永遠不拋錯，返回友善的佔位內容
      if (errorCode === 503 || errorMessage.includes('overloaded')) {
        return `${segmentName === "Positioning" ? "帳號定位" : segmentName === "Topics" ? "選題建議" : "腳本範例"}：系統目前較為忙碌，請稍後再試。`;
      }
      
      if (errorCode === 429) {
        return `${segmentName === "Positioning" ? "帳號定位" : segmentName === "Topics" ? "選題建議" : "腳本範例"}：請求過於頻繁，請稍後再試。`;
      }
      
      // 網路錯誤
      if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
        return `${segmentName === "Positioning" ? "帳號定位" : segmentName === "Topics" ? "選題建議" : "腳本範例"}：網絡連接問題，請稍後再試。`;
      }
      
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        return `${segmentName === "Positioning" ? "帳號定位" : segmentName === "Topics" ? "選題建議" : "腳本範例"}：請求超時，請稍後再試。`;
      }
      
      // 其他錯誤都返回友善訊息
      return `${segmentName === "Positioning" ? "帳號定位" : segmentName === "Topics" ? "選題建議" : "腳本範例"}：生成過程中遇到問題，請稍後再試。`;
    }
  }

  // RAG：為三段分別檢索知識庫內容
  const positioningContext = trimContext(retrieveContext(userQuery, "positioning", 3), 800);
  const topicsContext = trimContext(retrieveContext(userQuery, "topics", 3), 900);
  const scriptContext = trimContext(retrieveContext(userQuery, "script", 5), 1400);
  
  console.log(`[Gemini] RAG Context - P:${positioningContext.length}, T:${topicsContext.length}, S:${scriptContext.length}`);

  // 使用者輸入資訊（每段都會使用）
  const userInput = `使用者需求：
- 主題/產品：${request.topic}
- 目標受眾：${request.targetAudience}
- 影片目標：${request.goal}
- 社群平台：${request.platform}${request.style ? `\n- 補充說明：${request.style}` : ""}`;

  const formatGuide = `\n\n語氣與格式要求：口語自然、短句換行；可少量使用 emoji；禁止任何 Markdown 標記（**、#、##）。`;

  // 三段獨立的 prompt（每段都明確包含使用者需求與對應知識庫）
  const positioningPrompt = `${userInput}${formatGuide}

請根據以上使用者需求，結合以下知識庫內容，輸出「帳號定位內容」：
${positioningContext || "（無相關知識庫內容）"}

請直接輸出定位內容，必須針對「${request.topic}」的主題、「${request.targetAudience}」的受眾、「${request.goal}」的目標，包含：受眾洞察、定位建議、風格調性、競爭優勢、具體行動建議。`;
  
  const topicsPrompt = `${userInput}${formatGuide}

請根據以上使用者需求，結合以下知識庫內容，輸出 3–5 個「選題建議」：
${topicsContext || "（無相關知識庫內容）"}

請針對「${request.topic}」的主題、「${request.goal}」的目標、「${request.platform}」的平台特性，每個選題包含：標題、具體建議、策略/技巧、內容規劃、時程建議。`;
  
  const scriptPrompt = `${userInput}${formatGuide}

請根據以上使用者需求，結合以下知識庫內容，輸出「完整的 30 秒腳本範例」：
${scriptContext || "（無相關知識庫內容）"}

請針對「${request.topic}」的主題、「${request.targetAudience}」的受眾、「${request.goal}」的目標、「${request.platform}」的平台特性${request.style ? `、「${request.style}」的風格要求` : ""}，包含：主題標題、Hook、Value、CTA、畫面感、發佈文案。`;

  // 方案C：三段串行生成（避免同時發送多個請求觸發 rate limit）
  // 串行執行可以避免觸發 Gemini API 的 rate limit
  console.log("[Gemini] Starting 3-segment generation (positioning, topics, script) - sequential mode...");
  
  let positioning: string;
  let topics: string;
  let script: string;
  
  // 串行執行：一個完成後再執行下一個
  try {
    positioning = await generateSegment(positioningPrompt, 1200, "Positioning");
    console.log("[Gemini] Positioning completed, waiting 1s before next segment...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // 請求間延遲 1 秒
  } catch (error: any) {
    console.error("[Gemini] Positioning segment error (fallback):", error.message?.substring(0, 50));
    positioning = "帳號定位：生成過程中遇到問題，請稍後再試。";
  }
  
  try {
    topics = await generateSegment(topicsPrompt, 1500, "Topics");
    console.log("[Gemini] Topics completed, waiting 1s before next segment...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // 請求間延遲 1 秒
  } catch (error: any) {
    console.error("[Gemini] Topics segment error (fallback):", error.message?.substring(0, 50));
    topics = "選題建議：生成過程中遇到問題，請稍後再試。";
  }
  
  try {
    script = await generateSegment(scriptPrompt, 2000, "Script");
  } catch (error: any) {
    console.error("[Gemini] Script segment error (fallback):", error.message?.substring(0, 50));
    script = "腳本範例：生成過程中遇到問題，請稍後再試。";
  }

  console.log(`[Gemini] Generation completed - P:${positioning.length}, T:${topics.length}, S:${script.length} chars`);

  // 永遠返回結果，不拋錯
  return {
    positioning: positioning || "帳號定位：生成失敗，請稍後再試。",
    topics: topics || "選題建議：生成失敗，請稍後再試。",
    script: script || "腳本範例：生成失敗，請稍後再試。",
  };
}

/**
 * 解析 Gemini 生成的內容,使用分隔符號提取三個部分
 */
function parseGeneratedContent(text: string): GenerateResponse {
  let positioning = "";
  let topics = "";
  let script = "";
  
  // 使用分隔符號提取內容
  const positioningMatch = text.match(/===POSITIONING_START===([\s\S]*?)===POSITIONING_END===/);  
  const topicsMatch = text.match(/===TOPICS_START===([\s\S]*?)===TOPICS_END===/);  
  const scriptMatch = text.match(/===SCRIPT_START===([\s\S]*?)===SCRIPT_END===/);  
  
  if (positioningMatch) {
    positioning = positioningMatch[1].trim();
  }
  
  if (topicsMatch) {
    topics = topicsMatch[1].trim();
  }
  
  if (scriptMatch) {
    script = scriptMatch[1].trim();
  }
  
  // 如果使用分隔符號解析失敗,嘗試備用方案
  if (!positioning || !topics || !script) {
    console.warn("[Gemini] Failed to parse with delimiters, trying fallback method");
    
    // 備用方案:根據關鍵字分段
    const lines = text.split('\n');
    let currentSection = "";
    let positioningLines: string[] = [];
    let topicsLines: string[] = [];
    let scriptLines: string[] = [];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes("帳號定位") || lowerLine.includes("定位建議")) {
        currentSection = "positioning";
        continue;
      } else if (lowerLine.includes("選題建議") || lowerLine.includes("熱門選題")) {
        currentSection = "topics";
        continue;
      } else if (lowerLine.includes("腳本範例") || lowerLine.includes("完整腳本")) {
        currentSection = "script";
        continue;
      }
      
      if (currentSection === "positioning" && line.trim()) {
        positioningLines.push(line);
      } else if (currentSection === "topics" && line.trim()) {
        topicsLines.push(line);
      } else if (currentSection === "script" && line.trim()) {
        scriptLines.push(line);
      }
    }
    
    if (!positioning && positioningLines.length > 0) {
      positioning = positioningLines.join('\n');
    }
    if (!topics && topicsLines.length > 0) {
      topics = topicsLines.join('\n');
    }
    if (!script && scriptLines.length > 0) {
      script = scriptLines.join('\n');
    }
  }
  
  return {
    positioning: positioning || "生成失敗,請重試",
    topics: topics || "生成失敗,請重試",
    script: script || "生成失敗,請重試",
  };
}
