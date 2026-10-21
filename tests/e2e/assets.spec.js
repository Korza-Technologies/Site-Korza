import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const skipDirs = new Set(['node_modules', 'tests', 'scripts', 'assets', 'assets-src', 'test-results', 'playwright-report']);

function siteFiles(dir = '.') {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (name.startsWith('.') || skipDirs.has(name)) return [];
    if (statSync(path).isDirectory()) return siteFiles(path);
    return /\.(html|css|js)$/.test(name) && name !== 'playwright.config.js' ? [path] : [];
  });
}

function referencedAssets() {
  const refs = new Set();
  for (const file of siteFiles()) {
    for (const match of readFileSync(file, 'utf8').matchAll(/assets\/([\w.-]+\.\w+)/g)) refs.add(match[1]);
  }
  return refs;
}

test('PERF-07 todo arquivo referenciado em assets/ existe', () => {
  const refs = referencedAssets();
  expect(refs.size).toBeGreaterThan(0);
  for (const name of refs) expect(existsSync(join('assets', name)), name).toBe(true);
});

test('PERF-07 todo arquivo em assets/ (exceto a licença) é referenciado por HTML, CSS ou JS', () => {
  const refs = referencedAssets();
  const unused = readdirSync('assets').filter(name => !name.startsWith('.') && name !== 'FONT-LICENSE.txt' && !refs.has(name));
  expect(unused).toEqual([]);
});
