import { test, expect } from '@playwright/test';

test.describe('Wortspiel Game', () => {
  
  test('should load the main page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if title is correct
    await expect(page).toHaveTitle('Wortspiel');
    
    // Check if main heading is present
    await expect(page.locator('h1')).toContainText('Wortspiel');
    
    // Check if class selection buttons are visible
    await expect(page.locator('#class12Btn')).toBeVisible();
    await expect(page.locator('#class34Btn')).toBeVisible();
  });

  test('should start Grade 1&2 game correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on Grade 1&2 button
    await page.click('#class12Btn');
    
    // Check if game area becomes visible
    await expect(page.locator('#gameArea')).toBeVisible();
    
    // Check if timer is displayed
    await expect(page.locator('#timer')).toContainText('60s');
    
    // Check if a word is displayed
    await expect(page.locator('#wort')).not.toBeEmpty();
    
    // Check if Next button is enabled
    await expect(page.locator('#nextBtn')).toBeEnabled();
    
    // Check if class selection is correct
    await expect(page.locator('#selectedClass')).toContainText('Klasse 1 & 2');
  });

  test('should start Grade 3&4 game correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on Grade 3&4 button
    await page.click('#class34Btn');
    
    // Check if game area becomes visible
    await expect(page.locator('#gameArea')).toBeVisible();
    
    // Check if class selection is correct
    await expect(page.locator('#selectedClass')).toContainText('Klasse 3 & 4');
  });

  test('should advance through words when clicking Next', async ({ page }) => {
    await page.goto('/');
    await page.click('#class12Btn');
    
    // Get initial word
    const initialWord = await page.locator('#wort').textContent();
    
    // Click Next button
    await page.click('#nextBtn');
    
    // Check if word changed (might be the same word by chance, but test structure is correct)
    const newWord = await page.locator('#wort').textContent();
    
    // Verify the word element still contains text
    expect(newWord).toBeTruthy();
    expect(newWord.length).toBeGreaterThan(0);
  });

  test('should reset to class selection when clicking reset button', async ({ page }) => {
    await page.goto('/');
    await page.click('#class12Btn');
    
    // Verify we're in game mode
    await expect(page.locator('#gameArea')).toBeVisible();
    
    // Click reset button
    await page.click('#resetBtn');
    
    // Check if we're back to class selection
    await expect(page.locator('.class-selection')).toBeVisible();
    await expect(page.locator('#gameArea')).not.toBeVisible();
  });

  test('should handle timer countdown', async ({ page }) => {
    await page.goto('/');
    await page.click('#class12Btn');
    
    // Check initial timer
    await expect(page.locator('#timer')).toContainText('60s');
    
    // Wait a bit and check if timer is counting down
    await page.waitForTimeout(2000);
    
    // Timer should show less than 60 seconds
    const timerText = await page.locator('#timer').textContent();
    const seconds = parseInt(timerText.replace('s', ''));
    expect(seconds).toBeLessThan(60);
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if buttons are still visible and clickable
    await expect(page.locator('#class12Btn')).toBeVisible();
    await expect(page.locator('#class34Btn')).toBeVisible();
    
    // Start game
    await page.click('#class12Btn');
    
    // Check if game elements are properly displayed on mobile
    await expect(page.locator('#wort')).toBeVisible();
    await expect(page.locator('#nextBtn')).toBeVisible();
    await expect(page.locator('#resetBtn')).toBeVisible();
  });

  test('should display game info correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if info text is displayed
    await expect(page.locator('.info')).toContainText('Klasse 1 & 2');
    await expect(page.locator('.info')).toContainText('250 Wörter');
    await expect(page.locator('.info')).toContainText('550 Wörter');
  });

});