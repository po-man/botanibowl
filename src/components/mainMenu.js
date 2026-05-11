// mainMenu.js - Main menu component
import { getTranslations } from '../data/dataService.js';

export function createMainMenu(gameState, onStartGame, onToggleLanguage) {
    const container = document.createElement('div');
    container.className = 'main-menu';
    const t = getTranslations(gameState.language);

    container.innerHTML = `
        <div class="title-container">
            <h1>BotaniBowl</h1>
            <h2 class="subtitle">揀飲擇植</h2>
        </div>
        <div class="hero-illustration">
            <img src="/graphics/boy.svg" class="hero-boy" alt="Happy Boy">
            <img src="/graphics/carrot.svg" class="hero-veg veg-carrot" alt="Carrot">
            <img src="/graphics/tomato.svg" class="hero-veg veg-tomato" alt="Tomato">
            <img src="/graphics/broccoli.svg" class="hero-veg veg-broccoli" alt="Broccoli">
            <img src="/graphics/eggplant.svg" class="hero-veg veg-eggplant" alt="Eggplant">
            <img src="/graphics/orange.svg" class="hero-veg veg-orange" alt="Orange">
        </div>
        <button id="start-btn">${t.serve_customer}</button>
        <div class="language-switcher">
            <button id="lang-btn" data-lang="en" class="${gameState.language === 'en' ? 'active' : ''}">EN</button>
            <button id="lang-btn" data-lang="zh" class="${gameState.language === 'zh' ? 'active' : ''}">中</button>
        </div>
    `;
    container.querySelector('#start-btn').addEventListener('click', onStartGame);
    container.querySelectorAll('#lang-btn').forEach(btn => btn.addEventListener('click', () => onToggleLanguage(btn.dataset.lang)));
    return container;
}