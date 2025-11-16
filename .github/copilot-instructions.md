# Wortspiel - AI Agent Coding Guide

## Project Overview
**Wortspiel** is a German word reading game for elementary students (ages 6-10) with three game modes: Grade 1&2 practice, Grade 3&4 extended vocabulary, and Chaos Mode (spell-checking). The entire game runs in vanilla HTML5/CSS3/JavaScript with no external dependencies except for testing infrastructure.

## Architecture & Core Components

### Single-Page Game Structure (`index.html`)
- **Game Flow**: Class selection → Game mode → Timer loop → Results display
- **Three Modes**:
  1. **Standard modes (Classes 1&2, 3&4)**: Display German words with articles; users click "Weiter" (Next) button to count read words in 60 seconds
  2. **Chaos Mode**: Shows words (70% intentionally misspelled, 30% correct); users judge "✓ Richtig" or "✗ Falsch"

### Data Structure
- **Word lists**: `wortListe12` (250 words) and `zusätzlicheWörter34` (300+ additional words) are embedded in HTML
  - Format: German words with articles as strings (e.g., `"der Apfel"`, `"die Blume"`)
  - Chaos Mode uses `verfremdeWort()` function to generate realistic German spelling mistakes

### Game State Variables
```javascript
let timerId, restzeit = 60;        // Timer management
let gelesen = 0, korrekte = 0, falsche = 0;  // Score tracking
let aktuelleWortliste = [];        // Active word list (class-specific)
let gewählteKlasse = '';           // Selected game mode: '12', '34', 'chaos'
let chaosModus = false;            // Mode flag
let istWortRichtig = true;         // Tracks correct/incorrect word in Chaos Mode
```

## Key Implementation Patterns

### Spelling Error Generation (Chaos Mode)
The `verfremdeWort()` function creates realistic German spelling errors that elementary students commonly make:
- **ck-errors**: `ck` → `k` or `kk` (Hasenöhr → Hasenör)
- **Double consonants**: Add/remove/misplace doubled letters
- **Vowel confusion**: `ei` ↔ `ai`, `ie` vs `i`, Dehnungs-h misplacement
- **Similar letter swaps**: `d`↔`t`, `b`↔`p`, `g`↔`k`, `w`↔`v`, `f`↔`v`
- **Letter omission**: Remove letters from longer words (4+ chars)
- **Articles preserved**: Never corrupt "der", "die", "das" to ensure pedagogical accuracy

To modify error types, edit the array of lambdas in `verfremdeWort()` (lines ~600-700 in HTML).

### UI Visibility Toggle Pattern
Game areas use CSS class toggling for mode switching:
```javascript
classSelection.style.display = 'none';  // Hide selection
gameArea.classList.add('active');       // Show game via CSS: .active { display: block; }
```

## Developer Workflows

### Testing & Development
```bash
npm test                    # Run full test suite (headless)
npm run test:headed        # Run tests with browser visible
npm run test:debug         # Step through tests in debug mode
npm run test:ui            # Launch Playwright UI (interactive selection)
npm start                  # Run http-server on port 3000 (http://localhost:3000)
```

**Test Infrastructure**: Playwright configuration (`playwright.config.js`) auto-starts `npm start` before tests. Set `reuseExistingServer: true` to speed up local development.

### Test Coverage Areas
- **game.spec.js**: 12 tests covering class selection, timer countdown, word advancement, Chaos Mode mechanics, mobile responsiveness, results display
- **pwa.spec.js**: iOS PWA installation tests (meta tags, Service Worker, Apple app config)

**Key test patterns**:
- Use `page.goto('/')` (baseURL set to `http://localhost:3000`)
- Mobile viewport tests: `page.setViewportSize({ width: 375, height: 667 })`
- Inject JS for timer manipulation: `page.evaluate(() => { /* game logic */ })`

### Debugging Game Logic
To verify class selection / word list assignment:
```javascript
console.log(aktuelleWortliste.length);  // 250 (class 12), 550 (class 34)
console.log(chaosModus);                 // true if Chaos Mode active
```

## Project Conventions

### CSS Architecture
- **Custom properties**: `--primary-blue`, `--primary-green`, `--primary-yellow`, `--primary-red`, `--primary-orange`, `--gradient-bg` (rainbow gradient used in logo, headings, buttons)
- **Gradient borders**: Elements use `::before` pseudo-element with `z-index: -1` to create gradient borders without layout impact (logo, word display, game cards)
- **Responsive design**: Mobile-first with breakpoints at `768px` (tablet) and `480px` (mobile). Very small screens `320px` handled separately

### Event Binding Pattern
Game modes control which UI elements are interactive:
```javascript
// Standard mode: show Next button, hide answer buttons
if (chaosModus) {
    nextBtn.style.display = 'none';
    answerButtons.classList.add('active');
} else {
    nextBtn.style.display = 'block';
    answerButtons.classList.remove('active');
}
```

### Results Display
Results are HTML-injected into `#count` div with inline styles. Template uses `.results-card` class with gradient header:
```javascript
let ergebnisText = `<div class="results-card">
  <h3>🎉 ${title}</h3>
  <p><strong>${stats}</strong></p>
</div>`;
countEl.innerHTML = ergebnisText;
```

## Integration Points & External Dependencies

### PWA Configuration
- **Service Worker**: Registered with scope calculated from `location.pathname` to support GitHub Pages subpath deployment
  - Script auto-detects repo name (e.g., `/wortspiel/`) and registers `sw.js` accordingly
  - Manifest.json path dynamically updated via `#site-manifest` element

### Browser APIs Used
- `navigator.serviceWorker.register()` for offline capability
- `setInterval()` / `clearInterval()` for 60-second timer
- `Math.random()` for word selection and Chaos Mode error probability (70/30 split)
- `Math.floor()` for array indexing

### No External Dependencies
- **Frontend**: Pure HTML5/CSS3/JavaScript (no frameworks, no npm modules in production)
- **Testing**: Playwright + Axe Core (a11y audits)
- **Dev server**: http-server for local development

## Git Workflow
- **Default branch**: `main`
- **License**: MIT (see LICENSE file)
- **CI/CD**: GitHub Actions (see `.github/workflows/`)

## Common Tasks

### Adding New Words
Edit word lists in `index.html`:
```javascript
const wortListe12 = ["der Hund", "die Katze", ...];  // Lines ~50-80
const zusätzlicheWörter34 = ["das Abenteuer", ...];  // Lines ~80-180
```
Rebuild word list for grade 3-4: `const wortListe34 = [...wortListe12, ...zusätzlicheWörter34];`

### Adjusting Game Timer
`restzeit = 60;` (line ~450) sets the timer to 60 seconds. Change to alter game duration.

### Modifying Chaos Mode Error Rate
In `verfremdeWort()`, the line `istWortRichtig = Math.random() < 0.3;` sets 30% correct words. Change `0.3` to adjust ratio (e.g., `0.5` = 50% correct).

### Testing Mobile UI
Run `npm run test:headed -- --project="Mobile Safari"` to test on iPhone 12 viewport.

## Style Guide Notes
- **Colors**: Use CSS variables (`--primary-*`) from `:root` for theming consistency
- **Spacing**: Buttons use `margin: 1rem 0`, game cards use `padding: 2rem`
- **Typography**: "Segoe UI" stack; headings use gradient text (`-webkit-background-clip: text`)
- **Accessibility**: Meta tag-based PWA config; test with Axe Core in CI
