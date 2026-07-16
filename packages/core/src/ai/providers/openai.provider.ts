import type {
  AIProvider,
  BuildKnowledgeInput,
  ContentIdeasInput,
  GenerateContentPlanInput,
} from "../provider.interface";
import {
  buildContentIdeasMessages,
  buildContentPlanMessages,
  buildKnowledgeMessages,
} from "../prompts/registry";
import {
  type ContentPlan,
  contentPlanSchema,
} from "../schemas/content-plan";
import {
  type BusinessKnowledge,
  businessKnowledgeSchema,
} from "../schemas/knowledge";
import { type ContentIdea, contentIdeasSchema } from "../schemas/ideas";

/**
 * OpenAI-backed provider. Implemented with plain `fetch` to avoid a heavy SDK
 * dependency and keep the abstraction thin. Enabled by AI_PROVIDER=openai +
 * OPENAI_API_KEY. Output is validated against the shared schema before it ever
 * reaches the rest of the app.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly model: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(opts: {
    apiKey: string;
    model?: string;
    baseUrl?: string;
  }) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? "gpt-4o-mini";
    this.baseUrl = opts.baseUrl ?? "https://api.openai.com/v1";
  }

  async generateContentPlan(
    input: GenerateContentPlanInput,
  ): Promise<ContentPlan> {
    const { system, user } = buildContentPlanMessages(input);
    const parsed = await this.complete(system, user);
    return contentPlanSchema.parse(parsed);
  }

  async generateBusinessKnowledge(
    input: BuildKnowledgeInput,
  ): Promise<BusinessKnowledge> {
    const { system, user } = buildKnowledgeMessages(input);
    const parsed = await this.complete(system, user);
    return businessKnowledgeSchema.parse(parsed);
  }

  async generateContentIdeas(
    input: ContentIdeasInput,
  ): Promise<ContentIdea[]> {
    const { system, user } = buildContentIdeasMessages(input);
    // Ask for an object wrapper so json_object mode is satisfied, then unwrap.
    const parsed = await this.complete(
      system,
      `${user}\n\nReturn the array under an "ideas" key: { "ideas": [...] }.`,
    );
    const arr =
      parsed && typeof parsed === "object" && "ideas" in parsed
        ? (parsed as { ideas: unknown }).ideas
        : parsed;
    return contentIdeasSchema.parse(arr);
  }

  /** Single place that talks to the API; returns parsed JSON. */
  private async complete(system: string, user: string): Promise<unknown> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `OpenAI request failed (${res.status}): ${detail.slice(0, 500)}`,
      );
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI response contained no content.");

    try {
      return JSON.parse(content);
    } catch {
      throw new Error("OpenAI returned invalid JSON.");
    }
  }
}
