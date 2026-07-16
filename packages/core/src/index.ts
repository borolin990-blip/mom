/**
 * @mom/core — framework-agnostic business logic for the AI Content OS.
 *
 * Never imports React/Next.js. Consumed by apps/web (and future workers/APIs)
 * through the typed exports below.
 */

// AI content engine
export * from "./ai";

// Storage abstraction
export * from "./storage";

// Use-case services
export * from "./services/business.service";
export * from "./services/content.service";
export * from "./services/generation.service";

export const CORE_PACKAGE_VERSION = "0.1.0";
