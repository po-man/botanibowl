// bowl.js - Bowl component
export function createBowl(gameState, onServeMeal, onRemoveIngredient) {
    const container = document.createElement('div');
    container.className = 'bowl';
    updateBowl(container, gameState, onServeMeal, onRemoveIngredient);
    return container;
}

export function updateBowl(container, gameState, onServeMeal, onRemoveIngredient) {
    const bowlHTML = gameState.bowl.map((ing, index) => `<span class="ingredient" data-index="${index}">${ing.emoji}</span>`).join('');
    const hasIngredients = gameState.bowl.length > 0;
    const isFull = gameState.isBowlFull();

    const buttonClasses = [isFull ? 'shine' : '', !hasIngredients ? 'disabled' : ''].filter(Boolean).join(' ');

    container.innerHTML = `
        <div class="ingredients">${bowlHTML}</div>
        <button id="serve-btn" class="${buttonClasses}" ${hasIngredients ? '' : 'disabled'}>Serve Meal</button>
    `;
    const serveBtn = container.querySelector('#serve-btn');
    if (serveBtn && hasIngredients) {
        serveBtn.addEventListener('click', onServeMeal);
    }

    if (!onRemoveIngredient) {
        return;
    }

    const ingredientsContainer = container.querySelector('.ingredients');
    let activeIndex = null;
    let draggedElement = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    const originalServeText = serveBtn ? serveBtn.textContent : 'Serve Meal';

    const resetServeButton = () => {
        if (!serveBtn) return;
        serveBtn.classList.remove('trash-mode', 'trash-hover');
        serveBtn.textContent = originalServeText;
    };

    const cleanupDrag = () => {
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
            draggedElement.style.left = '';
            draggedElement.style.top = '';
            draggedElement.style.width = '';
            draggedElement.style.height = '';
            draggedElement.style.transform = '';
            draggedElement = null;
        }
        activeIndex = null;
        resetServeButton();
    };

    const updateHoverState = (touchX, touchY) => {
        if (!serveBtn) return false;
        const elementUnder = document.elementFromPoint(touchX, touchY);
        const isOverServe = elementUnder === serveBtn || serveBtn.contains(elementUnder);
        serveBtn.classList.toggle('trash-hover', isOverServe);
        return isOverServe;
    };

    if (ingredientsContainer) {
        ingredientsContainer.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            if (!touch) return;
            const target = event.target.closest('.ingredient');
            if (!target || !serveBtn) return;

            event.preventDefault();
            activeIndex = Number(target.dataset.index);
            if (Number.isNaN(activeIndex)) {
                activeIndex = null;
                return;
            }

            draggedElement = target;
            const rect = draggedElement.getBoundingClientRect();
            dragOffsetX = touch.clientX - rect.left;
            dragOffsetY = touch.clientY - rect.top;
            draggedElement.classList.add('dragging');
            draggedElement.style.left = `${touch.clientX - dragOffsetX}px`;
            draggedElement.style.top = `${touch.clientY - dragOffsetY}px`;
            draggedElement.style.width = `${rect.width}px`;
            draggedElement.style.height = `${rect.height}px`;
            if (serveBtn) {
                serveBtn.classList.add('trash-mode');
                serveBtn.textContent = 'Drop';
            }
        }, { passive: false });

        ingredientsContainer.addEventListener('touchmove', (event) => {
            if (activeIndex === null || !draggedElement) return;
            const touch = event.touches[0];
            if (!touch) return;
            event.preventDefault();
            draggedElement.style.left = `${touch.clientX - dragOffsetX}px`;
            draggedElement.style.top = `${touch.clientY - dragOffsetY}px`;
            updateHoverState(touch.clientX, touch.clientY);
        }, { passive: false });

        const endDrag = (event) => {
            if (activeIndex === null || !draggedElement) {
                cleanupDrag();
                return;
            }

            const touch = event.changedTouches ? event.changedTouches[0] : null;
            let removed = false;
            if (touch && updateHoverState(touch.clientX, touch.clientY)) {
                removed = onRemoveIngredient(activeIndex);
            }

            cleanupDrag();
            if (removed) {
                return;
            }
        };

        ingredientsContainer.addEventListener('touchend', endDrag);
        ingredientsContainer.addEventListener('touchcancel', endDrag);
    }
}