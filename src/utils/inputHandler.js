// inputHandler.js - Handles user input and gestures
import Hammer from 'hammerjs';

export function setupCardGestures(cardElement, onSwipeLeft, onSwipeRight, onDrag) {
    const hammer = new Hammer(cardElement);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10 });

    hammer.on('panmove', (ev) => {
        const deltaX = ev.deltaX;
        cardElement.style.transform = `translateX(${deltaX}px)`;
        onDrag(deltaX);
    });

    hammer.on('panend', (ev) => {
        const deltaX = ev.deltaX;
        const deltaY = ev.deltaY;
        cardElement.style.transform = ''; // Reset transform
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
            if (deltaX > 0) {
                onSwipeRight();
            } else {
                onSwipeLeft();
            }
        } else {
            onDrag(0);
        }
    });
}

export function setupButtonHandlers(buttonSelectors, handlers) {
    buttonSelectors.forEach(({ selector, handler }) => {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    });
}