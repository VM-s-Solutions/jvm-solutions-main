/**
 * The chips under each trade. Technology names are never translated; the one ordinary
 * word among them ("Agents") is a translation key, marked `i18n`.
 */
export interface StackChip {
  readonly text: string;
  readonly i18n?: boolean;
}

export type TradeId = 'web' | 'api' | 'mobile' | 'ai';

const tech = (...names: string[]): StackChip[] => names.map((text) => ({ text }));
const AGENTS: StackChip = { text: 'service.agents', i18n: true };

/** Four chips per trade, for the home page carousel */
export const STACK_SHORT: Readonly<Record<TradeId, readonly StackChip[]>> = {
  web: tech('Angular', 'React', 'TypeScript', 'SCSS'),
  api: tech('.NET', 'C#', 'PostgreSQL', 'Docker'),
  mobile: tech('Swift', 'Kotlin', 'iOS', 'Android'),
  ai: [...tech('Claude', 'LangChain', 'Python'), AGENTS],
};

/** The full stack, for the services page */
export const STACK_FULL: Readonly<Record<TradeId, readonly StackChip[]>> = {
  web: tech('Angular', 'React', 'Vue', 'TypeScript', 'SCSS'),
  api: tech('.NET', 'C#', 'gRPC', 'PostgreSQL', 'Docker'),
  mobile: tech('Swift', 'Kotlin', 'iOS', 'Android'),
  ai: [...tech('Claude', 'LangChain', 'Python'), AGENTS],
};
