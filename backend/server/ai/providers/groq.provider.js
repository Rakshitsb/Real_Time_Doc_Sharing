import env from "../../config/env.js";
import ApiError from "../../utils/ApiError.js";
import HTTP_STATUS from "../../constants/httpStatus.js";

const readOutputText = (payload) => {
  if (payload.output_text) return payload.output_text;

  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
};

const createGroqProvider = () => ({
  name: "groq",
  async complete({ system, input, maxOutputTokens = 900 }) {
    if (!env.groqApiKey) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "AI provider is not configured. Add GROQ_API_KEY to the backend environment."
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.aiTimeoutMs);

    try {
      const response = await fetch(`${env.groqBaseUrl}/responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.groqModel,
          input: [
            { role: "system", content: system },
            { role: "user", content: input },
          ],
          max_output_tokens: maxOutputTokens,
        }),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(
          response.status,
          payload.error?.message || "AI provider request failed"
        );
      }

      return {
        text: readOutputText(payload),
        usage: payload.usage || null,
        model: payload.model || env.groqModel,
      };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "AI request timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },
});

export default createGroqProvider;
