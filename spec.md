# Eco-Bowl Technical Specification

## 1. Overview
Eco-Bowl is a mobile-first web-based game implemented as a single-page application (SPA) using modern web technologies. The game simulates a Tinder-style swiping mechanic where players build nutritional meal bowls by accepting or rejecting ingredient cards, aiming to meet caloric, macronutrient, and environmental sustainability targets. The application is entirely client-side, stateless, and hosted on GitHub Pages, with all data stored in hardcoded JSON structures.

## 2. Technology Stack
- **Frontend Framework**: React.js (with Hooks for state management) or vanilla JavaScript with ES6+ features for simplicity and performance.
- **Rendering Engine**: HTML5 Canvas API for smooth animations, card swiping interactions, and dynamic UI updates (e.g., progress bars, ghosting effects). Alternatively, use CSS animations and transforms for DOM-based rendering if Canvas proves too complex.
- **Styling**: CSS3 with Flexbox and Grid for responsive layouts, optimized for portrait-mode mobile screens. Use media queries for device adaptability.
- **JavaScript Libraries**:
  - **Hammer.js** or native Touch Events for gesture recognition (swipe left/right).
  - **Chart.js** or D3.js for the results screen pie charts and infographics.
  - No external libraries for core logic to keep bundle size minimal.
- **Build Tools**: Webpack or Vite for bundling, minification, and development server. Use Babel for ES6 transpilation.
- **Deployment**: GitHub Pages for static hosting. Use GitHub Actions for CI/CD if needed.
- **Version Control**: Git with GitHub repository.
- **Testing**: Jest for unit tests on game logic, Cypress or Puppeteer for end-to-end testing of UI interactions.
- **Performance**: Optimize for mobile with lazy loading, efficient Canvas rendering, and minimal DOM manipulation.

## 3. Architecture
The application follows a modular, component-based architecture with clear separation of concerns:
- **Stateless Design**: No server-side persistence; all state is ephemeral and managed in-memory during the session.
- **Module Structure**:
  - `data/`: Contains JSON files for ingredients and profiles.
  - `logic/`: Core game logic, calculations, and state management.
  - `ui/`: UI components and rendering logic.
  - `utils/`: Helper functions for math, animations, and utilities.
- **State Management**: Use React's useState and useEffect for component state, or a simple JavaScript object with event emitters for vanilla JS.
- **Event-Driven**: User interactions (swipes, button clicks) trigger events that update the game state and re-render the UI.
- **Responsive Design**: Mobile-first approach with touch-optimized interactions.

## 4. Modules and Components

### 4.1 Data Module
- **Purpose**: Store and provide access to game data.
- **Structure**:
  - `ingredients.json`: Array of ingredient objects (see schema below).
  - `profiles.json`: Array of diner profile objects (see schema below).
- **Implementation**: Load JSON files asynchronously on app initialization. Use a data service module to filter, search, and retrieve data.

### 4.2 Game Logic Module
- **Purpose**: Handle all calculations, state transitions, and game rules.
- **Key Functions**:
  - `calculateTargets(profile)`: Compute gram targets for macros, sat fat limit, and eco-budgets based on profile.
  - `addIngredient(ingredient, currentState)`: Update current counters (calories, macros, eco metrics) when an ingredient is added.
  - `evaluateBowl(finalState, targets)`: Run evaluation rules to generate feedback strings.
  - `generateRandomCard()`: Randomly select an ingredient from the pool.
- **State Machine**:
  - States: `MENU`, `GAMEPLAY`, `RESULTS`.
  - Transitions: MENU → GAMEPLAY (on "Serve a Customer"), GAMEPLAY → RESULTS (on serve meal), RESULTS → GAMEPLAY (on "Next Customer").
- **Calculations**:
  - Calorie conversion: carbs * 4, protein * 4, fats * 9, sat_fats * 9.
  - Target grams: (target_kcal * pct_macro) / kcal_per_gram.
  - Eco budgets: water = target_kcal * 1.5, land = target_kcal * 0.02.

### 4.3 UI Components
- **Main Menu Component**:
  - Displays title and start button.
  - Handles click event to transition to gameplay.
- **Gameplay Screen Component**:
  - **HUD Component**: Displays diner tag, calorie counter, macro bars, eco bars.
    - Macro Bars: Horizontal progress bars with colored fills (yellow for carbs, red for protein, blue for fats). Include "sweet spot" overlays for +/-10% range.
    - Eco Bars: Horizontal bars that fill rightward, turn red on overflow.
  - **Card Deck Component**: Renders a stack of cards using Canvas or positioned DIVs.
    - Each card: Image/emoji, name, serving size.
    - Swipe handling: Detect drag direction, show ghost preview on right drag, red X on left.
  - **Bowl Component**: List or visual stack of added ingredients. Shows "Serve Meal" button when calories >= 90% target.
