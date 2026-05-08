// dataService.js - Handles loading and providing game data
let ingredients = [];
let profiles = [];
let documentaries = [];

let maxIngredientValues = {
    carbs_g: 0,
    protein_g: 0,
    fats_g: 0,
    sat_fats_g: 0,
    water_l: 0,
    land_m2: 0
};

export function validateIngredient(ingredient) {
    const required = ['id', 'name', 'emoji', 'serving_size_g', 'calories', 'carbs_g', 'fats_g', 'protein_g', 'water_l', 'land_m2'];
    return required.every(key => ingredient.hasOwnProperty(key) && typeof ingredient[key] === 'number' || key === 'id' || key === 'name' || key === 'emoji');
}

export function validateProfile(profile) {
    const required = ['id', 'name', 'emoji', 'description', 'target_kcal', 'pct_carbs', 'pct_fats', 'pct_protein'];
    return required.every(key => profile.hasOwnProperty(key));
}

export function validateDocumentary(doc) {
    const required = ['id', 'title', 'hook', 'image_url', 'trailer_url', 'triggers'];
    return required.every(key => doc.hasOwnProperty(key) && (Array.isArray(doc.triggers) || key !== 'triggers'));
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

export function getRandomIngredient(exclude = null) {
    if (ingredients.length === 0) return null;
    if (ingredients.length === 1) return ingredients[0];

    let randomIngredient;
    do {
        const index = Math.floor(Math.random() * ingredients.length);
        randomIngredient = ingredients[index];
    } while (exclude && randomIngredient.id === exclude.id);
    return randomIngredient;
}

export function getRandomProfile() {
    if (profiles.length === 0) return null;
    const index = Math.floor(Math.random() * profiles.length);
    return profiles[index];
}