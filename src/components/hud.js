// hud.js - Heads Up Display component
export function createHUD(gameState) {
    const container = document.createElement('div');
    container.className = 'hud';
    updateHUD(container, gameState);
    return container;
}

export function updateHUD(container, gameState) {
    const profile = gameState.currentProfile;
    const targets = gameState.targets;
    const current = gameState.current;

    container.innerHTML = `
        <div class="diner-tag">Target: ${profile.name} - ${targets.target_kcal} kcal</div>
        <div class="calorie-counter">Current: ${Math.round(current.kcal)} / ${targets.target_kcal} kcal</div>
        <div class="macro-bars">
            <div class="bar carbs">
                <div class="fill" style="width: ${Math.min((current.carbs_g / targets.carbs_g) * 100, 100)}%"></div>
                <div class="sweet-spot" style="left: ${90}%; width: ${20}%"></div>
            </div>
            <div class="bar protein">
                <div class="fill" style="width: ${Math.min((current.protein_g / targets.protein_g) * 100, 100)}%"></div>
                <div class="sweet-spot" style="left: ${90}%; width: ${20}%"></div>
            </div>
            <div class="bar fats">
                <div class="fill" style="width: ${Math.min((current.fats_g / targets.fats_g) * 100, 100)}%"></div>
                <div class="sweet-spot" style="left: ${90}%; width: ${20}%"></div>
            </div>
        </div>
        <div class="eco-bars">
            <div class="bar water ${current.water_l > targets.water_budget_l ? 'over' : ''}">
                <div class="fill" style="width: ${Math.min((current.water_l / targets.water_budget_l) * 100, 100)}%"></div>
            </div>
            <div class="bar land ${current.land_m2 > targets.land_budget_m2 ? 'over' : ''}">
                <div class="fill" style="width: ${Math.min((current.land_m2 / targets.land_budget_m2) * 100, 100)}%"></div>
            </div>
        </div>
    `;
}