import type {
  AIProvider,
  GenerateContentPlanInput,
} from "../provider.interface";
import { buildContentPlanMessages } from "../prompts/registry";
import {
  type ContentPlan,
  contentPlanSchema,
} from "../schemas/content-plan";

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
    if (!content) {
      throw new Error("OpenAI response contained no content.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("OpenAI returned invalid JSON.");
    }

    // Trust nothing until it matches the contract.
    return contentPlanSchema.parse(parsed);
  }
}
