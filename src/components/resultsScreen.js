// resultsScreen.js - Results screen component
import Chart from 'chart.js/auto';

export function createResultsScreen(gameState, onNextCustomer) {
    const container = document.createElement('div');
    container.className = 'results-screen';
    updateResultsScreen(container, gameState, onNextCustomer);
    return container;
}

export function updateResultsScreen(container, gameState, onNextCustomer) {
    const current = gameState.current;
    const targets = gameState.targets;
    const feedback = gameState.evaluateBowl();

    container.innerHTML = `
        <div class="stats">
            <h2>Final Stats</h2>
            <p>Calories: ${Math.round(current.kcal)} / ${targets.target_kcal}</p>
            <p>Carbs: ${Math.round(current.carbs_g)}g / ${Math.round(targets.carbs_g)}g</p>
            <p>Fats: ${Math.round(current.fats_g)}g / ${Math.round(targets.fats_g)}g</p>
            <p>Protein: ${Math.round(current.protein_g)}g / ${Math.round(targets.protein_g)}g</p>
            <p>Water: ${Math.round(current.water_l)}L / ${Math.round(targets.water_budget_l)}L</p>
            <p>Land: ${Math.round(current.land_m2)}m² / ${Math.round(targets.land_budget_m2)}m²</p>
        </div>
        <canvas id="macro-chart" width="200" height="200"></canvas>
        <div class="feedback">${feedback}</div>
        <button id="next-btn">Next Customer</button>
    `;

    // Create pie chart
    const ctx = container.querySelector('#macro-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Carbs', 'Fats', 'Protein'],
            datasets: [{
                data: [current.carbs_g * 4, current.fats_g * 9, current.protein_g * 4], // kcal
                backgroundColor: ['#FFD700', '#FF6347', '#0000FF']
            }]
        }
    });

    container.querySelector('#next-btn').addEventListener('click', onNextCustomer);
}