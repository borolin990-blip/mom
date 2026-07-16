import { z } from "zod";

/**
 * Centralised, validated environment configuration.
 *
 * Rules:
 *  - This is the ONLY place process.env is read. Everything else imports `env`.
 *  - Validation is lazy (see getEnv) so tooling that doesn't need env
 *    (e.g. `prisma generate`) never trips the checks.
 *  - The app is fully runnable with NO real credentials in MVP mode
 *    (AI_PROVIDER=mock, STORAGE_PROVIDER=local). Real providers are opt-in
 *    and their required keys are enforced only when selected.
 *  - Secrets live server-side only. Never expose these to the client bundle.
 */
const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Database ------------------------------------------------------------
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required")
      .default(
        "postgresql://postgres:postgres@localhost:5432/mom?schema=public",
      ),

    // Auth (wired up in Phase 1.3) ---------------------------------------
    AUTH_SECRET: z.string().optional(),

    // AI provider abstraction --------------------------------------------
    AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),

    // Storage provider abstraction ---------------------------------------
    STORAGE_PROVIDER: z.enum(["local", "r2"]).default("local"),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_URL: z.string().optional(),
  })
  // Only enforce provider credentials when that provider is actually selected.
  .superRefine((val, ctx) => {
    if (val.AI_PROVIDER === "openai" && !val.OPENAI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENAI_API_KEY"],
        message: "OPENAI_API_KEY is required when AI_PROVIDER=openai",
      });
    }
    if (val.STORAGE_PROVIDER === "r2") {
      const required: (keyof typeof val)[] = [
        "R2_ACCOUNT_ID",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "R2_BUCKET",
      ];
      for (const key of required) {
        if (!val[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when STORAGE_PROVIDER=r2`,
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Parse & validate environment variables. Throws a readable error listing
 * every misconfigured/missing variable, then caches the result.
 */
export function getEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\n` +
        `See .env.example for the full list of variables.`,
    );
  }

  cached = parsed.data;
  return cached;
}

/** Test helper — clears the memoised env so a new source can be validated. */
export function resetEnvCache(): void {
  cached = undefined;
}
