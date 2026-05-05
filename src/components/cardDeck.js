// cardDeck.js - Card deck component
import { getMaxIngredientValues } from '../data/dataService.js';
import { createRadarChartSVG } from '../utils/radarChart.js';
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

    const maxValues = getMaxIngredientValues();
    const currentCardRadar = createRadarChartSVG(card, maxValues);
    const nextCardRadar = createRadarChartSVG(nextCard, maxValues);

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
                <div class="radar-chart-container">${nextCardRadar}</div>
                <div class="card-info">
                    <div class="emoji">${nextCard.emoji}</div>
                    <div class="name-serving-group">
                        <div class="name">${nextCard.name}</div>
                        <div class="serving">${nextCard.serving_size_g}g</div>
                    </div>
                </div>
            </div>
            <div class="card current-card">
                <div class="radar-chart-container">${currentCardRadar}</div>
                <div class="card-info">
                    <div class="emoji">${card.emoji}</div>
                    <div class="name-serving-group">
                        <div class="name">${card.name}</div>
                        <div class="serving">${card.serving_size_g}g</div>
                    </div>
                </div>
            </div>
        </div>
        ${tutorialOverlay}
    `;
}