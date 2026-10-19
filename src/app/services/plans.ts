/** Our prices in whole euros — the one place they live (chat answers, the dial, the pricing table, the FAQ). */
export const PRICE = {
  /** Consulting, per hour */
  hour: 100,
  /** Support & LTS, per month, from */
  lts: 390,
  /** The whole team, per month, from */
  team: 17900,
} as const;

export type PlanId = 'hour' | 'lts' | 'project' | 'team';

export interface Plan {
  readonly id: PlanId;
  /** Whole euros, or null for the fixed-scope project, which is quoted per brief */
  readonly amount: number | null;
  /** The amount is a starting price: "from €390" */
  readonly from: boolean;
}

/** The four ways to work with us, smallest first: the dial's stops and the table's columns. */
export const PLANS: readonly Plan[] = [
  { id: 'hour', amount: PRICE.hour, from: false },
  { id: 'lts', amount: PRICE.lts, from: true },
  { id: 'project', amount: null, from: false },
  { id: 'team', amount: PRICE.team, from: true },
];
