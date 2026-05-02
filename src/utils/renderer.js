// renderer.js - Rendering and animation utilities
export function animateCardSwipe(cardElement, direction, onComplete, startX = 0) {
    const endX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    const duration = 300; // ms
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentX = startX + (endX - startX) * progress;
        cardElement.style.transform = `translateX(${currentX}px) rotate(${progress * 30 * (direction === 'right' ? 1 : -1)}deg)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            onComplete();
        }
    }
    animate();
}

export function updateProgressBar(barElement, percentage, color) {
    const fill = barElement.querySelector('.fill');
    fill.style.width = `${Math.min(percentage, 100)}%`;
    fill.style.backgroundColor = color;
}