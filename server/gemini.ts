import { readFileSync } from "fs";
import { join } from "path";

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
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Gemini] API error:", errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[Gemini] API response:", JSON.stringify(data, null, 2));
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      console.error("[Gemini] No content in response. Full response:", JSON.stringify(data, null, 2));
      throw new Error("No content generated from Gemini API");
    }

    // 解析生成的內容,分割成三個部分
    const result = parseGeneratedContent(generatedText);
    return result;
  } catch (error) {
    console.error("[Gemini] Generation error:", error);
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
