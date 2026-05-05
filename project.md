# Game Development Specification: Eco-Bowl

## 1. Project Overview
* **Concept:** A Tinder-style swiping game where players build a meal bowl by accepting or rejecting falling ingredient cards.
* The goal is to meet specific, randomly generated nutritional targets while minimizing environmental impact (Water and Land use).
* **Platform:** Mobile-first Web Application (HTML5, CSS3, JavaScript/Canvas or React).
* **Architecture:** 100% Stateless and Client-Side. Hosted on GitHub Pages. No backend database.
* All data is stored in hardcoded JSON arrays. State is maintained only during the active session.

## 2. Core Game Logic & Math

### 2.1 Calorie & Macro Calculations (Atwater System)
The game uses standard nutritional math to calculate calories from grams.
* **Carbs:** 1 gram = 4 kcal
* **Protein:** 1 gram = 4 kcal
* **Fats:** 1 gram = 9 kcal
* *Note: Saturated Fats are a subset of total fats. 1g Sat Fat = 9 kcal.*

### 2.2 Target Generation (The Patient Profiles)
At the start of each round, the game randomly selects a "Diner Profile" JSON object. This dictates the goals for the round.

**Profile Schema & Examples:**
* **Standard Adult:** Target: 1500 kcal. Ratio: 50% Carbs, 30% Fats, 20% Protein.
* **Child:** Target: 1000 kcal. Ratio: 55% Carbs, 30% Fats, 15% Protein.
* **Athlete:** Target: 1800 kcal. Ratio: 45% Carbs, 25% Fats, 30% Protein.
* **Keto Dieter:** Target: 1600 kcal. Ratio: 10% Carbs, 65% Fats, 25% Protein.

**Calculating Gram Targets per Round:**
Once a profile is selected, the game calculates the target grams for the UI bars.
*Example (Adult - 1500 kcal):*
* **Carbs Target:** (1500 * 0.50) / 4 = 187.5g
* **Fats Target:** (1500 * 0.30) / 9 = 50.0g
* **Protein Target:** (1500 * 0.20) / 4 = 75.0g
* **Saturated Fat Limit:** (1500 * 0.10) / 9 = 16.6g *(Hidden metric, checked at the end)*

### 2.3 Eco-Budgets
To give the player a visual boundary for environmental impact, calculate an "Eco Budget" based on the total target calories.
* **Water Budget:** 1.5 Liters per Target kcal (e.g., 1500 kcal target = 2250L limit).
* **Land Budget:** 0.02 m² per Target kcal (e.g., 1500 kcal target = 30m² limit).

## 3. Detailed User Interface (UI)
The UI is optimized for portrait-mode mobile screens.

### 3.1 Main Menu
* **Title:** Eco-Bowl
* **Button:** "Serve a Customer" (Starts the game).
* **Styling:** Clean, minimalist, natural colors (greens, earthy browns, clean whites).

### 3.2 Gameplay Screen (The Swipe Interface)
Divided into three vertical sections:

**Top Section: The HUD (Heads Up Display)**
* **Diner Tag:** Text showing current target (e.g., "Target: Athlete - 1800 kcal").
* **Calorie Counter:** Large text (e.g., "Current: 450 / 1800 kcal").
* **Macro Bars (3 Horizontal Bars):** Carbs, Protein, Fats. Background: Light gray. Fill: Colored (Yellow for Carbs, Red for Protein, Blue for Fats).
* **The Sweet Spot:** A shaded vertical bracket on each bar representing +/- 10% of the target gram amount.
* **Eco Bars (2 Horizontal Bars):** Water, Land. Fill: Starts empty, fills up towards the right. Turns Red if it exceeds the calculated Eco-Budget limit.

**Middle Section: The Card Deck**
A stack of physical-looking cards.
* **Card UI:** Large Illustration/Emoji of the ingredient, Name (e.g., "Ground Beef", "Tofu", "Spinach"), Serving Size (Always 100g to keep math consistent).
* **Interaction (The Ghosting Effect):** As the user drags the card Right, the HUD bars show a transparent/ghosted preview of how much the ingredient will fill the bars. This is crucial for planning. Dragging Left shows a red "X" (Skip ingredient).

**Bottom Section: The Bowl**
* Visual representation of added ingredients (can be an overlapping list of emojis or a simple text log).
* **"Serve Meal" Button:** Appears/Highlights only when the user's total calories reach at least 90% of the Target Calories.

