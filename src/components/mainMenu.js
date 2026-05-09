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