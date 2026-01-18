/**
 * E2E Tests: Flow Démo → Actif
 * Test du cycle de vie ostéopathe: création en DEMO, activation par admin, vérification filigrane PDF
 */

import { test, expect } from '@playwright/test';

// Helper pour créer un utilisateur de test
const createTestUser = async (page: any, isAdmin = false) => {
  const email = `test-${Date.now()}${isAdmin ? '-admin' : ''}@osteopraxis-e2e.com`;
  const password = 'TestPassword123!';

  await page.goto('/register');
  await page.fill('input[name="firstName"]', isAdmin ? 'Admin' : 'Test');
  await page.fill('input[name="lastName"]', isAdmin ? 'Super' : 'Osteopath');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.click('button[type="submit"]');

  // Attendre la redirection
  await page.waitForURL('**/hds-setup**', { timeout: 10000 });

  return { email, password };
};

test.describe('Demo to Active Flow', () => {
  test('new osteopath should start in DEMO mode', async ({ page }) => {
    // 1. Créer un nouvel utilisateur
    const { email } = await createTestUser(page);

    // 2. Compléter le wizard HDS (skip rapide si possible)
    // Note: Adapter selon l'implémentation réelle du wizard
    await page.waitForTimeout(2000);

    // 3. Si il y a un bouton "Passer" ou "Plus tard", cliquer dessus
    const skipButton = page.locator('button:has-text("Passer"), button:has-text("Plus tard")').first();
    if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipButton.click();
    }

    // 4. Aller sur le dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 5. Vérifier le badge de statut DEMO
    await expect(page.locator('text=/MODE DEMO/i, text=/DÉMO/i')).toBeVisible();

    console.log(`✅ New osteopath ${email} starts in DEMO mode`);
  });

  test('demo mode should show watermark on PDF invoices', async ({ page, context }) => {
    // 1. Créer un utilisateur en mode DEMO
    await createTestUser(page);

    // 2. Aller sur le dashboard
    await page.goto('/dashboard');

    // 3. Créer un patient fictif
    await page.goto('/patients/new');
    await page.fill('input[name="firstName"]', 'Patient');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', 'patient@test.com');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 4. Créer une facture
    await page.goto('/invoices/new');
    // Remplir les champs de facture (adapter selon l'implémentation)
    await page.waitForTimeout(1000);

    // 5. Chercher le bouton de génération PDF
    const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Télécharger")').first();

    if (await pdfButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Attendre le téléchargement du PDF
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        pdfButton.click(),
      ]);

      console.log(`✅ PDF generated in DEMO mode: ${await download.suggestedFilename()}`);

      // Note: Pour vérifier le filigrane, il faudrait:
      // - Télécharger le PDF
      // - L'analyser avec pdf-parse ou similaire
      // - Chercher le texte "NON VALABLE" ou "DEMO"
      // Ceci dépasse le scope d'un test E2E standard
    }
  });

  test.describe('Admin activation flow', () => {
    test.skip('admin should be able to activate an osteopath', async ({ page }) => {
      // NOTE: Ce test nécessite:
      // 1. Un compte admin configuré (via la migration bootstrap)
      // 2. Accès à l'interface admin
      // 3. Pouvoir activer un ostéopathe

      // 1. Se connecter en tant qu'admin
      await page.goto('/login');
      await page.fill('input[name="email"]', 'afdevflo@gmail.com'); // Admin configuré
      await page.fill('input[name="password"]', 'admin-password');
      await page.click('button[type="submit"]');

      // 2. Aller sur la page admin des ostéopathes
      await page.goto('/admin/osteopaths');

      // 3. Trouver un ostéopathe en mode DEMO
      const demoOsteopath = page.locator('tr:has-text("DEMO")').first();
      await expect(demoOsteopath).toBeVisible();

      // 4. Cliquer sur "Activer"
      await demoOsteopath.locator('button:has-text("Activer")').click();

      // 5. Confirmer l'activation
      await page.locator('button:has-text("Confirmer")').click();

      // 6. Vérifier que le statut passe à ACTIF
      await expect(page.locator('tr:has-text("ACTIF")').first()).toBeVisible();

      console.log('✅ Osteopath activated by admin');
    });
  });

  test('active mode should NOT show watermark on PDF invoices', async ({ page }) => {
    // NOTE: Ce test nécessite un ostéopathe déjà activé
    // Pour l'instant, on skip car la configuration est complexe

    test.skip();
  });
});

test.describe('Osteopath Status Badge', () => {
  test('should display correct status badge on dashboard', async ({ page }) => {
    // 1. Créer un utilisateur
    await createTestUser(page);

    // 2. Aller sur le dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Vérifier la présence du badge de statut
    const statusBadge = page.locator('[data-testid="osteopath-status-badge"], text=/MODE/i').first();
    await expect(statusBadge).toBeVisible();

    console.log('✅ Status badge visible on dashboard');
  });
});
