import type { Business } from "@mom/db";
import type { Vertical } from "./vertical.interface";
import { genericVertical } from "./generic.vertical";
import { mortgageVertical } from "./mortgage.vertical";

export * from "./vertical.interface";

/**
 * The vertical registry. Adding a new vertical (real estate, insurance, …) is a
 * matter of dropping a module here — no changes to the generic spine.
 */
const VERTICALS: Record<string, Vertical> = {
  [mortgageVertical.key]: mortgageVertical,
  [genericVertical.key]: genericVertical,
};

/** Resolve a business's vertical, falling back to generic. */
export function resolveVertical(key?: string | null): Vertical {
  return (key && VERTICALS[key]) || genericVertical;
}

export function resolveVerticalForBusiness(business: Business): Vertical {
  return resolveVertical(business.verticalKey);
}

export function listVerticals(): Vertical[] {
  return Object.values(VERTICALS);
}
