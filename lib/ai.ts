
const MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3-8b-instruct:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "mistralai/mistral-7b-instruct:free"
];

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
        // If 429 (Rate Limit) or 5xx (Server Error), we definitely want to try the next one.
        console.warn(`⚠️ Model ${model} failed: ${response.status} - ${errText.substring(0, 200)}...`);
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
