import { expect, test } from '@playwright/test';
import { mockBookPage } from '../fixtures/data';
import { mockHomeRoutes } from '../helpers/api-mocks';

test.describe("Page d'accueil", () => {
  test.beforeEach(async ({ page }) => {
    await mockHomeRoutes(page);
    await page.goto('/home');
  });

  test('affiche le message de bienvenue', async ({ page }) => {
    await expect(page.locator('.greeting')).toContainText('Bonjour');
    await expect(page.locator('.greeting-sub')).toBeVisible();
  });

  test('affiche les 4 cartes de statistiques', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  test('affiche les livres après chargement', async ({ page }) => {
    await expect(page.locator('app-book-card').first()).toBeVisible();
    await expect(page.locator('app-book-card')).toHaveCount(mockBookPage.content.length);
  });

  test('affiche le squelette de chargement puis les livres', async ({ page }) => {
    let requestResolve!: () => void;
    const requestReceived = new Promise<void>(r => {
      requestResolve = r;
    });

    // LIFO: ce mock prend priorité sur celui du beforeEach
    await page.route(url => url.pathname === '/api/books', async route => {
      requestResolve();
      await new Promise(r => setTimeout(r, 1500));
      await route.fulfill({ status: 200, json: mockBookPage });
    });

    await page.reload();
    await requestReceived; // attend que afterNextRender() déclenche l'appel API

    await expect(page.locator('.book-skeleton').first()).toBeVisible();
    await expect(page.locator('app-book-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('le bouton catalogue navigue vers /catalog', async ({ page }) => {
    await page.locator('a.btn-catalog').click();
    await page.waitForURL('**/catalog');
  });
});
