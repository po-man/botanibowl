// mainMenu.js - Main menu component
export function createMainMenu(onStartGame) {
    const container = document.createElement('div');
    container.className = 'main-menu';
    container.innerHTML = `
        <div class="title-container">
            <h1>BotaniBowl</h1>
            <h2 class="subtitle">揀飲擇植</h2>
        </div>
        <button id="start-btn">Serve a Customer</button>
    `;
    container.querySelector('#start-btn').addEventListener('click', onStartGame);
    return container;
}