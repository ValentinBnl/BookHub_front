import { expect, test } from '@playwright/test';
import { mockAuthResponse, mockToken } from '../fixtures/data';
import { mockHomeRoutes } from '../helpers/api-mocks';

test.describe('Connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('affiche le formulaire de connexion', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button.submit')).toContainText('Se connecter');
  });

  test("affiche un message de succès après redirection depuis l'inscription", async ({ page }) => {
    await page.goto('/auth/login?registered=1');
    await expect(page.locator('.form-success')).toBeVisible();
  });

  test('connexion réussie redirige vers /home et stocke le token', async ({ page }) => {
    await page.route(
      url => url.pathname === '/api/auth/login',
      route => route.fulfill({ status: 200, json: mockAuthResponse }),
    );
    await mockHomeRoutes(page);

    await page.fill('#email', 'alice@example.com');
    await page.fill('#password', 'Password@1234!');
    await page.locator('button.submit').click();

    await page.waitForURL('**/home');

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe(mockToken);
    const email = await page.evaluate(() => localStorage.getItem('email'));
    expect(email).toBe(mockAuthResponse.email);
  });

  test("identifiants invalides affiche un message d'erreur", async ({ page }) => {
    await page.route(
      url => url.pathname === '/api/auth/login',
      route => route.fulfill({ status: 401, json: { message: 'Unauthorized' } }),
    );

    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'badpassword');
    await page.locator('button.submit').click();

    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('le bouton est désactivé pendant la soumission', async ({ page }) => {
    let resolveLogin!: () => void;
    await page.route(url => url.pathname === '/api/auth/login', async route => {
      await new Promise<void>(r => {
        resolveLogin = r;
      });
      await route.fulfill({ status: 200, json: mockAuthResponse });
    });
    await mockHomeRoutes(page);

    await page.fill('#email', 'alice@example.com');
    await page.fill('#password', 'Password@1234!');

    const submitBtn = page.locator('button.submit');
    await submitBtn.click();
    await expect(submitBtn).toBeDisabled();

    resolveLogin();
  });

  test("le lien 'Rejoindre l'association' navigue vers l'inscription", async ({ page }) => {
    await page.locator("text=Rejoindre l'association").click();
    await page.waitForURL('**/auth/register');
  });
});

test.describe('Inscription', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('affiche tous les champs du formulaire', async ({ page }) => {
    await expect(page.locator('#prenom')).toBeVisible();
    await expect(page.locator('#nom')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#telephone')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('button.submit')).toContainText('Creer mon compte');
  });

  test('les mots de passe différents affichent une erreur', async ({ page }) => {
    await page.fill('#prenom', 'Alice');
    await page.fill('#nom', 'Dupont');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#telephone', '0612345678');
    await page.fill('#password', 'Password@1234!');
    await page.fill('#confirmPassword', 'Different@5678!');
    await page.locator('button.submit').click();

    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('un mot de passe trop faible affiche une erreur', async ({ page }) => {
    await page.fill('#prenom', 'Alice');
    await page.fill('#nom', 'Dupont');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#telephone', '0612345678');
    await page.fill('#password', 'toofaible');
    await page.fill('#confirmPassword', 'toofaible');
    await page.locator('button.submit').click();

    await expect(page.locator('.form-error')).toBeVisible();
  });

  test("inscription réussie redirige vers /auth/login?registered=1", async ({ page }) => {
    await page.route(
      url => url.pathname === '/api/auth/register',
      route => route.fulfill({ status: 200, json: mockAuthResponse }),
    );

    await page.fill('#prenom', 'Alice');
    await page.fill('#nom', 'Dupont');
    await page.fill('#email', 'alice@example.com');
    await page.fill('#telephone', '0612345678');
    await page.fill('#password', 'Password@1234!');
    await page.fill('#confirmPassword', 'Password@1234!');
    await page.locator('button.submit').click();

    await page.waitForURL('**/auth/login?registered=1');
    expect(page.url()).toContain('registered=1');
  });

  test("erreur API affiche un message d'erreur", async ({ page }) => {
    await page.route(
      url => url.pathname === '/api/auth/register',
      route => route.fulfill({ status: 400, json: { message: 'Email déjà utilisé' } }),
    );

    await page.fill('#prenom', 'Alice');
    await page.fill('#nom', 'Dupont');
    await page.fill('#email', 'existing@example.com');
    await page.fill('#telephone', '0612345678');
    await page.fill('#password', 'Password@1234!');
    await page.fill('#confirmPassword', 'Password@1234!');
    await page.locator('button.submit').click();

    await expect(page.locator('.form-error')).toBeVisible();
  });

  test("le lien 'Se connecter' navigue vers la connexion", async ({ page }) => {
    await page.locator('.tab', { hasText: 'Se connecter' }).click();
    await page.waitForURL('**/auth/login');
  });
});
