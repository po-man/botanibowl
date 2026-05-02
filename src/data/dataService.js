// dataService.js - Handles loading and providing game data
let ingredients = [];
let profiles = [];

export function validateIngredient(ingredient) {
    const required = ['id', 'name', 'emoji', 'serving_size_g', 'calories', 'carbs_g', 'fats_g', 'sat_fats_g', 'protein_g', 'water_l', 'land_m2'];
    return required.every(key => ingredient.hasOwnProperty(key) && typeof ingredient[key] === 'number' || key === 'id' || key === 'name' || key === 'emoji');
}

export function validateProfile(profile) {
    const required = ['id', 'name', 'target_kcal', 'pct_carbs', 'pct_fats', 'pct_protein'];
    return required.every(key => profile.hasOwnProperty(key) && typeof profile[key] === 'number' || key === 'id' || key === 'name');
}

export async function loadData() {
    try {
        const ingredientsResponse = await fetch('./data/ingredients.json');
        const rawIngredients = await ingredientsResponse.json();
        ingredients = rawIngredients.filter(validateIngredient);

        const profilesResponse = await fetch('./data/profiles.json');
        const rawProfiles = await profilesResponse.json();
        profiles = rawProfiles.filter(validateProfile);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

export function getIngredients() {
    return ingredients;
}

export function getProfiles() {
    return profiles;
}

export function getRandomIngredient() {
    if (ingredients.length === 0) return null;
    const index = Math.floor(Math.random() * ingredients.length);
    return ingredients[index];
}

export function getRandomProfile() {
    if (profiles.length === 0) return null;
    const index = Math.floor(Math.random() * profiles.length);
    return profiles[index];
}