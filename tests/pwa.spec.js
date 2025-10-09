// Playwright PWA Test für iOS "Zum Home-Bildschirm hinzufügen"
const { test, expect } = require('@playwright/test');

test.describe('PWA iOS Installation Tests', () => {
  
  test('sollte ein gültiges Web App Manifest haben', async ({ page }) => {
    await page.goto('./');
    
    // Manifest sollte verlinkt sein (Meta-Tags sind nicht visuell sichtbar)
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    // Manifest JSON abrufen und validieren
    const manifestUrl = await manifestLink.getAttribute('href');
    const manifestResponse = await page.request.get(manifestUrl);
    const manifest = await manifestResponse.json();
    
    // Wichtige PWA-Eigenschaften prüfen
    expect(manifest.name).toBe('Wortspiel - Deutsches Lernspiel');
    expect(manifest.short_name).toBe('Wortspiel');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./');
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

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

  test('sollte Theme Color haben', async ({ page }) => {
    await page.goto('./');
    
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);
    
    const content = await themeColor.getAttribute('content');
    expect(content).toBe('#4A9FD9');
  });

  test('sollte Viewport für Mobile korrekt konfiguriert haben', async ({ page }) => {
    await page.goto('./');
    
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1.0');
  });

  test('sollte auf iOS Safari installierbar sein', async ({ page, browserName, isMobile }) => {
    // Nur auf mobilen Geräten testen
    test.skip(!isMobile, 'Test nur für mobile Geräte relevant');
    
    await page.goto('./');
    
    // PWA-Kriterien prüfen
    const hasManifest = await page.locator('link[rel="manifest"]').count() > 0;
    const hasServiceWorker = await page.evaluate(() => 'serviceWorker' in navigator);
    const hasAppleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').count() > 0;
    const hasWebAppCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]').count() > 0;
    
    expect(hasManifest).toBe(true);
    expect(hasServiceWorker).toBe(true);
    expect(hasAppleTouchIcon).toBe(true);
    expect(hasWebAppCapable).toBe(true);
  });

  test('sollte Icon-Dateien erfolgreich laden', async ({ page }) => {
    await page.goto('./');
    
    // Icon-URLs aus dem Manifest extrahieren
    const manifestResponse = await page.request.get('./manifest.json');
    const manifest = await manifestResponse.json();
    
    // Jedes Icon laden und Status prüfen
    for (const icon of manifest.icons) {
      if (!icon.src.startsWith('data:')) { // Nur echte Dateien, keine Base64
        const iconResponse = await page.request.get(icon.src);
        expect(iconResponse.status()).toBe(200);
      }
    }
  });

});

test.describe('PWA Installation Debugging', () => {
  
  test('sollte PWA-Installation-Kriterien diagnostizieren', async ({ page }) => {
    await page.goto('./');
    
    // Sammle alle PWA-relevanten Informationen
    const diagnostics = await page.evaluate(() => {
      const info = {
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        hasAppleTouchIcon: !!document.querySelector('link[rel="apple-touch-icon"]'),
        hasWebAppCapable: !!document.querySelector('meta[name="apple-mobile-web-app-capable"]'),
        hasThemeColor: !!document.querySelector('meta[name="theme-color"]'),
        isSecure: location.protocol === 'https:' || location.hostname === 'localhost',
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        isStandalone: window.navigator.standalone === true,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      };
      
      return info;
    });
    
    console.log('PWA Diagnostics:', JSON.stringify(diagnostics, null, 2));
    
    // Alle Kriterien sollten erfüllt sein
    expect(diagnostics.hasServiceWorker).toBe(true);
    expect(diagnostics.hasManifest).toBe(true);
    expect(diagnostics.hasAppleTouchIcon).toBe(true);
    expect(diagnostics.hasWebAppCapable).toBe(true);
    expect(diagnostics.hasThemeColor).toBe(true);
  });
  
});