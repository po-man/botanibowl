// bowl.js - Bowl component
export function createBowl(gameState, onServeMeal) {
    const container = document.createElement('div');
    container.className = 'bowl';
    updateBowl(container, gameState, onServeMeal);
    return container;
}

export function updateBowl(container, gameState, onServeMeal) {
    const bowlHTML = gameState.bowl.map(ing => `<span class="ingredient">${ing.emoji}</span>`).join('');
    const hasIngredients = gameState.bowl.length > 0;
    const isFull = gameState.bowl.length >= 12;
    container.innerHTML = `
        <div class="ingredients">${bowlHTML}</div>
        <button id="serve-btn" ${hasIngredients ? '' : 'disabled class="disabled"'}>${isFull ? 'Serve Meal' : 'Serve Meal'}</button>
    `;
    const serveBtn = container.querySelector('#serve-btn');
    if (serveBtn && hasIngredients) {
        serveBtn.addEventListener('click', onServeMeal);
    }
}