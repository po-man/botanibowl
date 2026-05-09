import { getMaxIngredientValues } from '../data/dataService.js';
import { getTranslations } from '../data/dataService.js';
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
    const t = getTranslations(gameState.language);
    if (!card || !nextCard) return;

    // 1. Add this new helper function to sanitize the category name
    const getCategoryClass = (ingredient) => {
        if (!ingredient || !ingredient.category) return 'type-neutral';
        // Converts "Animal-Based" to "type-animal-based", "Seafood" to "type-seafood", etc.
        return `type-${ingredient.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    };

    const getSpecialRemark = (ingredient) => {
        if (ingredient.category.includes('Antioxidant-Rich')) {
            return `<div class="special-remark">${t.rich_in_antioxidants}</div>`;
        }
        if (ingredient.category.includes('Vitamin C')) {
            return `<div class="special-remark">${t.rich_in_vitamin_c}</div>`;
        }
        return '';
    };

    const maxValues = getMaxIngredientValues();
    const currentCardRadar = createRadarChartSVG(card, maxValues);
    const nextCardRadar = createRadarChartSVG(nextCard, maxValues);

    const tutorialOverlay = !gameState.tutorialCompleted ? `
        <div class="tutorial-overlay">
            <div class="tutorial-arrow left">
                <span class="arrow">◀◀</span>
                <span class="caption">${t.skip}</span>
            </div>
            <div class="tutorial-arrow right">
                <span class="arrow">▶▶</span>
                <span class="caption">${t.keep}</span>
            </div>
        </div>
    ` : '';

    // 2. Inject the dynamic classes into the next-card and current-card divs
    container.innerHTML = `
        <div class="card-stack">
            <div class="card next-card ${getCategoryClass(nextCard)}">
                <div class="radar-chart-container">${nextCardRadar}</div>
                <div class="card-info">
                    <div class="emoji">${nextCard.emoji}</div>
                    <div class="name-serving-group">
                        <div class="name">${nextCard[`name_${gameState.language}`]}</div>
                        <div class="serving">${nextCard.serving_size_g}g</div>
                    </div>
                    ${getSpecialRemark(nextCard)}
                </div>
            </div>
            <div class="card current-card ${getCategoryClass(card)}">
                <div class="radar-chart-container">${currentCardRadar}</div>
                <div class="card-info">
                    <div class="emoji">${card.emoji}</div>
                    <div class="name-serving-group">
                        <div class="name">${card[`name_${gameState.language}`]}</div>
                        <div class="serving">${card.serving_size_g}g</div>
                    </div>
                    ${getSpecialRemark(card)}
                </div>
            </div>
        </div>
        ${tutorialOverlay}
    `;
}