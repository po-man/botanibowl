// cardDeck.js - Card deck component
export function createCardDeck(gameState) {
    const container = document.createElement('div');
    container.className = 'card-deck';
    updateCardDeck(container, gameState);
    return container;
}

export function updateCardDeck(container, gameState) {
    const card = gameState.currentCard;
    const nextCard = gameState.nextCard;
    if (!card || !nextCard) return;

    const tutorialOverlay = !gameState.tutorialCompleted ? `
        <div class="tutorial-overlay">
            <div class="tutorial-arrow left">
                <span class="arrow">◀◀</span>
                <span class="caption">Skip</span>
            </div>
            <div class="tutorial-arrow right">
                <span class="arrow">▶▶</span>
                <span class="caption">Keep</span>
            </div>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="card-stack">
            <div class="card next-card">
                <div class="emoji">${nextCard.emoji}</div>
                <div class="name">${nextCard.name}</div>
                <div class="serving">100g</div>
            </div>
            <div class="card current-card">
                <div class="emoji">${card.emoji}</div>
                <div class="name">${card.name}</div>
                <div class="serving">100g</div>
            </div>
        </div>
        ${tutorialOverlay}
    `;
}