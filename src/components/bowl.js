// bowl.js - Bowl component
import { getTranslations } from '../data/dataService.js';

export function createBowl(gameState, onServeMeal, onRemoveIngredient, onAddIngredient) {
    const container = document.createElement('div');
    container.className = 'bowl';
    updateBowl(container, gameState, onServeMeal, onRemoveIngredient, onAddIngredient);
    return container;
}

export function updateBowl(container, gameState, onServeMeal, onRemoveIngredient, onAddIngredient) {
    const bowlHTML = gameState.bowl.map((ing, index) => `<span class="ingredient" data-index="${index}">${ing.emoji}</span>`).join('');
    const hasIngredients = gameState.bowl.length > 0;
    const isFull = gameState.isBowlFull();
    const t = getTranslations(gameState.language);

    const buttonClasses = [isFull ? 'shine' : '', !hasIngredients ? 'disabled' : ''].filter(Boolean).join(' ');

    let hintHTML = '';
    if (hasIngredients && !gameState.bowlTutorialCompleted) {
        const hintText = t.bowl_hint;
        if (gameState.bowl.length <= 3) {
            hintHTML = `<div class="bowl-hint">${hintText}</div>`;
        } else if (gameState.bowl.length === 4) {
            hintHTML = `<div class="bowl-hint fade-out">${hintText}</div>`;
            gameState.bowlTutorialCompleted = true;
        }
    }

    container.innerHTML = `
        <div class="ingredients">
            ${bowlHTML}
            ${hintHTML}
        </div>
        <div class="bowl-actions">
            <button id="serve-btn" class="${buttonClasses}" ${hasIngredients ? '' : 'disabled'}>${t.serve_meal}</button>
        </div>
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
    const actionsContainer = container.querySelector('.bowl-actions');
    const originalActionsHTML = actionsContainer.innerHTML;

    const resetActionButtons = () => {
        if (!actionsContainer) return;
        actionsContainer.innerHTML = originalActionsHTML;
        // Re-attach listener for serve button
        const newServeBtn = actionsContainer.querySelector('#serve-btn');
        if (newServeBtn && hasIngredients) {
            newServeBtn.addEventListener('click', onServeMeal);
        }
    };

    const getActionButtons = () => {
        const dropBtn = document.getElementById('drop-btn');
        const doubleBtn = document.getElementById('double-btn');
        return { dropBtn, doubleBtn };
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
        resetActionButtons();
    };

    const updateHoverState = (touchX, touchY) => {
        const { dropBtn, doubleBtn } = getActionButtons();
        if (!dropBtn || !doubleBtn) return { overDrop: false, overDouble: false };

        const elementUnder = document.elementFromPoint(touchX, touchY);
        const isOverDrop = elementUnder === dropBtn || dropBtn.contains(elementUnder);
        const isOverDouble = elementUnder === doubleBtn || doubleBtn.contains(elementUnder);

        dropBtn.classList.toggle('trash-hover', isOverDrop);
        doubleBtn.classList.toggle('trash-hover', isOverDouble);
        return { overDrop: isOverDrop, overDouble: isOverDouble };
    };

    if (ingredientsContainer) {
        ingredientsContainer.addEventListener('touchstart', (event) => {
            if (!gameState.bowlTutorialCompleted) {
                gameState.bowlTutorialCompleted = true;
                const hintEl = container.querySelector('.bowl-hint');
                if (hintEl) hintEl.remove();
            }

            const touch = event.touches[0];
            if (!touch) return;
            const target = event.target.closest('.ingredient');
            if (!target || !actionsContainer) return;

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

            if (actionsContainer) {
                actionsContainer.innerHTML = `
                    <button id="drop-btn" class="bowl-action-btn drop">${t.drop}</button>
                    <button id="double-btn" class="bowl-action-btn double" ${isFull ? 'disabled' : ''}>${t.double}</button>
                `;
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
            let added = false;

            if (touch) {
                const { overDrop, overDouble } = updateHoverState(touch.clientX, touch.clientY);
                if (overDrop) {
                    removed = onRemoveIngredient(activeIndex);
                } else if (overDouble && !isFull && onAddIngredient) {
                    const ingredientToAdd = gameState.bowl[activeIndex];
                    added = onAddIngredient(ingredientToAdd);
                }
            }

            cleanupDrag();
            // Return if an action was taken to prevent other logic from firing
            if (removed || added) {
                return;
            }
        };

        ingredientsContainer.addEventListener('touchend', endDrag);
        ingredientsContainer.addEventListener('touchcancel', endDrag);
    }
}