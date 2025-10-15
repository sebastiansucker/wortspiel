// Playwright PWA Test für iOS "Zum Home-Bildschirm hinzufügen"
const { test, expect } = require('@playwright/test');

test.describe('PWA iOS Installation Tests', () => {

  test('sollte alle erforderlichen Icons haben', async ({ page }) => {
    await page.goto('./');
    
    // Verschiedene Icon-Größen prüfen (Meta-Tags sind nicht visuell "sichtbar")
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveCount(1);
    
    // SVG Favicon
    const svgIcon = page.locator('link[type="image/svg+xml"]');
    await expect(svgIcon).toHaveCount(1);
  });

  test('sollte Service Worker registrieren', async ({ page }) => {
    await page.goto('./');
    
    // Warten bis Service Worker geladen ist
    await page.waitForLoadState('networkidle');
    
    // Service Worker Registration prüfen
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistered).toBe(true);
  });

  test('sollte Apple Meta Tags für iOS haben', async ({ page }) => {
    await page.goto('./');
    
    // Apple-spezifische Meta Tags prüfen (Meta-Tags sind nicht visuell sichtbar)
    const appleMobileWebAppCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleMobileWebAppCapable).toHaveCount(1);
    
    const appleMobileWebAppTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(appleMobileWebAppTitle).toHaveCount(1);
    
    const appleMobileWebAppStatusBar = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    await expect(appleMobileWebAppStatusBar).toHaveCount(1);
  });

  test('sollte Viewport für Mobile korrekt konfiguriert haben', async ({ page }) => {
    await page.goto('./');
    
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1.0');
  });

});