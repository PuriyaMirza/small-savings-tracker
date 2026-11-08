// Categories live in code, not the database (see docs/HANDOFF.md).
// Fixed buttons: the server always takes amountCents from here, never from the client.
export const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast', amountCents: 200, note: 'Brought from home' },
  { id: 'lunch', label: 'Lunch', amountCents: 1000, note: 'Packed, not bought' },
  { id: 'bike', label: 'Bike', amountCents: 300, note: 'Instead of the subway' },
] as const;

// "Other": the user types a name and amount each time. Amount is validated
// against these limits (client and, from M3, server).
export const OTHER = {
  id: 'other',
  label: 'Other',
  note: 'Name it, set the amount',
  maxCents: 100_000, // $1,000
  maxLabelLength: 40,
} as const;

export type Category = (typeof CATEGORIES)[number];
export type FixedCategoryId = Category['id'];
export type CategoryId = FixedCategoryId | typeof OTHER.id;

export const ALL_CATEGORY_IDS: CategoryId[] = [...CATEGORIES.map((c) => c.id), OTHER.id];

export function categoryLabel(id: CategoryId): string {
  if (id === OTHER.id) return OTHER.label;
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
