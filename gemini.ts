import { readFileSync } from "fs";
import { join } from "path";
import axios from "axios";
import { AXIOS_TIMEOUT_MS } from "@shared/const";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

// 載入知識庫
let knowledgeBase: string = "";
try {
  knowledgeBase = readFileSync(join(process.cwd(), "kb.txt"), "utf-8");
} catch (error) {
  console.error("[Gemini] Failed to load knowledge base:", error);
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

  const prompt = `你是 Reelmind AI 短影音顧問,專門幫助創作者打造爆款短影音內容。

以下是你的專業知識庫:
${knowledgeBase}

用戶需求:
- 主題或產品: ${request.topic}
- 目標受眾: ${request.targetAudience}
- 影片目標: ${request.goal}
- 社群平台: ${request.platform}
${request.style ? `- 補充說明: ${request.style}` : ""}

請根據知識庫內容,為用戶生成以下三個部分。

重要:請嚴格按照以下格式輸出,使用「===」作為分隔符號:

===POSITIONING_START===
[帳號定位內容]

分段清楚，短句，每段換行，適度加入表情符號。

包含以下內容:
1. 目標受眾分析
2. 內容定位建議
3. 風格調性建議
4. 競爭優勢分析
5. 具體執行建議
===POSITIONING_END===

===TOPICS_START===
[選題建議]

分段清楚，短句，每段換行，適度加入表情符號。

提供 3-5 個熱門選題方向，每個選題包含:
1. 選題標題
2. 具體建議
3. 選題策略和技巧
4. 內容規劃建議
5. 執行時程建議
===TOPICS_END===

===SCRIPT_START===
[完整的30秒腳本範例]

分段清楚，短句，每段換行，適度加入表情符號。

包含以下結構:
1. 主題標題
2. Hook（開場鉤子）
3. Value（核心價值內容）
4. CTA（行動呼籲）
5. 畫面感描述
6. 發佈文案
===SCRIPT_END===

格式要求（非常重要）:
- 分段清楚，短句，每段換行
- 適度加入表情符號
- 絕對不要使用 ** 或任何 Markdown 格式符號
- 不要使用 # ## ### 等標題符號
- 列點使用「•」或「-」
- 用自然、口語化的方式表達
- 保持專業但親切的語氣
- 避免口頭禪

請嚴格按照上述格式生成，不要有任何前言或解釋。直接開始輸出 ===POSITIONING_START===。`;

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
        
        // 如果是網絡錯誤（DNS、連接等），進行重試
        if (
          !config?.__retryCount &&
          (error.code === 'EAI_AGAIN' ||
           error.code === 'ENOTFOUND' ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ECONNRESET' ||
           error.message?.includes('getaddrinfo') ||
           error.message?.includes('timeout') ||
           (error.cause && (error.cause.code === 'EAI_AGAIN' || error.cause.code === 'ENOTFOUND')))
        ) {
          config.__retryCount = config.__retryCount || 0;
          config.__retryCount += 1;
          
          if (config.__retryCount <= 3) {
            const delay = 1000 * config.__retryCount; // 指數退避
            console.warn(`[Gemini] Network error, retrying (${config.__retryCount}/3) after ${delay}ms...`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
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
          maxOutputTokens: 8192,
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

    // 檢查是否被安全過濾器阻擋
    const candidate = data.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.error("[Gemini] Generation stopped with reason:", candidate.finishReason);
      throw new Error(`Content generation stopped: ${candidate.finishReason}`);
    }
    
    const generatedText = candidate?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      console.error("[Gemini] No text content in response. Full response:", JSON.stringify(data, null, 2));
      throw new Error("No content generated from Gemini API");
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
      throw new Error(`Gemini API 錯誤 (${status} ${statusText}): ${errorMessage || '請稍後再試'}`);
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
