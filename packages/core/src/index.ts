/**
 * @mom/core — framework-agnostic business logic for the AI Content OS.
 *
 * This package holds the reusable heart of the product and must never import
 * React, Next.js, or any UI code. It is consumed by apps/web (and, in future,
 * by workers, a mobile app, or a standalone API) through typed interfaces.
 *
 * Planned structure (filled in from Phase 1.6 onward):
 *   ai/          — AIProvider interface, providers (openai, mock), prompt
 *                  registry, Zod output schemas, content generators.
 *   storage/     — StorageProvider interface, providers (r2, local).
 *   publishing/  — PlatformAdapter interface, per-platform adapters (Phase 2).
 *   scheduling/  — best-time engine + calendar logic.
 *   services/    — use-case orchestration (onboarding, content, generation).
 *   types/       — shared domain types & DTOs.
 *
 * Phase 0 intentionally ships this as a placeholder so the module boundary
 * exists and other packages can depend on it.
 */
export const CORE_PACKAGE_VERSION = "0.1.0";
