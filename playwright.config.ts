import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour tests E2E OstéoPraxis
 * Tests du flow démo → actif
 */
export default defineConfig({
  testDir: './e2e',

  // Timeout pour chaque test
  timeout: 60 * 1000,

  // Timeout pour chaque assertion
  expect: {
    timeout: 10000,
  },

  // Nombre de tentatives en cas d'échec
  retries: process.env.CI ? 2 : 0,

  // Nombre de workers (parallélisation)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Configuration serveur de développement
  use: {
    // Base URL
    baseURL: 'http://localhost:5173',

    // Traces en cas d'échec
    trace: 'on-first-retry',

    // Screenshots en cas d'échec
    screenshot: 'only-on-failure',

    // Vidéos en cas d'échec
    video: 'retain-on-failure',
  },

  // Configuration des navigateurs
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Démarrer le serveur de dev avant les tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
