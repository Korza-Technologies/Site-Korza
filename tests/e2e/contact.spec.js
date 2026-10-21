import { test, expect } from '@playwright/test';
import { gotoAt } from '../helpers.js';

const CTA = 'Montar meu app grátis';

test('CONTACT-06 rodapé sem "Criar app grátis" e com o rótulo único de cadastro', async ({ page }) => {
  await gotoAt(page, 1440, 900);
  const footer = page.locator('footer.footer');
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(footer).not.toContainText('Criar app grátis');
  const signup = footer.locator('a[href^="https://admin.korza.app/create-account"]');
  await expect(signup).toHaveCount(1);
  await expect(signup).toBeVisible();
  await expect(signup).toHaveText(CTA);
});
