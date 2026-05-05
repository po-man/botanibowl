// main.js - Entry point for Eco-Bowl game
import { initApp } from './app.js';
import './styles.css';

function setAppHeight() {
    const app = document.getElementById('app');
    if (app) {
        app.style.height = `${window.innerHeight}px`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', setAppHeight);
    setAppHeight(); // Set initial height
    initApp();
});