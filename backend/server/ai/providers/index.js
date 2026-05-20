import env from "../../config/env.js";
import createGroqProvider from "./groq.provider.js";

const getAiProvider = () => {
  if (env.aiProvider === "groq") {
    return createGroqProvider();
  }

  return createGroqProvider();
};

export default getAiProvider;
