const SYSTEM_PROMPT = `You are a strict JSON generator.

Return ONLY valid JSON matching this schema:
{
  "club": "d|md|3w|4w|5w|6w|2h|3h|4h|5h|6h|7h|3i|4i|5i|6i|7i|8i|9i|pw|gw|sw|lw" or null,
  "swingEffortPercentage": Int or null,
  "carryDistanceAchieved": Int or null,
  "totalDistanceAchieved": Int or null,
  "slope": "veryUphill" | "slightlyUphill" | "flat" | "slightlyDownhill" | "veryDownhill" or null,
  "wind": "calm" | "slightHeadwind" | "strongHeadwind" | "slightTailwind" | "strongTailwind" or null
}

Rules:
- Use ONLY the club IDs listed. d=Driver, md=Mini Driver, w=Wood, h=Hybrid, i=Iron, pw/gw/sw/lw=wedges.
- 52 degree wedge -> gw. 54 or 56 degree -> sw. 60 degree -> lw.
- Output ONLY JSON. No markdown, no explanation.`;

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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://caddy.app",
        "X-Title": "Caddy"
      },
      body: JSON.stringify({
        model: model || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Convert this golf shot into structured JSON:\n\n"${text}"` }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 502, body: `OpenRouter error: ${errText}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { statusCode: 502, body: "No content returned by model." };

    const parsed = JSON.parse(content);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) };
  } catch (err) {
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
};
