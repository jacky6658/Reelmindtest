import { readFileSync } from "node:fs";
import { join } from "node:path";
import axios from "axios";
import { AXIOS_TIMEOUT_MS } from "@shared/const";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

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

  // 為三個部分分別檢索對應的知識庫內容
  const positioningContext = retrieveContext(userQuery, "positioning", 3);
  const topicsContext = retrieveContext(userQuery, "topics", 3);
  const scriptContext = retrieveContext(userQuery, "script", 5);
  
  // 調試：記錄檢索結果長度
  console.log(`[Gemini] RAG Context lengths - Positioning: ${positioningContext.length}, Topics: ${topicsContext.length}, Script: ${scriptContext.length}`);

  const prompt = `你是短影音顧問。請用自然口語回覆，避免程式碼與任何 Markdown 符號；可少量使用 emoji。

使用者輸入：
- 主題: ${request.topic}
- 受眾: ${request.targetAudience}
- 目標: ${request.goal}
- 平台: ${request.platform}
${request.style ? `- 補充: ${request.style}` : ""}

請嚴格依下列格式輸出三段內容（使用 === 作為分隔）。句子短、逐段換行；列點用 - 或 •；避免口頭禪。

===POSITIONING_START===
[帳號定位內容]（請參考以下知識庫內容）
${positioningContext || "（無相關知識庫內容）"}
- 受眾洞察
- 定位建議
- 風格調性
- 競爭優勢
- 具體行動建議
===POSITIONING_END===

===TOPICS_START===
[選題建議]（請參考以下知識庫內容）
${topicsContext || "（無相關知識庫內容）"}
提供 3-5 個選題；每個包含：標題、具體建議、策略/技巧、內容規劃、時程建議。
===TOPICS_END===

===SCRIPT_START===
[完整的30秒腳本範例]（請參考以下知識庫內容）
${scriptContext || "（無相關知識庫內容）"}
包含：主題標題、Hook、Value、CTA、畫面感、發佈文案。
===SCRIPT_END===

直接開始輸出 ===POSITIONING_START===。`;

  try {
    // 使用 axios 代替 fetch，提供更好的錯誤處理和重試機制
    // 配置 axios 實例，設置超時和重試
    const axiosInstance = axios.create({
      timeout: AXIOS_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 添加響應攔截器來處理錯誤
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        // 檢查是否應該重試（503、429、網絡錯誤等）
        const shouldRetry = 
          !config?.__retryCount &&
          (
            // HTTP 錯誤碼：503（服務不可用/過載）、429（請求過多）、500（伺服器錯誤）
            (error.response?.status === 503 || 
             error.response?.status === 429 || 
             error.response?.status === 500) ||
            // 網絡錯誤（DNS、連接等）
            error.code === 'EAI_AGAIN' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNRESET' ||
            error.message?.includes('getaddrinfo') ||
            error.message?.includes('timeout') ||
            (error.cause && (error.cause.code === 'EAI_AGAIN' || error.cause.code === 'ENOTFOUND'))
          );
        
        if (shouldRetry) {
          config.__retryCount = config.__retryCount || 0;
          config.__retryCount += 1;
          
          if (config.__retryCount <= 3) {
            // 對於 503/429，使用更長的延遲（指數退避 + 額外延遲）
            const baseDelay = error.response?.status === 503 || error.response?.status === 429 
              ? 2000 * config.__retryCount // 2秒、4秒、6秒
              : 1000 * config.__retryCount; // 1秒、2秒、3秒
            console.warn(
              `[Gemini] ${error.response?.status ? `HTTP ${error.response.status}` : 'Network'} error, retrying (${config.__retryCount}/3) after ${baseDelay}ms...`, 
              error.response?.data?.error?.message || error.message
            );
            await new Promise(resolve => setTimeout(resolve, baseDelay));
            return axiosInstance(config);
          }
        }
        
        return Promise.reject(error);
      }
    );

    const response = await axiosInstance.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096, // 降低到 4096 以確保有足夠空間生成內容
        },
      }
    );

    const data = response.data;
    console.log("[Gemini] API response:", JSON.stringify(data, null, 2));
    
    // 檢查是否有候選回應
    if (!data.candidates || data.candidates.length === 0) {
      console.error("[Gemini] No candidates in response. Full response:", JSON.stringify(data, null, 2));
      throw new Error("No candidates returned from Gemini API");
    }

    // 檢查候選回應
    const candidate = data.candidates[0];
    const finishReason = candidate?.finishReason;
    
    // 只對真正的錯誤拋錯（安全過濾等），MAX_TOKENS 允許繼續處理（可能還有部分內容）
    if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
      console.error("[Gemini] Generation stopped with reason:", finishReason);
      throw new Error(`Content generation stopped: ${finishReason}`);
    }
    
    // 如果是 MAX_TOKENS，記錄警告但繼續處理
    if (finishReason === "MAX_TOKENS") {
      console.warn("[Gemini] Response was truncated due to MAX_TOKENS, attempting to extract partial content...");
    }

    // 優先聚合所有 parts 文字（有些回應會拆多個 parts）
    let generatedText = "";
    const parts = candidate?.content?.parts;
    if (Array.isArray(parts) && parts.length > 0) {
      generatedText = parts
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .filter(Boolean)
        .join("\n")
        .trim();
    }

    // 若沒有 parts 或文字，嘗試從所有 candidates 聚合文字
    if (!generatedText && Array.isArray(data.candidates)) {
      generatedText = data.candidates
        .flatMap((c: any) => (Array.isArray(c?.content?.parts) ? c.content.parts : []))
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .filter(Boolean)
        .join("\n")
        .trim();
    }

    // 若仍無文字，且為 MAX_TOKENS 或內容缺失，回傳可用的占位內容而非直接丟錯
    if (!generatedText) {
      console.warn("[Gemini] No text content parsed – finishReason:", finishReason, "content.parts:", candidate?.content?.parts);
      console.warn("[Gemini] Returning partial placeholders instead of throwing error.");
      const partialMessage =
        finishReason === "MAX_TOKENS" 
          ? "生成內容時達到長度限制，請稍後再試或減少輸入長度。"
          : "內容生成失敗，請稍後再試。";
      return {
        positioning: partialMessage,
        topics: partialMessage,
        script: partialMessage,
      };
    }

    // 解析生成的內容,分割成三個部分
    const result = parseGeneratedContent(generatedText);
    return result;
  } catch (error: any) {
    console.error("[Gemini] Generation error:", error);
    
    // 提供更友好的錯誤訊息
    const cause = error.cause || {};
    const errorCode = error.code || cause.code || error.response?.status;
    const errorMessage = error.message || cause.message || error.response?.data?.error?.message || '';
    
    // 處理網絡/DNS 錯誤
    if (errorCode === 'EAI_AGAIN' || errorCode === 'ENOTFOUND' || errorMessage.includes('getaddrinfo')) {
      throw new Error("無法連接到 Gemini API，請檢查網絡連接或稍後再試。如果問題持續，請聯繫管理員。");
    }
    
    // 處理超時錯誤
    if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNABORTED' || errorMessage.includes('timeout')) {
      throw new Error("請求超時，請稍後再試。");
    }
    
    // 處理連接重置錯誤
    if (errorCode === 'ECONNRESET' || errorMessage.includes('reset')) {
      throw new Error("連接被重置，請稍後再試。");
    }
    
    // 處理 HTTP 錯誤響應
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText || '';
      const apiError = error.response.data?.error;
      
      // 特別處理 503 錯誤（模型過載）
      if (status === 503) {
        throw new Error("Gemini 模型目前過載，請稍後再試。如果問題持續，可能是 Google API 服務暫時不可用。");
      }
      
      // 處理 429 錯誤（請求過多）
      if (status === 429) {
        throw new Error("請求過於頻繁，請稍後再試。");
      }
      
      // 處理其他 HTTP 錯誤
      throw new Error(`Gemini API 錯誤 (${status} ${statusText}): ${apiError?.message || errorMessage || '請稍後再試'}`);
    }
    
    // 處理其他網絡錯誤
    if (errorMessage.includes('Network Error') || errorMessage.includes('network')) {
      throw new Error("網絡請求失敗，請檢查網絡連接或稍後再試。");
    }
    
    throw error;
  }
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