- **Results Screen Component**:
- **Results Card Container:** Wraps all content to match the gameplay card aesthetic.
  - **Visual Plate Component:** Renders the central plate, maps over the `bowl` array to position emojis, and uses an SVG to draw the concentric `stroke-dasharray` macro rings.
  - **Feedback Component:** Displays the star rating and the compiled review text.
  - **Recommendation Component:** Renders the "Watch Next" documentary card based on logic output.

### 4.4 Input Handling Module
- **Gesture Recognition**: Use TouchEvent listeners for swipe detection.
  - Swipe left: Discard card, draw new.
  - Swipe right: Add to bowl, update state, draw new.
- **Button Interactions**: Standard click handlers for menu and results buttons.

### 4.5 Rendering and Animation Module
- **Canvas Rendering**: For smooth card animations, use requestAnimationFrame for 60fps updates.
- **Animations**: CSS transitions for bar fills, card swipes (translateX, rotate).
- **Responsive Scaling**: Adjust canvas size and element positions based on viewport.

### 4.6 Documentary Logic Engine
- **Purpose:** Analyze the final `bowl` array to recommend educational content.
- **Implementation:** A function `getRecommendation(bowl)` that scans for specific ingredient IDs or categories (e.g., high counts of 'beef' trigger *Cowspiracy*; high counts of 'fish' trigger *Seaspiracy*; perfect eco-scores trigger *The Game Changers*).

## 5. Gameplay Logic in Technical Terms
- **Initialization**: On app load, fetch JSON data. Set initial state to MENU.
- **Round Setup**: Select random profile, compute targets, reset counters (current_kcal=0, macros={}, eco={water:0, land:0}).
- **Card Drawing**: Randomly pick ingredient, render card in deck.
- **Swipe Processing**:
  - On touchstart: Record start position.
  - On touchmove: Update card position, calculate drag distance.
  - On touchend: If distance > threshold and direction right, add ingredient (update state, animate bar fills), else discard.
  - Ghost Preview: During drag right, overlay semi-transparent bar fills based on ingredient values.
- **State Updates**: Immutable state updates; recalculate totals on add.
- **End Round Trigger**: When current_kcal >= target_kcal * 0.9 or manual serve, transition to RESULTS.
- **Evaluation**: Loop through rules array, check conditions against final state, concatenate feedback strings.
- **UI Updates**: Reactive rendering; components re-render on state changes.

## 6. UI Design Details
- **Layout**: Vertical stack (HUD top, cards middle, bowl bottom) using Flexbox.
- **Colors**: Natural palette - greens (#4CAF50), browns (#8D6E63), whites (#FFFFFF), reds for warnings (#F44336).
- **Typography**: Sans-serif fonts (e.g., Roboto) for readability on mobile.
- **Accessibility**: ARIA labels for screen readers, high contrast ratios.
- **Mobile Optimization**: Viewport meta tag, prevent zoom on double-tap, landscape lock if possible.

## 7. Data Structures
- **Profile Schema**:
  ```json
  {
    "id": "string",
    "name": "string",
    "target_kcal": number,
    "pct_carbs": number,
    "pct_fats": number,
    "pct_protein": number
  }
  ```
- **Ingredient Schema**:
  ```json
  {
    "id": "string",
    "name": "string",
    "emoji": "string",
    "serving_size_g": 100,
    "calories": number,
    "carbs_g": number,
    "fats_g": number,
    "sat_fats_g": number,
    "protein_g": number,
    "water_l": number,
    "land_m2": number
  }
  ```
- **Documentary Schema**:
  ```json
  {
    "id": "seaspiracy",
    "title": "Seaspiracy",
    "hook": "Curious about the true cost of that salmon?",
    "image_url": "./assets/posters/seaspiracy.jpg",
    "trailer_url": "https://www.youtube.com/watch?v=1Q5CXN7soQg",
    "trigger_categories": ["Meat & Seafood"]
  }
  ```

## 8. Development Workflow
- **Version Control**: Feature branches, pull requests.
- **Testing**: Unit tests for logic functions, integration tests for UI flows.
- **Performance Monitoring**: Use Lighthouse for web vitals.
- **Deployment**: Push to GitHub main branch triggers Pages deployment.

## 9. Potential Challenges and Solutions
- **Swipe Responsiveness**: Test on various devices; fallback to click buttons if gestures fail.
- **Canvas Performance**: Limit redraws, use offscreen canvases for complex animations.
- **Data Accuracy**: Validate JSON against schemas.
- **Scalability**: Keep data small; lazy load if needed (though not required).

This spec provides a comprehensive blueprint for implementing Eco-Bowl, ensuring a robust, engaging, and technically sound game.