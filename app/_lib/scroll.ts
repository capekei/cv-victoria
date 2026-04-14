/**
 * Resolve the correct ScrollTrigger scroller for a given element.
 *
 * On desktop the inner `.cv-scroll` container is the scroller (driven by
 * Lenis). On mobile we unpin the shell and let the browser's document
 * scroll take over, so ScrollTrigger must be bound to `window` instead.
 *
 * Keep this in sync with the mobile breakpoint in `ScrollPanel` and the
 * `@media (max-width: 768px)` block in `globals.css`.
 */
export function resolveScroller(
  el: Element
): Element | Window | undefined {
  if (typeof window === "undefined") return undefined;
  if (window.matchMedia("(max-width: 768px)").matches) return window;
  return (el.closest(".cv-scroll") as Element | null) ?? undefined;
}
