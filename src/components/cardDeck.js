// cardDeck.js - Card deck component
export function createCardDeck(gameState) {
    const container = document.createElement('div');
    container.className = 'card-deck';
    updateCardDeck(container, gameState);
    return container;
}

export function updateCardDeck(container, gameState) {
    const card = gameState.currentCard;
    if (!card) return;

    container.innerHTML = `
        <div class="card">
            <div class="emoji">${card.emoji}</div>
            <div class="name">${card.name}</div>
            <div class="serving">100g</div>
        </div>
    `;
}