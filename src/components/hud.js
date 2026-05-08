// hud.js - Heads Up Display component
export function createHUD(gameState) {
    const container = document.createElement('div');
    container.className = 'hud';
    updateHUD(container, gameState);
    return container;
}

function attachHudInteractivity(container) {
    const header = container.querySelector('.hud-header');
    header.addEventListener('click', () => container.querySelector('.tooltip-drawer').classList.toggle('show'));
}

export function updateHUD(container, gameState, ghost = null, initialRender = false) {
    const profile = gameState.currentProfile;
    const targets = gameState.targets;
    const current = gameState.current;

    // Check if the tooltip is currently visible before we re-render the innerHTML.
    const isTooltipVisible = container.querySelector('.tooltip-drawer.show');

    const carbsCurrentWidth = Math.min((current.carbs_g / targets.carbs_g) * 100, 100);
    const proteinCurrentWidth = Math.min((current.protein_g / targets.protein_g) * 100, 100);
    const fatsCurrentWidth = Math.min((current.fats_g / targets.fats_g) * 100, 100);
    const waterCurrentWidth = Math.min((current.water_l / targets.water_budget_l) * 100, 100);
    const landCurrentWidth = Math.min((current.land_m2 / targets.land_budget_m2) * 100, 100);

    let ghostCarbs = '';
    let ghostProtein = '';
    let ghostFats = '';
    let ghostWater = '';
    let ghostLand = '';

    if (ghost) {
        const carbsGhostWidth = Math.min((ghost.carbs_g / targets.carbs_g) * 100, 100 - carbsCurrentWidth);
        const proteinGhostWidth = Math.min((ghost.protein_g / targets.protein_g) * 100, 100 - proteinCurrentWidth);
        const fatsGhostWidth = Math.min((ghost.fats_g / targets.fats_g) * 100, 100 - fatsCurrentWidth);
        const waterGhostWidth = Math.min((ghost.water_l / targets.water_budget_l) * 100, 100 - waterCurrentWidth);
        const landGhostWidth = Math.min((ghost.land_m2 / targets.land_budget_m2) * 100, 100 - landCurrentWidth);

        ghostCarbs = `<div class="ghost-fill" style="left: ${carbsCurrentWidth}%; width: ${carbsGhostWidth}%"></div>`;
        ghostProtein = `<div class="ghost-fill" style="left: ${proteinCurrentWidth}%; width: ${proteinGhostWidth}%"></div>`;
        ghostFats = `<div class="ghost-fill" style="left: ${fatsCurrentWidth}%; width: ${fatsGhostWidth}%"></div>`;
        ghostWater = `<div class="ghost-fill" style="right: ${waterCurrentWidth}%; width: ${waterGhostWidth}%"></div>`;
        ghostLand = `<div class="ghost-fill" style="right: ${landCurrentWidth}%; width: ${landGhostWidth}%"></div>`;
    }

    container.innerHTML = `
        <div class="hud-header">
            <div class="diner-avatar">${profile.emoji}</div>
            <div class="diner-info">
                <div class="diner-name">${profile.name}</div>
                <div class="diner-target">Target: ${targets.target_kcal} kcal</div>
            </div>
            <div class="info-toggle">ℹ️</div>
        </div>
        <div class="tooltip-drawer ${isTooltipVisible ? 'show' : ''}">${profile.description}</div>

        <div class="macro-bars">
            <div class="bar-container" style="flex-grow: ${profile.pct_carbs}">
                <div class="bar carbs ${current.carbs_g > targets.carbs_g ? 'over' : ''}">
                    <div class="fill" style="width: ${carbsCurrentWidth}%"></div>
                    ${ghostCarbs}
                </div>
                <div class="bar-caption">CARBS</div>
            </div>
            <div class="bar-container" style="flex-grow: ${profile.pct_protein}">
                <div class="bar protein ${current.protein_g > targets.protein_g ? 'over' : ''}">
                    <div class="fill" style="width: ${proteinCurrentWidth}%"></div>
                    ${ghostProtein}
                </div>
                <div class="bar-caption">PROTEIN</div>
            </div>
            <div class="bar-container" style="flex-grow: ${profile.pct_fats}">
                <div class="bar fats ${current.fats_g > targets.fats_g ? 'over' : ''}">
                    <div class="fill" style="width: ${fatsCurrentWidth}%"></div>
                    ${ghostFats}
                </div>
                <div class="bar-caption">FATS</div>
            </div>
        </div>
        <div class="eco-bars">
            <div class="bar-container">
                <div class="bar water ${current.water_l > targets.water_budget_l ? 'over' : ''}">
                    <div class="fill" style="width: ${waterCurrentWidth}%; right: 0;"></div>
                    ${ghostWater}
                </div>
                <div class="bar-caption">WATER RESOURCE</div>
            </div>
            <div class="bar-container">
                <div class="bar land ${current.land_m2 > targets.land_budget_m2 ? 'over' : ''}">
                    <div class="fill" style="width: ${landCurrentWidth}%; right: 0;"></div>
                    ${ghostLand}
                </div>
                <div class="bar-caption">LAND RESOURCE</div>
            </div>
        </div>
    `;

    // Always attach interactivity, as innerHTML wipes out previous listeners.
    attachHudInteractivity(container);
}