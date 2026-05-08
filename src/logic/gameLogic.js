// gameLogic.js - Core game logic and calculations
import { getRandomIngredient, getRandomProfile, getDocumentaries } from '../data/dataService.js';

export class GameState {
    constructor() {
        this.currentState = 'MENU'; // MENU, GAMEPLAY, RESULTS
        this.currentProfile = null;
        this.targets = {};
        this.current = {
            kcal: 0,
            carbs_g: 0,
            fats_g: 0,
            sat_fats_g: 0,
            protein_g: 0,
            water_l: 0,
            land_m2: 0
        };
        this.bowl = []; // array of added ingredients
        this.currentCard = null;
        this.nextCard = null;
        this.tutorialCompleted = false;
    }

    resetRound() {
        this.currentProfile = getRandomProfile();
        this.targets = calculateTargets(this.currentProfile);
        this.current = {
            kcal: 0,
            carbs_g: 0,
            fats_g: 0,
            sat_fats_g: 0,
            protein_g: 0,
            water_l: 0,
            land_m2: 0
        };
        this.bowl = [];
        this.currentCard = getRandomIngredient();
        this.nextCard = getRandomIngredient(this.currentCard);
    }

    addIngredient(ingredient) {
        if (this.isBowlFull()) {
            return false;
        }
        this.bowl.push(ingredient);
        this.current.kcal += ingredient.calories;
        this.current.carbs_g += ingredient.carbs_g;
        this.current.fats_g += ingredient.fats_g;
        this.current.sat_fats_g += ingredient.sat_fats_g;
        this.current.protein_g += ingredient.protein_g;
        this.current.water_l += ingredient.water_l;
        this.current.land_m2 += ingredient.land_m2;
        return true;
    }

    removeIngredient(index) {
        const ingredient = this.bowl[index];
        if (!ingredient) {
            return false;
        }
        this.current.kcal = Math.max(0, this.current.kcal - ingredient.calories);
        this.current.carbs_g = Math.max(0, this.current.carbs_g - ingredient.carbs_g);
        this.current.fats_g = Math.max(0, this.current.fats_g - ingredient.fats_g);
        this.current.sat_fats_g = Math.max(0, this.current.sat_fats_g - ingredient.sat_fats_g);
        this.current.protein_g = Math.max(0, this.current.protein_g - ingredient.protein_g);
        this.current.water_l = Math.max(0, this.current.water_l - ingredient.water_l);
        this.current.land_m2 = Math.max(0, this.current.land_m2 - ingredient.land_m2);
        this.bowl.splice(index, 1);
        return true;
    }

    advanceCard() {
        this.currentCard = this.nextCard;
        this.nextCard = getRandomIngredient(this.currentCard);
    }

    completeTutorial() {
        this.tutorialCompleted = true;
    }

    isBowlFull() {
        return this.bowl.length >= 18;
    }

    isRoundComplete() {
        return this.current.kcal >= this.targets.target_kcal * 0.9;
    }

    evaluateBowl() {
        const feedback = [];
        const satFatLimit = this.targets.target_kcal * 0.1 / 9; // grams
        if (this.current.sat_fats_g > satFatLimit) {
            feedback.push("Oof, my arteries. That was delicious, but way too high in saturated fats. I need a nap.");
        }
        if (this.current.water_l > this.targets.water_budget_l) {
            feedback.push("Did you drain a whole lake to make this? The water footprint on this bowl is massive.");
        }
        if (this.current.land_m2 > this.targets.land_budget_m2) {
            feedback.push("A whole forest had to be cleared just to fit this meal on a plate. Not very sustainable.");
        }
        if (this.current.protein_g < this.targets.protein_g * 0.85) {
            feedback.push("I'm still feeling a bit weak. This bowl didn't have nearly enough protein for my goals.");
        }
        if (this.current.carbs_g > this.targets.carbs_g * 1.15) {
            feedback.push("Carb coma! Way too heavy on the starches.");
        }
        const carbsInRange = Math.abs(this.current.carbs_g - this.targets.carbs_g) <= this.targets.carbs_g * 0.15;
        const fatsInRange = Math.abs(this.current.fats_g - this.targets.fats_g) <= this.targets.fats_g * 0.15;
        const proteinInRange = Math.abs(this.current.protein_g - this.targets.protein_g) <= this.targets.protein_g * 0.15;
        if (carbsInRange && fatsInRange && proteinInRange && this.current.sat_fats_g <= satFatLimit && this.current.water_l <= this.targets.water_budget_l && this.current.land_m2 <= this.targets.land_budget_m2) {
            feedback.push("Absolutely brilliant. You hit my macros perfectly, kept my heart healthy, and didn't destroy the planet doing it. A masterclass in sustainable nutrition!");
        }
        return feedback.join(' ');
    }

    getRecommendedDoc() {
        const docs = getDocumentaries();
        if (docs.length === 0) return null;

        // Tally categories
        const categoryCount = {};
        this.bowl.forEach(ing => {
            const cat = ing.category;
            categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });

        // Find most common category
        let maxCount = 0;
        let topCategory = null;
        for (const cat in categoryCount) {
            if (categoryCount[cat] > maxCount) {
                maxCount = categoryCount[cat];
                topCategory = cat;
            }
        }

        // Find doc with that trigger
        const recommended = docs.find(doc => doc.triggers.includes(topCategory));
        return recommended || docs.find(doc => doc.id === 'kiss_the_ground') || docs[0];
    }

    getStarMetrics() {
        const metrics = {
            carbs: { met: false, color: '#FFD700' },
            protein: { met: false, color: '#FF6347' },
            fats: { met: false, color: '#0000FF' },
            water: { met: false, color: '#00BFFF' },
            land: { met: false, color: '#8B4513' },
        };

        // Check if macros are within +/- 10% of target
        if (Math.abs(this.current.carbs_g - this.targets.carbs_g) <= this.targets.carbs_g * 0.10) metrics.carbs.met = true;
        if (Math.abs(this.current.protein_g - this.targets.protein_g) <= this.targets.protein_g * 0.10) metrics.protein.met = true;
        if (Math.abs(this.current.fats_g - this.targets.fats_g) <= this.targets.fats_g * 0.10) metrics.fats.met = true;

        // Check if eco stats are within budget
        if (this.current.water_l <= this.targets.water_budget_l) metrics.water.met = true;
        if (this.current.land_m2 <= this.targets.land_budget_m2) metrics.land.met = true;

        return metrics;
    }
}

export function calculateTargets(profile) {
    const carbs_g = (profile.target_kcal * profile.pct_carbs) / 4;
    const fats_g = (profile.target_kcal * profile.pct_fats) / 9;
    const protein_g = (profile.target_kcal * profile.pct_protein) / 4;
    const sat_fat_limit_g = (profile.target_kcal * 0.1) / 9;
    const water_budget_l = profile.target_kcal * 1.5;
    const land_budget_m2 = profile.target_kcal * 0.02;
    return {
        target_kcal: profile.target_kcal,
        carbs_g,
        fats_g,
        protein_g,
        sat_fat_limit_g,
        water_budget_l,
        land_budget_m2
    };
}