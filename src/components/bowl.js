// bowl.js - Bowl component
export function createBowl(gameState, onServeMeal) {
    const container = document.createElement('div');
    container.className = 'bowl';
    updateBowl(container, gameState, onServeMeal);
    return container;
}

export function updateBowl(container, gameState, onServeMeal) {
    const bowlHTML = gameState.bowl.map(ing => `<span class="ingredient">${ing.emoji}</span>`).join('');
    const showButton = gameState.isRoundComplete();
    container.innerHTML = `
        <div class="ingredients">${bowlHTML}</div>
        ${showButton ? '<button id="serve-btn">Serve Meal</button>' : ''}
    `;
    if (showButton) {
        container.querySelector('#serve-btn').addEventListener('click', onServeMeal);
    }
}