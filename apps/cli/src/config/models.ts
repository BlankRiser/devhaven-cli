import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { env } from "./env";

export const LM_STUDIO_MODELS = {
  mistral: "mistral-nemo-instruct-2407",
};

export const OPEN_ROUTER_MODELS = {
  "gemini-2.0": "google/gemini-2.0-flash-001",
};

export const modelProviders = {
  lmstudio: (model: string = LM_STUDIO_MODELS["mistral"]) => {
    const lmstudio = createOpenAICompatible({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
    });

    return lmstudio(model);
  },
  openRouter: ({
    model = OPEN_ROUTER_MODELS["gemini-2.0"],
    apiKey = env.OPEN_ROUTER_API_KEY,
  }: {
    model?: string;
    apiKey?: string;
  }) => {
    const openRouter = createOpenRouter({
      apiKey: apiKey,
    });

    return openRouter(model);
  },
};
