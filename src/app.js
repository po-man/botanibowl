// app.js - Main application logic
import { loadData, getRandomIngredient } from './data/dataService.js';
import { GameState } from './logic/gameLogic.js';
import { createMainMenu } from './components/mainMenu.js';
import { createHUD, updateHUD } from './components/hud.js';
import { createCardDeck, updateCardDeck } from './components/cardDeck.js';
import { createBowl, updateBowl } from './components/bowl.js';
import { createResultsScreen } from './components/resultsScreen.js';
import { setupCardGestures } from './utils/inputHandler.js';
import { animateCardSwipe } from './utils/renderer.js';

let gameState;
let currentScreen;
let swipeLocked = false;

export async function initApp() {
    await loadData();
    gameState = new GameState();
    showScreen('MENU');
}

function showScreen(screen) {
    const app = document.getElementById('app');
    app.innerHTML = '';
    gameState.currentState = screen;

    switch (screen) {
        case 'MENU':
            const menu = createMainMenu(() => startGame());
            app.appendChild(menu);
            break;
        case 'GAMEPLAY':
            setupGameplayScreen();
            break;
        case 'RESULTS':
            const results = createResultsScreen(gameState, () => nextCustomer());
            app.appendChild(results);
            break;
    }
}

function startGame() {
    gameState.resetRound();
    showScreen('GAMEPLAY');
}

function setupGameplayScreen() {
    const app = document.getElementById('app');
    const hud = createHUD(gameState);
    const cardDeck = createCardDeck(gameState);
    const bowl = createBowl(gameState, () => serveMeal());

    app.appendChild(hud);
    app.appendChild(cardDeck);
    app.appendChild(bowl);

    attachCardGestures(cardDeck);
}

function attachCardGestures(cardDeck) {
    const card = cardDeck.querySelector('.card');
    if (!card) return;
    setupCardGestures(card, swipeLeft, swipeRight, dragPreview);
}

function swipeLeft() {
    if (swipeLocked) return;
    swipeLocked = true;

    const cardDeck = document.querySelector('.card-deck');
    const card = cardDeck.querySelector('.card');
    const transform = card.style.transform;
    const match = transform.match(/translateX\(([^)]+)px\)/);
    const startX = match ? parseFloat(match[1]) : 0;
    animateCardSwipe(card, 'left', () => {
        gameState.currentCard = getRandomIngredient();
        updateCardDeck(cardDeck, gameState);
        attachCardGestures(cardDeck);
        swipeLocked = false;
    }, startX);
}

function swipeRight() {
    if (swipeLocked) return;
    swipeLocked = true;

    gameState.addIngredient(gameState.currentCard);
    updateHUD(document.querySelector('.hud'), gameState);
    updateBowl(document.querySelector('.bowl'), gameState, () => serveMeal());

    const cardDeck = document.querySelector('.card-deck');
    const card = cardDeck.querySelector('.card');
    const transform = card.style.transform;
    const match = transform.match(/translateX\(([^)]+)px\)/);
    const startX = match ? parseFloat(match[1]) : 0;
    animateCardSwipe(card, 'right', () => {
        updateCardDeck(cardDeck, gameState);
        attachCardGestures(cardDeck);
        swipeLocked = false;
    }, startX);
}

function dragPreview(deltaX) {
    const hud = document.querySelector('.hud');
    if (deltaX > 50) {
        const card = gameState.currentCard;
        const ghost = {
            carbs_g: card.carbs_g,
            protein_g: card.protein_g,
            fats_g: card.fats_g,
            water_l: card.water_l,
            land_m2: card.land_m2
        };
        updateHUD(hud, gameState, ghost);
    } else {
        updateHUD(hud, gameState);
    }
}
function serveMeal() {
    showScreen('RESULTS');
}

function nextCustomer() {
    startGame();
}