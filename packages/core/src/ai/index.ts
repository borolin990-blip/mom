import type { Env } from "@mom/config";
import type { AIProvider } from "./provider.interface";
import { MockAIProvider } from "./providers/mock.provider";
import { OpenAIProvider } from "./providers/openai.provider";

export * from "./provider.interface";
export * from "./schemas/content-plan";
export { CONTENT_PLAN_PROMPT_VERSION } from "./prompts/registry";

/**
 * Resolve the configured AI provider. This factory is the only place that
 * decides which implementation to use; callers depend on the AIProvider
 * interface alone.
 */
export function getAIProvider(env: Env): AIProvider {
  switch (env.AI_PROVIDER) {
    case "openai":
      if (!env.OPENAI_API_KEY) {
        throw new Error("AI_PROVIDER=openai but OPENAI_API_KEY is not set.");
      }
      return new OpenAIProvider({
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL,
      });
    case "mock":
    default:
      return new MockAIProvider();
  }
}
