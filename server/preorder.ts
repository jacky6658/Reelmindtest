/**
 * Preorder submission handler
 * - Writes data to Google Sheets
 * - Sends webhook to n8n for automation
 */

interface PreorderData {
  email: string;
  teamSize: string;
  useCase: string;
  additionalInfo?: string;
}

const GOOGLE_SHEETS_ID = "1D7mQgVJEFYvKzSjorVRjPQo6bDC8fQK4FMqEJguEet4";
const GOOGLE_API_KEY = "AIzaSyChvuiJO57ULSWN9meXtyGQm7cWenBGlrM";
const N8N_WEBHOOK_URL = "https://aicraft.app.n8n.cloud/webhook/feb1666a-2356-4e03-8b10-43fdce3514e4";

/**
 * Write data to Google Sheets
 * Note: This uses the simple append API which requires the sheet to be publicly writable
 * For production, consider using Service Account authentication
 */
async function writeToGoogleSheets(data: PreorderData): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      data.email,
      data.teamSize,
      data.useCase,
      data.additionalInfo || "",
    ];

    // Using Google Sheets API v4 - append values
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_ID}/values/A:E:append?valueInputOption=RAW&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Google Sheets] Write failed:", error);
      return false;
    }

    console.log("[Google Sheets] Data written successfully");
    return true;
  } catch (error) {
    console.error("[Google Sheets] Error:", error);
    return false;
  }
}

/**
 * Send webhook to n8n for automation
 */
async function sendWebhook(data: PreorderData): Promise<boolean> {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      email: data.email,
      teamSize: data.teamSize,
      useCase: data.useCase,
      additionalInfo: data.additionalInfo || "",
      source: "reelmind_advisor_preorder",
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("[n8n Webhook] Send failed:", response.statusText);
      return false;
    }

    console.log("[n8n Webhook] Sent successfully");
    return true;
  } catch (error) {
    console.error("[n8n Webhook] Error:", error);
    return false;
  }
}

/**
 * Handle preorder submission
 * - Writes to Google Sheets
 * - Sends webhook to n8n
 * - Returns success status
 */
export async function handlePreorderSubmission(data: PreorderData): Promise<{
  success: boolean;
  sheetsWritten: boolean;
  webhookSent: boolean;
}> {
  console.log("[Preorder] Processing submission:", data.email);

  // Execute both operations in parallel
  const [sheetsWritten, webhookSent] = await Promise.all([
    writeToGoogleSheets(data),
    sendWebhook(data),
  ]);

  const success = sheetsWritten && webhookSent;

  console.log("[Preorder] Result:", {
    success,
    sheetsWritten,
    webhookSent,
  });

  return {
    success,
    sheetsWritten,
    webhookSent,
  };
}
