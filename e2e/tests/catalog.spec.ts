import { expect, test } from '@playwright/test';
import { mockBookSummaries, mockEmptyBookPage, mockMultiPageBookPage } from '../fixtures/data';
import { mockCatalogRoutes } from '../helpers/api-mocks';

test.describe('Catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await mockCatalogRoutes(page);
    await page.goto('/catalog');
  });

  test('affiche les livres après chargement', async ({ page }) => {
    await expect(page.locator('app-book-card').first()).toBeVisible();
    await expect(page.locator('app-book-card')).toHaveCount(mockBookSummaries.length);
  });

  test('affiche le nombre de résultats', async ({ page }) => {
    await expect(page.locator('.page-subtitle')).toContainText('ouvrage');
  });

  test('affiche les pilules de filtre par catégorie', async ({ page }) => {
    // "Tous" est ajouté par le composant + 5 catégories de l'API = 6 pilules
    const pills = page.locator('.filter-pill');
    await expect(pills.first()).toBeVisible();
    await expect(pills.filter({ hasText: 'Tous' })).toBeVisible();
    await expect(pills.filter({ hasText: 'Roman' })).toBeVisible();
  });

  test('filtre par catégorie envoie le bon paramètre à l\'API', async ({ page }) => {
    await expect(page.locator('app-book-card').first()).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/api/books/search')),
      page.locator('.filter-pill', { hasText: 'Roman' }).click(),
    ]);

    const params = new URL(request.url()).searchParams;
    expect(params.get('categorie')).toBe('Roman');
  });

  test('le tri change les paramètres de l\'appel API', async ({ page }) => {
    await expect(page.locator('app-book-card').first()).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/api/books/search')),
      page.locator('.sort-select').selectOption('author-asc'),
    ]);

    const params = new URL(request.url()).searchParams;
    expect(params.get('sortBy')).toBe('auteur');
    expect(params.get('direction')).toBe('asc');
  });

  test('bascule entre vue grille et liste', async ({ page }) => {
    await expect(page.locator('app-book-card').first()).toBeVisible();

    const booksGrid = page.locator('.books-grid');
    await expect(booksGrid).not.toHaveClass(/books-grid--list/);

    await page.locator('.view-btn', { hasText: 'Liste' }).click();
    await expect(booksGrid).toHaveClass(/books-grid--list/);

    await page.locator('.view-btn', { hasText: 'Grille' }).click();
    await expect(booksGrid).not.toHaveClass(/books-grid--list/);
  });

  test('la pagination navigue vers la page suivante', async ({ page }) => {
    // LIFO: ce mock prend priorité sur celui du beforeEach
    await page.route(
      url => url.pathname === '/api/books/search',
      route => route.fulfill({ status: 200, json: mockMultiPageBookPage }),
    );

    await page.reload();
    await expect(page.locator('.pagination')).toBeVisible();

    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/api/books/search')),
      page.locator('.page-btn').last().click(), // bouton ›
    ]);

    const params = new URL(request.url()).searchParams;
    expect(params.get('page')).toBe('1');
  });

  test('affiche un message quand aucun résultat', async ({ page }) => {
    // LIFO: ce mock prend priorité sur celui du beforeEach
    await page.route(
      url => url.pathname === '/api/books/search',
      route => route.fulfill({ status: 200, json: mockEmptyBookPage }),
    );

    await page.reload();
    await page.waitForResponse(res => res.url().includes('/api/books/search'));

    await expect(page.locator('.no-results')).toBeVisible();
  });

  test('prend en compte le paramètre q dans l\'URL', async ({ page }) => {
    let capturedQuery = '';

    // LIFO: ce mock capture la requête
    await page.route(url => url.pathname === '/api/books/search', route => {
      capturedQuery = new URL(route.request().url()).searchParams.get('query') ?? '';
      return route.fulfill({ status: 200, json: { ...mockMultiPageBookPage } });
    });

    await page.goto('/catalog?q=prince');
    await page.waitForResponse(res => res.url().includes('/api/books/search'));

    expect(capturedQuery).toBe('prince');
  });
});
