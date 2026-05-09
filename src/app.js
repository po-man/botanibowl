// app.js - Main application logic
import { loadData } from './data/dataService.js';
import { GameState } from './logic/gameLogic.js';
import { createMainMenu } from './components/mainMenu.js';
import { createHUD, updateHUD } from './components/hud.js';
import { createCardDeck, updateCardDeck } from './components/cardDeck.js';
import { createBowl, updateBowl } from './components/bowl.js';
import { createResultsScreen } from './components/resultsScreen.js';
import { setupCardGestures } from './utils/inputHandler.js';
import { animateCardSwipe, animateNextCardToCenter } from './utils/renderer.js';

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
            const menu = createMainMenu(gameState, () => startGame(), toggleLanguage);
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

function toggleLanguage(lang) {
    gameState.setLanguage(lang);
    showScreen(gameState.currentState); // Re-render the current screen with the new language
}

function startGame() {
    gameState.resetRound();
    showScreen('GAMEPLAY');
}

function setupGameplayScreen() {
    const app = document.getElementById('app');
    const hud = createHUD(gameState, true);
    const cardDeck = createCardDeck(gameState);
    const bowl = createBowl(gameState, () => serveMeal(), handleIngredientRemoval, handleIngredientAddition);

    app.appendChild(hud);
    app.appendChild(cardDeck);
    app.appendChild(bowl);

    attachCardGestures(cardDeck);
    resizeCard();
}

function handleIngredientAddition(ingredient) {
    const added = gameState.addIngredient(ingredient);
    if (!added) {
        return false;
    }

    const hud = document.querySelector('.hud');
    const bowl = document.querySelector('.bowl');
    updateHUD(hud, gameState);
    // Re-render bowl to show the new ingredient
    updateBowl(bowl, gameState, () => serveMeal(), handleIngredientRemoval, handleIngredientAddition);
    return true;
}


function handleIngredientRemoval(index) {
    const removed = gameState.removeIngredient(index);
    if (!removed) {
        return;
    }

    const hud = document.querySelector('.hud');
    const bowl = document.querySelector('.bowl');
    if (hud) {
        updateHUD(hud, gameState);
    }
    if (bowl) {
        updateBowl(bowl, gameState, () => serveMeal(), handleIngredientRemoval, handleIngredientAddition);
    }
}

function attachCardGestures(cardDeck) {
    const card = cardDeck.querySelector('.current-card');
    if (!card) return;
    setupCardGestures(card, swipeLeft, swipeRight, dragPreview);
}

function swipeLeft(startX) {
    if (swipeLocked) return;
    swipeLocked = true;
    if (!gameState.tutorialCompleted) {
        gameState.completeTutorial();
    }

    const cardDeck = document.querySelector('.card-deck');
    const card = cardDeck.querySelector('.current-card');
    animateCardSwipe(card, 'left', () => {
        const nextCard = cardDeck.querySelector('.next-card');
        animateNextCardToCenter(nextCard, () => {
            gameState.advanceCard();
            updateCardDeck(cardDeck, gameState); // Re-render with the new state
            resizeCard(); // Re-apply dynamic sizing to the new card-stack element
            attachCardGestures(cardDeck);
            swipeLocked = false;
        });
    }, startX);
}

function swipeRight(startX) {
    if (swipeLocked) return;
    swipeLocked = true;
    if (!gameState.tutorialCompleted) {
        gameState.completeTutorial();
    }

    const added = gameState.addIngredient(gameState.currentCard);
    if (!added) {
        swipeLocked = false;
        return;
    }

    updateHUD(document.querySelector('.hud'), gameState);
    updateBowl(document.querySelector('.bowl'), gameState, () => serveMeal(), handleIngredientRemoval, handleIngredientAddition);

    const cardDeck = document.querySelector('.card-deck');
    const card = cardDeck.querySelector('.current-card');
    animateCardSwipe(card, 'right', () => {
        const nextCard = cardDeck.querySelector('.next-card');
        animateNextCardToCenter(nextCard, () => {
            gameState.advanceCard();
            updateCardDeck(cardDeck, gameState); // Re-render with the new state
            resizeCard(); // Re-apply dynamic sizing to the new card-stack element
            attachCardGestures(cardDeck);
            swipeLocked = false;
        });
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

function resizeCard() {
    const hud = document.querySelector('.hud');
    const bowl = document.querySelector('.bowl');
    const cardStack = document.querySelector('.card-stack');

    if (!hud || !bowl || !cardStack) return;

    const hudHeight = hud.offsetHeight;
    const bowlHeight = bowl.offsetHeight;
    const availableHeight = window.innerHeight - hudHeight - bowlHeight;

    const cardHeight = availableHeight * 0.9;
    const cardAspectRatio = 300 / 400; // From original CSS width/height
    const cardWidth = cardHeight * cardAspectRatio;

    cardStack.style.height = `${cardHeight}px`;
    cardStack.style.width = `${Math.min(cardWidth, window.innerWidth * 0.8)}px`;

    // Set a scalable base font size for the card's content.
    // 40 is a "magic number" derived from the original fixed height (400px) and a base font size of 10px.
    cardStack.style.fontSize = `${cardHeight / 40}px`;
}

function serveMeal() {
    showScreen('RESULTS');
}

function nextCustomer() {
    startGame();
}