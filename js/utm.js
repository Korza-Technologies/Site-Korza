const SIGNUP_LINKS = 'a[href^="https://admin.korza.app/create-account"]';

// Carries the page's utm_* parameters (first occurrence of each) into a link, keeping its own query and never repeating a key.
export function appendUtm(href, search) {
  const utm = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(search)) {
    if (key.startsWith('utm_') && !utm.has(key)) utm.set(key, value);
  }
  if ([...utm.keys()].length === 0) return href;
  const url = new URL(href);
  for (const [key, value] of utm) url.searchParams.set(key, value);
  return url.toString();
}

export function initUtm() {
  document.querySelectorAll(SIGNUP_LINKS).forEach(link => {
    link.setAttribute('href', appendUtm(link.getAttribute('href'), window.location.search));
  });
}
