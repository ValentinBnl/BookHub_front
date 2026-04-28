import { expect, test } from '@playwright/test';
import { mockBookDetail } from '../fixtures/data';

const BOOK_ID = 1;

test.describe('Détail du livre', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      url => url.pathname === `/api/books/${BOOK_ID}`,
      route => route.fulfill({ status: 200, json: mockBookDetail }),
    );
    await page.goto(`/book/${BOOK_ID}`);
  });

  test('affiche le squelette de chargement puis le contenu', async ({ page }) => {
    let requestResolve!: () => void;
    const requestReceived = new Promise<void>(r => {
      requestResolve = r;
    });

    // LIFO: ce mock prend priorité sur celui du beforeEach
    await page.route(url => url.pathname === `/api/books/${BOOK_ID}`, async route => {
      requestResolve();
      await new Promise(r => setTimeout(r, 1500));
      await route.fulfill({ status: 200, json: mockBookDetail });
    });

    await page.reload();
    await requestReceived;

    await expect(page.locator('.detail-loading')).toBeVisible();
    await expect(page.locator('.hero-title')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.detail-loading')).not.toBeVisible();
  });

  test('affiche le titre et l\'auteur', async ({ page }) => {
    await expect(page.locator('.hero-title')).toContainText(mockBookDetail.titre);
    await expect(page.locator('.hero-author')).toContainText(mockBookDetail.auteur);
  });

  test('affiche la catégorie', async ({ page }) => {
    await expect(page.locator('.tag')).toContainText(mockBookDetail.categorie);
  });

  test('affiche le statut de disponibilité', async ({ page }) => {
    const availability = page.locator('.availability');
    await expect(availability).toBeVisible();
    await expect(availability).toContainText(`${mockBookDetail.exemplairesDisponibles}`);
    await expect(availability).toHaveClass(/availability--ok/);
  });

  test('affiche la description', async ({ page }) => {
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('.summary p')).toContainText(mockBookDetail.description.slice(0, 30));
  });

  test('affiche le nombre de pages', async ({ page }) => {
    await expect(page.locator('.hero-stats')).toContainText(`${mockBookDetail.nombrePages} pages`);
  });
});

test.describe('Livre introuvable', () => {
  test('affiche un message quand le livre n\'existe pas', async ({ page }) => {
    await page.route(
      url => url.pathname === '/api/books/9999',
      route => route.fulfill({ status: 404, json: { message: 'Not found' } }),
    );
    await page.goto('/book/9999');
    await expect(page.locator('.not-found')).toBeVisible();
  });
});
