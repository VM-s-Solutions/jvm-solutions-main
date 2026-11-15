/**
 * Where a strip scrolls to when its scrollbar's thumb has its left edge `thumbLeft` px into the
 * track: the thumb's travel (the track less the thumb) spans the strip's scroll range, and the
 * thumb stops at either end.
 */
export function scrollForThumb(thumbLeft: number, travel: number, range: number): number {
  if (travel <= 0) return 0;
  return Math.min(Math.max(thumbLeft / travel, 0), 1) * range;
}
