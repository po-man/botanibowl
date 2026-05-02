# Eco-Bowl Development To-Do List

## 1. Initialize Code Repository
   - Create a new Git repository on GitHub.
   - Clone the repository to local machine.
   - Set up basic project structure with folders for src/, public/, data/, etc.
   - Initialize package.json with npm init.
   - Commit initial empty project.

## 2. Set Up Project Structure and Dependencies
   - Install React (or choose vanilla JS) and build tools (Webpack/Vite).
   - Set up HTML5 entry point (index.html) and main JS file.
   - Configure CSS for mobile-first responsive design.
   - Add dependencies for gesture handling (Hammer.js) and charting (Chart.js).
   - Set up development server and build scripts in package.json.
   - Create initial folder structure: src/components/, src/logic/, src/data/, src/utils/.

## 3. Implement Data Module
   - Create ingredients.json and profiles.json files with sample data based on schemas.
   - Write a data service module (dataService.js) to load and parse JSON data.
   - Implement functions to retrieve random ingredients and profiles.
   - Validate JSON data against schemas using a simple validation function.
   - Export data as modules for use in other parts of the app.

## 4. Implement Game Logic Module
   - Create gameLogic.js with functions for calculating targets (calculateTargets).
   - Implement addIngredient function to update state counters.
   - Write evaluateBowl function to check rules and generate feedback.
   - Add generateRandomCard function for selecting ingredients.
   - Define state machine logic for transitions between MENU, GAMEPLAY, RESULTS.
   - Create a GameState class or object to manage current game state.

## 5. Implement UI Components
   - Build MainMenu component: render title and start button, handle click to start game.
   - Create HUD component: display diner tag, calorie counter, macro bars, eco bars.
   - Develop CardDeck component: render ingredient cards with emoji, name, serving size.
   - Implement Bowl component: show added ingredients and serve meal button.
   - Build ResultsScreen component: display pie chart, stats, feedback, next customer button.
   - Ensure all components are responsive and use CSS Flexbox/Grid.

## 6. Implement Input Handling Module
   - Set up touch event listeners for swipe gestures on card deck.
   - Implement swipe detection logic: track touch start, move, end positions.
   - Add handlers for swipe left (discard) and swipe right (add ingredient).
   - Integrate ghost preview during right swipe: update HUD bars temporarily.
   - Add click handlers for buttons (start game, serve meal, next customer).

## 7. Implement Rendering and Animation Module
   - Set up HTML5 Canvas for card animations and progress bars.
   - Implement card swipe animations using requestAnimationFrame.
   - Add CSS transitions for bar fills and UI state changes.
   - Create functions for drawing progress bars with colors and sweet spots.
   - Optimize rendering for 60fps on mobile devices.

## 8. Integrate Modules into Executable Architecture
   - Wire up components in main App component with state management.
   - Connect game logic to UI updates on state changes.
   - Implement event-driven flow: swipes trigger logic updates and re-renders.
   - Ensure stateless design: no persistence, reset on page reload.
   - Test full game flow from menu to results.

## 9. Testing and Debugging
   - Write unit tests for game logic functions using Jest.
   - Perform integration tests for UI interactions with Cypress.
   - Debug swipe responsiveness and animations on mobile devices.
   - Validate calculations against sample data.
   - Fix any performance issues with Canvas rendering.

## 10. Polish UI and Datasets
   - Refine UI styling: adjust colors, fonts, spacing for better UX.
   - Add more diverse ingredients and profiles to JSON data.
   - Implement accessibility features: ARIA labels, keyboard navigation.
   - Optimize for different screen sizes and orientations.
   - Final testing and user feedback iteration.