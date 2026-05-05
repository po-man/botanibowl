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
    const isFull = gameState.isBowlFull();

    const buttonClasses = [isFull ? 'shine' : '', !hasIngredients ? 'disabled' : ''].filter(Boolean).join(' ');

    container.innerHTML = `
        <div class="ingredients">${bowlHTML}</div>
        <button id="serve-btn" class="${buttonClasses}" ${hasIngredients ? '' : 'disabled'}>Serve Meal</button>
    `;
    const serveBtn = container.querySelector('#serve-btn');
    if (serveBtn && hasIngredients) {
        serveBtn.addEventListener('click', onServeMeal);
    }
}