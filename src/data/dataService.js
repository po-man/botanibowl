// dataService.js - Handles loading and providing game data
let ingredients = [];
let profiles = [];
let documentaries = [];
let i18n = {};

let maxIngredientValues = {
    carbs_g: 0,
    protein_g: 0,
    fats_g: 0,
    sat_fats_g: 0,
    water_l: 0,
    land_m2: 0
};

// Tunable factor for ingredient weighting. 0 = uniform, >1 = favors high-macro ingredients.
const MACRO_WEIGHTING_FACTOR = 0.6;

export function validateIngredient(ingredient) {
    const required = ['id', 'name_en', 'name_zh', 'emoji', 'serving_size_g', 'calories', 'carbs_g', 'fats_g', 'protein_g', 'water_l', 'land_m2'];
    return required.every(key => ingredient.hasOwnProperty(key));
}

export function validateProfile(profile) {
    const required = ['id', 'name_en', 'name_zh', 'emoji', 'description_en', 'description_zh', 'target_kcal', 'pct_carbs', 'pct_fats', 'pct_protein'];
    return required.every(key => profile.hasOwnProperty(key));
}

export function validateDocumentary(doc) {
    const required = ['id', 'title_en', 'title_zh', 'hook_en', 'hook_zh', 'image_url', 'trailer_url'];
    return required.every(key => doc.hasOwnProperty(key));
}

export async function loadData() {
    try {
        const ingredientsResponse = await fetch('./data/ingredients.json');
        const rawIngredients = await ingredientsResponse.json();
        ingredients = rawIngredients.filter(validateIngredient);
        calculateMaxIngredientValues(); // Calculate max values after loading ingredients

        const profilesResponse = await fetch('./data/profiles.json');
        const rawProfiles = await profilesResponse.json();
        profiles = rawProfiles.filter(validateProfile);

        const documentariesResponse = await fetch('./data/documentaries.json');
        const rawDocumentaries = await documentariesResponse.json();
        documentaries = rawDocumentaries.filter(validateDocumentary);

        const i18nResponse = await fetch('./data/i18n.json');
        const i18nData = await i18nResponse.json();
        i18n = i18nData[0]; // The data is nested in an array
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function calculateMaxIngredientValues() {
    ingredients.forEach(ing => {
        maxIngredientValues.carbs_g = Math.max(maxIngredientValues.carbs_g, ing.carbs_g);
        maxIngredientValues.protein_g = Math.max(maxIngredientValues.protein_g, ing.protein_g);
        maxIngredientValues.fats_g = Math.max(maxIngredientValues.fats_g, ing.fats_g);
        maxIngredientValues.sat_fats_g = Math.max(maxIngredientValues.sat_fats_g || 0, ing.sat_fats_g || 0);
        maxIngredientValues.water_l = Math.max(maxIngredientValues.water_l, ing.water_l);
        maxIngredientValues.land_m2 = Math.max(maxIngredientValues.land_m2, ing.land_m2);
    });
}

export function getIngredients() {
    return ingredients;
}

export function getProfiles() {
    return profiles;
}

export function getDocumentaries() {
    return documentaries;
}

export function getMaxIngredientValues() {
    return maxIngredientValues;
}

export function getTranslations(lang) {
    return i18n[lang] || i18n['en'];
}

export function isAnimal(ingredient) {
    if (!ingredient) return false;
    // Milk is categorized as a Drink but is an animal product.
    return ingredient.category === 'Animal-Based' || ingredient.id === 'milk';
}

export function getRandomIngredient(cardsDrawn, hasDrawnAnimal, hasDrawnPlant, exclude = null) {
    if (ingredients.length === 0) return null;

    let forceType = null;
    // In the first 3 cards (0, 1, 2), ensure a mix of plant and animal products.
    if (cardsDrawn < 3) {
        if (cardsDrawn === 2) { // This is the 3rd card being drawn
            if (!hasDrawnAnimal) forceType = 'animal';
            else if (!hasDrawnPlant) forceType = 'plant';
        }
    }

    let ingredientPool = ingredients;

    if (forceType === 'animal') {
        ingredientPool = ingredients.filter(isAnimal);
    } else if (forceType === 'plant') {
        ingredientPool = ingredients.filter(ing => !isAnimal(ing));
    }

    // Fallback if the forced pool is empty for some reason
    if (ingredientPool.length === 0) {
        ingredientPool = ingredients;
    }

    // Weighted random selection from the (potentially filtered) pool
    let randomIngredient;
    let attempts = 0;
    do {
        const weights = ingredientPool.map(ing => {
            // Calculate a "macro score" for weighting. Add a small epsilon to avoid Math.pow(0, ...) issues.
            const macroScore = ing.carbs_g + ing.protein_g + ing.fats_g + 0.01;
            return Math.pow(macroScore, MACRO_WEIGHTING_FACTOR);
        });

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let randomValue = Math.random() * totalWeight;

        for (let i = 0; i < ingredientPool.length; i++) {
            randomValue -= weights[i];
            if (randomValue <= 0) {
                randomIngredient = ingredientPool[i];
                break;
            }
        }

        // Fallback for the rare case where the loop finishes without selecting (floating point issues)
        if (!randomIngredient) {
            randomIngredient = ingredientPool[Math.floor(Math.random() * ingredientPool.length)];
        }
        attempts++;
    } while (exclude && randomIngredient.id === exclude.id && ingredientPool.length > 1 && attempts < 10);

    // Final check to prevent infinite loops if the pool is very small
    if (exclude && randomIngredient.id === exclude.id && ingredientPool.length <= 1) {
        return randomIngredient;
    }
    return randomIngredient;
}

export function getRandomProfile() {
    if (profiles.length === 0) return null;
    const index = Math.floor(Math.random() * profiles.length);
    return profiles[index];
}

export function preloadDocumentaryImages() {
    if (!documentaries || documentaries.length === 0) return;
    documentaries.forEach(doc => {
        if (doc.image_url) {
            const img = new Image();
            img.src = doc.image_url;
        }
    });
}