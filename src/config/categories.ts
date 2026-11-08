// Categories live in code, not the database (see docs/HANDOFF.md).
// The server always takes amountCents from here, never from the client.
export const CATEGORIES = [
  { id: 'breakfast', label: 'Breakfast', amountCents: 200, note: 'Brought from home' },
  { id: 'lunch', label: 'Lunch', amountCents: 1000, note: 'Packed, not bought' },
  { id: 'bike', label: 'Bike', amountCents: 300, note: 'Instead of the subway' },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryId = Category['id'];
