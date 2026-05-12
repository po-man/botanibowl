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
        <div class="hero-illustration" id="hero-graphic-container"></div>
        <button id="start-btn">${t.serve_customer}</button>
        <div class="language-switcher">
            <button id="lang-btn" data-lang="en" class="${gameState.language === 'en' ? 'active' : ''}">EN</button>
            <button id="lang-btn" data-lang="zh" class="${gameState.language === 'zh' ? 'active' : ''}">中</button>
        </div>
    `;

    const heroContainer = container.querySelector('#hero-graphic-container');
    const graphics = [
        { src: '/graphics/boy.svg', cls: 'hero-boy', alt: 'Happy Boy' },
        { src: '/graphics/carrot.svg', cls: 'hero-veg veg-carrot', alt: 'Carrot' },
        { src: '/graphics/tomato.svg', cls: 'hero-veg veg-tomato', alt: 'Tomato' },
        { src: '/graphics/broccoli.svg', cls: 'hero-veg veg-broccoli', alt: 'Broccoli' },
        { src: '/graphics/eggplant.svg', cls: 'hero-veg veg-eggplant', alt: 'Eggplant' },
        { src: '/graphics/orange.svg', cls: 'hero-veg veg-orange', alt: 'Orange' }
    ];

    setTimeout(() => {
        graphics.forEach(gfx => {
            const img = new Image();
            img.alt = gfx.alt;
            img.className = gfx.cls;
            img.decoding = 'async';

            // Wait for the specific image to finish loading, then trigger the fade-in
            img.onload = () => {
                img.classList.add('loaded');
            };

            img.src = gfx.src;
            heroContainer.appendChild(img);
        });
    }, 0);

    container.querySelector('#start-btn').addEventListener('click', onStartGame);
    container.querySelectorAll('#lang-btn').forEach(btn => btn.addEventListener('click', () => onToggleLanguage(btn.dataset.lang)));
    return container;
}