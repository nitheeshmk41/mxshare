// Model fallback order (lightweight free models first). Override via OPENROUTER_MODELS="model1,model2"
const DEFAULT_MODELS = [
  // Free, widely available
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
  "mistralai/mixtral-8x7b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "amazon/nova-2-lite-v1:free",
  
  // Paid, high quality
  "baai/bge-large-en-v1.5"
];

const MODELS = process.env.OPENROUTER_MODELS
  ? process.env.OPENROUTER_MODELS.split(",").map((m) => m.trim()).filter(Boolean)
  : DEFAULT_MODELS;

export async function fetchAICompletion(messages: any[], max_tokens = 300) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("API key not configured");

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying AI model: ${model}...`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.URL || "https://mxshare.vercel.app",
          "X-Title": "MXShare",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`⚠️ Model ${model} failed: ${response.status} - ${errText.substring(0, 200)}...`);
        // Always continue to the next model on non-2xx
        throw new Error(`Provider failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error("Empty response from model");
      }
      
      return content;
    } catch (err) {
      lastError = err;
      // Continue to next model
    }
  }

  throw lastError || new Error("All AI models failed");
}

// Remove provider markers like <s>, </s>, [OST], [/OST] and collapse whitespace
export function cleanAIText(text: string) {
  return text
    .replace(/<\/?s>/gi, " ")
    .replace(/\[\/?OST\]/gi, " ")
    .replace(/\[?OST\]?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
