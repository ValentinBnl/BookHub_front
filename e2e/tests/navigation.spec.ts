import { expect, test } from '@playwright/test';
import { mockCatalogRoutes, mockHomeRoutes } from '../helpers/api-mocks';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockHomeRoutes(page);
    await mockCatalogRoutes(page);
    await page.goto('/home');
  });

  test('une route inconnue redirige vers /home', async ({ page }) => {
    await page.goto('/cette-page-nexiste-pas');
    await page.waitForURL('**/home');
    expect(page.url()).toContain('/home');
  });

  test('la sidebar navigue vers le catalogue', async ({ page }) => {
    await page.locator('aside a[href="/catalog"]').click();
    await page.waitForURL('**/catalog');
  });

  test("la sidebar navigue vers l'accueil", async ({ page }) => {
    await page.goto('/catalog');
    await page.locator('aside a[href="/home"]').click();
    await page.waitForURL('**/home');
  });

  test('la recherche dans la barre du haut navigue vers le catalogue', async ({ page }) => {
    await page.locator('.search-input').fill('prince');
    await page.locator('.search-input').press('Enter');
    await page.waitForURL('**/catalog?q=prince');
    expect(page.url()).toContain('q=prince');
  });
});
