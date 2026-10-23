// Fixed call to action: shown only while none of the watched elements is on screen.
export function initStickyCta(bar, watched) {
  if (!bar || !('IntersectionObserver' in window)) return;
  const onScreen = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => (entry.isIntersecting ? onScreen.add(entry.target) : onScreen.delete(entry.target)));
    const show = onScreen.size === 0;
    bar.hidden = !show;
    bar.inert = !show;
  });
  watched.forEach(element => observer.observe(element));
}
