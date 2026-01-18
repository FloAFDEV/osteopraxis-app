/**
 * E2E Tests: Flow d'inscription et onboarding
 * Test du parcours complet: Register → HDS Setup → Dashboard
 */

import { test, expect } from '@playwright/test';

// Génération d'email unique pour chaque test
const generateTestEmail = () => `test-${Date.now()}@osteopraxis-e2e.com`;

test.describe('Registration Flow', () => {
  test('should complete full registration and redirect to HDS setup', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // 1. Aller sur la page d'inscription
    await page.goto('/register');

    // Vérifier que la page est bien OstéoPraxis (pas PatientHub)
    await expect(page.locator('text=OstéoPraxis')).toBeVisible();

    // 2. Remplir le formulaire d'inscription
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Osteopath');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // 3. Soumettre le formulaire
    await page.click('button[type="submit"]');

    // 4. Vérifier le message de succès
    await expect(page.locator('text=Inscription réussie !')).toBeVisible({ timeout: 10000 });

    // 5. Vérifier le countdown de redirection
    await expect(page.locator('text=/Redirection dans \\d+s.../i')).toBeVisible();

    // 6. Attendre la redirection vers /hds-setup
    await page.waitForURL('**/hds-setup**', { timeout: 10000 });

    // 7. Vérifier qu'on est bien sur la page HDS Setup
    await expect(page).toHaveURL(/\/hds-setup/);

    console.log(`✅ Registration flow completed for ${testEmail}`);
  });

  test('should not redirect to /login after registration', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testPassword = 'TestPassword123!';

    // 1. S'inscrire
    await page.goto('/register');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // 2. Attendre la redirection
    await page.waitForTimeout(5000);

    // 3. Vérifier qu'on n'est PAS sur /login
    expect(page.url()).not.toContain('/login');

    // 4. Vérifier qu'on est sur /hds-setup
    expect(page.url()).toContain('/hds-setup');

    console.log(`✅ No redirect to /login - correct flow`);
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto('/register');

    // Essayer de soumettre avec des mots de passe non correspondants
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different123');
    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur
    await expect(page.locator('text=/Les mots de passe ne correspondent pas/i')).toBeVisible();

    console.log(`✅ Validation errors shown correctly`);
  });
});
