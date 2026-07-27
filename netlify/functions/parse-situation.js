const SYSTEM_PROMPT = `You are a strict JSON generator.

Return ONLY valid JSON matching this schema:
{
  "carryDistanceRequired": Int or null,
  "totalDistanceRequired": Int or null,
  "slope": "veryUphill" | "slightlyUphill" | "flat" | "slightlyDownhill" | "veryDownhill" or null,
  "wind": "calm" | "slightHeadwind" | "strongHeadwind" | "slightTailwind" | "strongTailwind" or null,
  "lie": "tee" | "fairway" | "rough" | "deepRough" | "bunker" or null,
  "preferredMiss": "long" | "short" or null
}

Rules:
- If only one number is given, assume it is carry distance.
- Output ONLY JSON. No markdown, no explanation, no <think> tags, no reasoning before or after.`;

/** Strips markdown code fences some models wrap JSON in despite instructions not to. */
function stripFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "Server is missing OPENROUTER_API_KEY." };
  }

  try {
    const { text, model } = JSON.parse(event.body || "{}");
    if (!text) return { statusCode: 400, body: "Missing 'text'." };

    const chosenModel = model || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://caddy.app",
        "X-Title": "Caddy"
      },
      body: JSON.stringify({
        model: chosenModel,
        temperature: 0,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Convert this golf situation into structured JSON:\n\n"${text}"` }
        ]
      })
    });

    const raw = await response.text();

    if (!response.ok) {
      return { statusCode: 502, body: `OpenRouter error (${response.status}): ${raw.slice(0, 500)}` };
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return { statusCode: 502, body: `OpenRouter returned non-JSON: ${raw.slice(0, 500)}` };
    }

    if (data.error) {
      return { statusCode: 502, body: `OpenRouter error: ${JSON.stringify(data.error).slice(0, 500)}` };
    }

    const choice = data.choices?.[0];
    const content = choice?.message?.content || choice?.message?.reasoning || choice?.message?.reasoning_content;

    if (!content || !content.trim()) {
      const finishReason = choice?.finish_reason || "unknown";
      return {
        statusCode: 502,
        body: `Model "${chosenModel}" returned no usable content (finish_reason: ${finishReason}). ` +
              `Try a different model in Settings — non-reasoning models tend to be more reliable for short structured output.`
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(stripFences(content));
    } catch {
      return { statusCode: 502, body: `Couldn't parse model output as JSON: ${content.slice(0, 300)}` };
    }

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
};
