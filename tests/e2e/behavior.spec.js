import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

test('menu mobile abre pelo botão e fecha com Esc devolvendo o foco', async ({ page }) => {
  await gotoAt(page, 390, 844);
  const toggle = page.locator('.menu-toggle');
  const menu = page.locator('#navigation');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAttribute('aria-label', 'Fechar menu');
  await expect(menu).toHaveClass(/\bopen\b/);
  await expect(menu.locator('a[href="#precos"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveAttribute('aria-label', 'Abrir menu');
  await expect(menu).not.toHaveClass(/\bopen\b/);
  await expect(toggle).toBeFocused();
});

test('menu mobile fecha ao escolher um link', async ({ page }) => {
  await gotoAt(page, 390, 844);
  const toggle = page.locator('.menu-toggle');
  await toggle.click();
  await page.locator('#navigation a[href="#precos"]').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#navigation')).not.toHaveClass(/\bopen\b/);
});

test('diálogo de detalhes abre com o conteúdo do gatilho e fecha devolvendo o foco', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const dialog = page.locator('#feature-dialog');
  const trigger = page.locator('[data-feature="push"]');
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#dialog-title')).toHaveText('Bons motivos para voltar.');
  await expect(page.locator('#dialog-label')).toHaveText('Conheça a plataforma');
  await page.locator('.dialog-close').click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  const caseTrigger = page.locator('[data-case="loum"]');
  await caseTrigger.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#dialog-label')).toHaveText('Case Korza · Loum');
  await expect(page.locator('#dialog-title')).toHaveText('42% dos pedidos vieram de quem já conhecia a loja.');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(caseTrigger).toBeFocused();
});

test('setas do carrossel de cases mudam o ponto ativo', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const dots = page.locator('[data-story]');
  await page.locator('.story-next').click();
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'false');
  await page.locator('.story-next').click();
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
  await page.locator('.story-prev').click();
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await dots.nth(3).click();
  await expect(dots.nth(3)).toHaveAttribute('aria-current', 'true');
});

test('rodapé mostra o ano atual', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2031-03-15T12:00:00'));
  await gotoAt(page, 1440, 900);
  await expect(page.locator('#year')).toHaveText('2031');
});
