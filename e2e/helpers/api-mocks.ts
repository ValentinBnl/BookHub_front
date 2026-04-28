import type { Page } from '@playwright/test';
import { mockBookPage, mockCategories } from '../fixtures/data';

// Matches /api/books?page=... but NOT /api/books/search or /api/books/1
const BOOKS_LIST_RE = /\/api\/books(\?|$)/;
const BOOKS_SEARCH_RE = /\/api\/books\/search/;
const CATEGORIES_RE = /\/api\/categories/;

export async function mockHomeRoutes(page: Page) {
  await page.route(BOOKS_LIST_RE, route =>
    route.fulfill({ status: 200, json: mockBookPage }),
  );
}

export async function mockCatalogRoutes(page: Page) {
  await page.route(CATEGORIES_RE, route =>
    route.fulfill({ status: 200, json: mockCategories }),
  );
  await page.route(BOOKS_SEARCH_RE, route =>
    route.fulfill({ status: 200, json: mockBookPage }),
  );
}
