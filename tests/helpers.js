const imageExt = /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i;
const fontExt = /\.(woff2?|ttf|otf)(\?|$)/i;

export async function gotoAt(page, width, height, path = '/') {
  await page.setViewportSize({ width, height });
  await page.goto(path, { waitUntil: 'load' });
}

export async function scrollToEnd(page) {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 60));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForLoadState('networkidle');
}

// Bytes transferred per resource, read from Resource Timing (same origin, uncompressed server).
export async function resources(page) {
  return page.evaluate(() => performance.getEntriesByType('resource').map(entry => ({
    url: entry.name,
    bytes: entry.encodedBodySize || entry.transferSize
  })));
}

export async function resourceBytes(page, types = ['image', 'font']) {
  const matchers = types.map(type => (type === 'image' ? imageExt : fontExt));
  const list = await resources(page);
  return list.filter(item => matchers.some(re => re.test(new URL(item.url).pathname)))
    .reduce((sum, item) => sum + item.bytes, 0);
}

// Visible elements with their own text whose computed font-size is below `min` px.
export async function smallText(page, min = 12, exempt = '[data-illustration]') {
  return page.evaluate(({ min, exempt }) => {
    const found = [];
    for (const el of document.body.querySelectorAll('*')) {
      if (exempt && el.closest(exempt)) continue;
      const ownText = [...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!ownText) continue;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!rect.width || !rect.height || style.visibility === 'hidden') continue;
      const size = parseFloat(style.fontSize);
      if (size < min) found.push({ tag: el.tagName.toLowerCase(), cls: el.className?.baseVal ?? el.className, text: el.textContent.trim().slice(0, 40), size });
    }
    return found;
  }, { min, exempt });
}

export function rectsIntersect(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}
