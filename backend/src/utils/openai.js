import OpenAI from "openai";

let client = null;

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("AI service is not configured (missing GROQ_API_KEY).");
    err.statusCode = 503;
    err.isOperational = true;
    throw err;
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return client;
};


export const createChatCompletion = async ({
  systemPrompt,
  userPrompt,
  json = true,
  model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature = 0.2,
  maxTokens = 600,
}) => {
  const openai = getClient(); // throws a clean 503 here if unconfigured

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      response_format: json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return json ? safeJsonParse(content) : content;
  } catch (error) {
    if (error.statusCode === 503) throw error; // our own "not configured" error, pass through

    const errorCode = error?.error?.code || error?.code;
    let message = "AI service failed to process the request.";
    let statusCode = 502;

    if (errorCode === "insufficient_quota" || errorCode === "rate_limit_exceeded") {
      message =
        errorCode === "insufficient_quota"
          ? "AI provider has no available quota. Check the Groq account's usage/limits."
          : "AI service is currently rate-limited. Please try again shortly.";
      statusCode = 429;
    } else if (error?.status === 429) {
      message = "AI service is currently rate-limited. Please try again shortly.";
      statusCode = 429;
    }

    const err = new Error(message);
    err.statusCode = statusCode;
    err.isOperational = true;
    err.cause = error;
    throw err;
  }
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error("AI service returned an unparseable response.");
    err.statusCode = 502;
    err.isOperational = true;
    throw err;
  }
};