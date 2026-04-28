import type { Page } from '@playwright/test';
import { mockBookPage, mockCategories } from '../fixtures/data';

export async function mockHomeRoutes(page: Page) {
  await page.route(
    url => url.pathname === '/api/books',
    route => route.fulfill({ status: 200, json: mockBookPage }),
  );
}

export async function mockCatalogRoutes(page: Page) {
  await page.route(
    url => url.pathname === '/api/categories',
    route => route.fulfill({ status: 200, json: mockCategories }),
  );
  await page.route(
    url => url.pathname === '/api/books/search',
    route => route.fulfill({ status: 200, json: mockBookPage }),
  );
}
