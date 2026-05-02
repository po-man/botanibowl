// mainMenu.js - Main menu component
export function createMainMenu(onStartGame) {
    const container = document.createElement('div');
    container.className = 'main-menu';
    container.innerHTML = `
        <h1>Eco-Bowl</h1>
        <button id="start-btn">Serve a Customer</button>
    `;
    container.querySelector('#start-btn').addEventListener('click', onStartGame);
    return container;
}