### 3.3 The Results Screen
The results screen is designed to feel like a seamless continuation of the gameplay, utilizing a modern, highly visual "Plate Breakdown" and offering real-world educational takeaways.
* **Layout & Style:** The screen uses the game's core green/brown gradient background (`#4CAF50` to `#8D6E63`). The main content is housed within a large, floating white "Card" to mimic the gameplay ingredient cards, complete with rounded corners and a drop shadow.
* **Diner Tag Header:** A sticky header at the top of the card reminding the player of the target (e.g., "Athlete - 1800 kcal").
* **The Visual Plate (Replacing the Pie Chart):** * A top-down circular "plate" element.
  * **Emoji Scatter:** The emojis of all ingredients the player added to their bowl are visually scattered/arranged onto this plate.
  * **Macro Rings:** Wrapping around the perimeter of the plate are three sleek, concentric progress rings (styled like Apple Watch activity rings) representing Carbs (Yellow), Protein (Red), and Fats (Blue). The rings fill up based on the percentage of the target hit.
* **The "Yelp Review" & Eco-Stats:** * The dynamic feedback string generated by the evaluation rules, presented with a 1-to-5 star visual rating based on performance.
  * Eco-stats (Water and Land) are displayed with clean typography or iconography below the review.
* **"Food for Thought" (Documentary Card):**
  * A Netflix-style thumbnail section recommending a relevant documentary based on the player's ingredient choices.
  * Includes a high-quality poster image, title, a short hook, and a "Watch Trailer" external link button.
* **Next Customer Button:** Prominently displayed at the bottom to restart the game loop.

## 4. Game Flow & State Machine
1. **Initialize:** Load JSON data (Ingredients, Profiles).
2. **Setup Round:** Randomly pick a Profile. Calculate Target Grams, Sat Fat Limit, and Eco-Budgets. Reset current counters to 0.
3. **Draw Card:** Randomly pick an ingredient from the JSON array.
4. **Player Input:**
   * **Swipe Left (Skip):** Discard card. Go to Step 3.
   * **Swipe Right (Add):** Add ingredient stats to current counters. Update HUD bars. Log ingredient in Bowl.
5. **Check Triggers:**
   * If Current Calories >= Target Calories (or user manually clicks "Serve Meal"): End Round. Go to Step 6.
   * Else: Go to Step 3.
6. **Evaluate:** Compare final counters against Profile targets and Eco-Budgets. Trigger specific feedback strings.
7. **Display Results:** Show the Results Screen.

## 5. Evaluation & Feedback Rules (The "Receipt")
The feedback text is generated by passing the final bowl statistics through a series of conditional checks. All triggered strings are compiled into a final review paragraph.

* **Rule 1: Saturated Fat Alert (Priority: High)**
  * **Condition:** Total Sat Fat Calories > (Total Calorie Target * 0.10)
  * **Feedback String:** "Oof, my arteries. That was delicious, but way too high in saturated fats. I need a nap."
* **Rule 2: Environmental Impact - Water**
  * **Condition:** Total Water > Water Budget
  * **Feedback String:** "Did you drain a whole lake to make this? The water footprint on this bowl is massive."
* **Rule 3: Environmental Impact - Land**
  * **Condition:** Total Land > Land Budget
  * **Feedback String:** "A whole forest had to be cleared just to fit this meal on a plate. Not very sustainable."
* **Rule 4: Macro Imbalance - Protein Deficient**
  * **Condition:** Final Protein Grams < (Protein Target * 0.85)
  * **Feedback String:** "I'm still feeling a bit weak. This bowl didn't have nearly enough protein for my goals."
* **Rule 5: Macro Imbalance - Carb Heavy**
  * **Condition:** Final Carb Grams > (Carb Target * 1.15)
  * **Feedback String:** "Carb coma! Way too heavy on the starches."
* **Rule 6: The "Eco-Warrior" Perfect Score (The Hidden Win)**
  * **Condition:** ALL Macros are within +/- 15% of targets AND Water < Budget AND Land < Budget AND Sat Fat < Limit.
  * **Feedback String:** "Absolutely brilliant. You hit my macros perfectly, kept my heart healthy, and didn't destroy the planet doing it. A masterclass in sustainable nutrition!"

## 6. Required Data Structures (JSON)
The game relies entirely on these two data schemas. The developer will populate arrays of these objects.

### 6.1 Profile Schema
```json
{
  "id": "adult_standard",
  "name": "Standard Adult",
  "target_kcal": 1500,
  "pct_carbs": 0.50,
  "pct_fats": 0.30,
  "pct_protein": 0.20
}
```

### 6.2 Ingredient Schema
(Data sourced from USDA FoodData Central & OWID)

```json
{
  "id": "beef_ground_raw",
  "name": "Ground Beef",
  "emoji": "🥩",
  "serving_size_g": 100,
  "calories": 250,
  "carbs_g": 0,
  "fats_g": 15,
  "sat_fats_g": 6,
  "protein_g": 26,
  "water_l": 1500,
  "land_m2": 16
}
```

Developer Note: Ensure a diverse mix of plant and animal-based ingredients so the player is forced to make strategic choices.