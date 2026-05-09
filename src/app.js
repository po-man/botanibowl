// app.js - Main application logic
import { loadData, preloadDocumentaryImages } from './data/dataService.js';
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
    preloadDocumentaryImages();
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

    // 1. Set maximum allowed boundaries (increased width slightly to 85% for better mobile fit)
    const maxCardHeight = availableHeight * 0.9;
    const maxCardWidth = window.innerWidth * 0.85;
    const cardAspectRatio = 300 / 400; // Target aspect ratio (width/height = 0.75)

    // 2. Initial calculation based on available vertical space
    let finalHeight = maxCardHeight;
    let finalWidth = finalHeight * cardAspectRatio;

    // 3. Constrain by width IF the calculated width exceeds screen bounds
    // This prevents the card from stretching vertically and inflating the fonts!
    if (finalWidth > maxCardWidth) {
        finalWidth = maxCardWidth;
        finalHeight = finalWidth / cardAspectRatio; // Scale height down proportionately
    }

    cardStack.style.height = `${finalHeight}px`;
    cardStack.style.width = `${finalWidth}px`;

    // 4. Calculate a scalable font size with a readability floor
    // Dividing by 35 gives a slightly more generous baseline than 40.
    // clamp() ensures it never drops below 11px on tiny screens (like SE) or balloons on huge screens.
    const baseFontSize = finalHeight / 35;
    cardStack.style.fontSize = `clamp(11px, ${baseFontSize}px, 18px)`;
}

function serveMeal() {
    showScreen('RESULTS');
}

function nextCustomer() {
    startGame();
}