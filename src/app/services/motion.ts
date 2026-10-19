let query: MediaQueryList | undefined;

/**
 * Whether the visitor asked for reduced motion. Read at the moment of use, so turning the
 * setting on with the page open applies straight away.
 */
export function prefersReducedMotion(): boolean {
  query ??= window.matchMedia('(prefers-reduced-motion: reduce)');
  return query.matches;
}
