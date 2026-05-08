// renderer.js - Rendering and animation utilities

// Easing function for a smooth, elastic bounce effect
/**
 * @param {number} x The progress of the animation (0 to 1)
 * @param {number} decay Controls how quickly the bounce effect fades. A higher number means a faster decay.
 * @param {number} frequency Controls the number of bounces. A higher number means more bounces.
 */
function easeOutElastic(x, decay = 10, frequency = 10) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -decay * x) * Math.sin((x * frequency - 0.75) * c4) + 1;
}

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

export function animateNextCardToCenter(nextCardElement, onComplete) {
    const duration = 150; // ms
    const startTime = Date.now();

    // Start state: translateY(12px) scale(0.95) opacity 0.8
    // End state: translateY(0) scale(1) opacity 1
    const startY = 12;
    const startScale = 0.95;
    const startOpacity = 0.8;

    const endY = 0;
    const endScale = 1;
    const endOpacity = 1;

    function animate() {
        const elapsed = Date.now() - startTime;
        const linearProgress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutElastic(linearProgress, 8, 12); // Apply easing

        const currentY = startY + (endY - startY) * easedProgress;
        const currentScale = startScale + (endScale - startScale) * easedProgress;
        const currentOpacity = startOpacity + (endOpacity - startOpacity) * easedProgress;

        nextCardElement.style.transform = `translateY(${currentY}px) scale(${currentScale})`;
        nextCardElement.style.opacity = currentOpacity;

        if (linearProgress < 1) {
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