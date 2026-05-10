// gameLogic.js - Core game logic and calculations
import { getRandomIngredient, getRandomProfile, getDocumentaries, getTranslations, isAnimal } from '../data/dataService.js';

export class GameState {
    constructor() {
        this.currentState = 'MENU'; // MENU, GAMEPLAY, RESULTS
        this.currentProfile = null;
        this.language = 'zh'; // 'en' or 'zh'
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
        this.bowlTutorialCompleted = false;
        this.cardsDrawn = 0;
        this.hasDrawnAnimal = false;
        this.hasDrawnPlant = false;
    }

    setLanguage(lang) {
        this.language = lang;
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
        this.cardsDrawn = 0;
        this.hasDrawnAnimal = false;
        this.hasDrawnPlant = false;

        // Get the first two cards with special logic
        this.currentCard = this.getNextIngredient();
        this.nextCard = this.getNextIngredient(this.currentCard);
    }

    getNextIngredient(exclude = null) {
        const ingredient = getRandomIngredient(this.cardsDrawn, this.hasDrawnAnimal, this.hasDrawnPlant, exclude);
        this.cardsDrawn++;
        if (isAnimal(ingredient)) this.hasDrawnAnimal = true;
        else this.hasDrawnPlant = true;
        return ingredient;
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
        this.nextCard = this.getNextIngredient(this.currentCard);
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
        const t = getTranslations(this.language);
        const feedback = [];
        const satFatLimit = this.targets.target_kcal * 0.1 / 9; // grams

        let healthFlag = false;
        let ecoFlag = false;

        // Custom Chicken Check
        const chickenCount = this.bowl.filter(ing => ing.id === 'chicken').length;
        if (chickenCount > 1) {
            feedback.push(t.feedback_high_chicken);
        }

        // 1. Health Checks
        if (this.current.sat_fats_g > satFatLimit) {
            feedback.push(t.feedback_sat_fat);
            healthFlag = true;
        }
        if (this.current.protein_g < this.targets.protein_g * 0.85) {
            feedback.push(t.feedback_low_protein);
            healthFlag = true;
        }
        if (this.current.carbs_g > this.targets.carbs_g * 1.15) {
            feedback.push(t.feedback_high_carbs);
            healthFlag = true;
        }

        // 2. Eco Checks
        if (this.current.water_l > this.targets.water_budget_l) {
            feedback.push(t.feedback_high_water);
            ecoFlag = true;
        }
        if (this.current.land_m2 > this.targets.land_budget_m2) {
            feedback.push(t.feedback_high_land);
            ecoFlag = true;
        }

        // 3. Perfect Score Check
        const carbsInRange = Math.abs(this.current.carbs_g - this.targets.carbs_g) <= this.targets.carbs_g * 0.10;
        const fatsInRange = Math.abs(this.current.fats_g - this.targets.fats_g) <= this.targets.fats_g * 0.10;
        const proteinInRange = Math.abs(this.current.protein_g - this.targets.protein_g) <= this.targets.protein_g * 0.10;

        if (carbsInRange && fatsInRange && proteinInRange && !healthFlag && !ecoFlag) {
            return t.feedback_perfect;
        }

        // 4. The Guaranteed Fallback (Fixes the empty string bug)
        // If the bowl is mediocre (macros off, but didn't trip extreme flags)
        if (feedback.length === 0) {
            const animalProductsCount = this.bowl.filter(i => i.category === 'Animal-Based').length;

            if (animalProductsCount > 0) {
                feedback.push(t.feedback_fallback_animal);
            } else {
                feedback.push(t.feedback_fallback_plant);
            }
        }

        return feedback.join(' ');
    }

    getRecommendedDoc() {
        const docs = getDocumentaries();
        if (docs.length === 0) return null;

        const satFatLimit = this.targets.target_kcal * 0.1 / 9;
        const highSatFat = this.current.sat_fats_g > satFatLimit;
        const highLand = this.current.land_m2 > this.targets.land_budget_m2;
        const highWater = this.current.water_l > this.targets.water_budget_l;

        const chickenCount = this.bowl.filter(ing => ing.id === 'chicken').length;
        const hasSeafood = this.bowl.some(ing => ing.id === 'fish' || ing.id === 'prawns');
        const animalProductsCount = this.bowl.filter(i => i.category === 'Animal-Based').length;

        const goodProtein = this.current.protein_g >= this.targets.protein_g * 0.85;

        // 0. High-priority Chicken check
        if (chickenCount > 1) {
            return docs.find(d => d.id === 'the_chicken_whisperer') || docs[0];
        }

        // 1. Eco Violations -> Cowspiracy
        if (highLand || highWater) {
            return docs.find(d => d.id === 'cowspiracy') || docs[0];
        }
        // 2. Seafood -> Seaspiracy
        if (hasSeafood) {
            return docs.find(d => d.id === 'seaspiracy') || docs[0];
        }
        // 3. Health Violations (Sat Fats / High Meat) -> What the Health
        if (highSatFat || animalProductsCount >= 2) {
            return docs.find(d => d.id === 'what_the_health') || docs[0];
        }
        // 4. WFPB Win (Good protein, no meat) -> The Game Changers
        if (animalProductsCount === 0 && goodProtein) {
            return docs.find(d => d.id === 'the_game_changers') || docs[0];
        }

        // 5. General Fallback -> Forks Over Knives
        return docs.find(d => d.id === 'forks_over_knives') || docs[0];
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