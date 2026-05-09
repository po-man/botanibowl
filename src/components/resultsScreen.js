// resultsScreen.js - Results screen component
import { getTranslations } from '../data/dataService.js';

function createPlateSVG(gameState) {
    const size = 200;
    const center = size / 2;
    const strokeWidth = 20;
    const current = gameState.current;
    const t = getTranslations(gameState.language);
    const targets = gameState.targets;

    // Define macro properties for clarity
    // Renamed colors for gradients: lightest, middle, darkest
    const macroConfig = {
        carbs_g:   { radius: 80, name: 'carbs',   lightest: '#FFEC80', middle: '#FFD700', darkest: '#8c7600' },
        protein_g: { radius: 60, name: 'protein', lightest: '#FFB1A3', middle: '#FF6347', darkest: '#803224' },
        fats_g:    { radius: 40, name: 'fats',    lightest: '#8080FF', middle: '#0000FF', darkest: '#000080' },
    };

    let svg = `<svg viewBox="0 0 ${size} ${size}" class="plate-svg">`;

    // Define gradients
    svg += '<defs>';
    for (const macroKey in macroConfig) {
        const config = macroConfig[macroKey];
        // Gradient for the main data circle (lightest to middle)
        svg += `
            <linearGradient id="${config.name}-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${config.lightest}" />
                <stop offset="100%" stop-color="${config.middle}" />
            </linearGradient>
        `;
        // Gradient for the overflow circle (darkest to middle)
        svg += `
            <linearGradient id="${config.name}-overflow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="${config.darkest}" />
                <stop offset="100%" stop-color="${config.middle}" />
            </linearGradient>
        `;
    }
    svg += '</defs>';

    // Generate circles for each macro
    for (const macroKey in macroConfig) {
        const config = macroConfig[macroKey];
        const radius = config.radius;
        const circumference = 2 * Math.PI * radius;
        const overflowCircumference = 2 * Math.PI * (radius + strokeWidth / 4);
        // Background outline circle
        svg += `<circle cx="${center}" cy="${center}" r="${radius+strokeWidth/2}" fill="none" stroke="${config.middle}" stroke-width="1" stroke-opacity="0.3" transform="rotate(-90 ${center} ${center})" />`;
        // Main data circle (starts at 0)
        svg += `<circle class="data-circle data-circle-${config.name}" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="url(#${config.name}-gradient)" stroke-width="${strokeWidth}" stroke-dasharray="0 ${circumference}" transform="rotate(-90 ${center} ${center})" />`;
        // Overflow circle (starts at 0)
        svg += `<circle class="overflow-circle overflow-circle-${config.name}" cx="${center}" cy="${center}" r="${radius+strokeWidth/4}" fill="none" stroke="url(#${config.name}-overflow-gradient)" stroke-width="${strokeWidth / 2}" stroke-dasharray="0 ${overflowCircumference}" transform="rotate(-90 ${center} ${center})" />`;
    }

    // Add text annotations
    const annotationX = center - 4; // Position to the left of the center
    const annotationYOffset = 4; // Vertical spacing between annotations
    svg += `
        <text x="${annotationX}" y="${center - macroConfig.carbs_g.radius + annotationYOffset}" text-anchor="end" font-size="12" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${t.carbs}</text>
        <text x="${annotationX+27}" y="${center - macroConfig.carbs_g.radius + annotationYOffset}" text-anchor="end" font-size="10" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${Math.round(current.carbs_g)}</text>
        <text x="${annotationX+30}" y="${center - macroConfig.carbs_g.radius + annotationYOffset}" text-anchor="start" font-size="10" fill="#666" stroke="white" stroke-width="3" paint-order="stroke">/ ${Math.round(targets.carbs_g)}g</text>

        <text x="${annotationX}" y="${center - macroConfig.fats_g.radius + annotationYOffset}" text-anchor="end" font-size="12" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${t.fats}</text>
        <text x="${annotationX+27}" y="${center - macroConfig.fats_g.radius + annotationYOffset}" text-anchor="end" font-size="10" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${Math.round(current.fats_g)}</text>
        <text x="${annotationX+30}" y="${center - macroConfig.fats_g.radius + annotationYOffset}" text-anchor="start" font-size="10" fill="#666" stroke="white" stroke-width="3" paint-order="stroke">/ ${Math.round(targets.fats_g)}g</text>

        <text x="${annotationX}" y="${center - macroConfig.protein_g.radius + annotationYOffset}" text-anchor="end" font-size="12" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${t.protein}</text>
        <text x="${annotationX+27}" y="${center - macroConfig.protein_g.radius + annotationYOffset}" text-anchor="end" font-size="10" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${Math.round(current.protein_g)}</text>
        <text x="${annotationX+30}" y="${center - macroConfig.protein_g.radius + annotationYOffset}" text-anchor="start" font-size="10" fill="#666" stroke="white" stroke-width="3" paint-order="stroke">/ ${Math.round(targets.protein_g)}g</text>

        <text x="${center}" y="${center - 8}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${Math.round(current.kcal)}</text>
        <text x="${center}" y="${center + 8}" text-anchor="middle" font-size="12" fill="#666" stroke="white" stroke-width="3" paint-order="stroke">/ ${targets.target_kcal} kcal</text>
    `;


    svg += '</svg>';
    return svg;
}

function createEcoScoresSVG(gameState) {
    const width = 100;
    const height = 200;
    const barWidth = 30;
    const barX = {
        water: 15,
        land: 55
    };
    const current = gameState.current;
    const t = getTranslations(gameState.language);


    return `
        <svg viewBox="0 0 ${width} ${height}" class="eco-scores-svg" width="${width}" height="${height}">
            <defs>
                <linearGradient id="water-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00BFFF" />
                    <stop offset="100%" stop-color="#87CEEB" />
                </linearGradient>
                <linearGradient id="land-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#8B4513" />
                    <stop offset="100%" stop-color="#A0522D" />
                </linearGradient>
            </defs>

            <!-- Backgrounds -->
            <rect x="${barX.water}" y="10" width="${barWidth}" height="160" fill="#e0e0e0" rx="5" />
            <rect x="${barX.land}" y="10" width="${barWidth}" height="160" fill="#e0e0e0" rx="5" />

            <!-- Fills (animated) -->
            <rect id="water-fill" x="${barX.water}" y="10" width="${barWidth}" height="160" fill="url(#water-bar-gradient)" rx="5" style="transition: height 0.8s ease-out, y 0.8s ease-out;" />
            <rect id="land-fill" x="${barX.land}" y="10" width="${barWidth}" height="160" fill="url(#land-bar-gradient)" rx="5" style="transition: height 0.8s ease-out, y 0.8s ease-out;" />

            <!-- Stats -->
            <text x="${barX.water + barWidth / 2}" y="25" text-anchor="middle" font-size="10" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">
                <tspan>${Math.round(current.water_l)}L</tspan><tspan x="${barX.water + barWidth / 2}" dy="1.2em">${t.used}</tspan>
            </text>
            <text x="${barX.land + barWidth / 2}" y="25" text-anchor="middle" font-size="10" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">
                <tspan>${Math.round(current.land_m2)}m²</tspan><tspan x="${barX.land + barWidth / 2}" dy="1.2em">${t.used}</tspan>
            </text>

            <!-- Labels -->
            <text x="${barX.water + barWidth / 2}" y="185" text-anchor="middle" font-size="12" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${t.water}</text>
            <text x="${barX.land + barWidth / 2}" y="185" text-anchor="middle" font-size="12" fill="#333" stroke="white" stroke-width="3" paint-order="stroke">${t.land}</text>
        </svg>
    `;
}

function animatePlateSVG(gameState) {
    const strokeWidth = 20;
    const macroConfig = {
        carbs_g:   { radius: 80, name: 'carbs' },
        protein_g: { radius: 60, name: 'protein' },
        fats_g:    { radius: 40, name: 'fats' },
    };

    for (const macroKey in macroConfig) {
        const config = macroConfig[macroKey];
        const current = gameState.current[macroKey];
        const target = gameState.targets[macroKey];
        const radius = config.radius;

        const dataCircle = document.querySelector(`.data-circle-${config.name}`);
        const overflowCircle = document.querySelector(`.overflow-circle-${config.name}`);

        if (!dataCircle || !overflowCircle) continue;

        // Animate main circle
        const circumference = 2 * Math.PI * radius;
        const percentage = target > 0 ? Math.min(current / target, 1) : 0;
        const dashArray = percentage * circumference;
        dataCircle.style.strokeDasharray = `${dashArray} ${circumference}`;

        // Animate overflow circle (with a delay)
        const overflow = Math.max(current - target, 0);
        const overflowRatio = target > 0 ? Math.min(overflow / target, 1) : 0;
        const overflowCircumference = 2 * Math.PI * (radius + strokeWidth / 4);
        const overflowDash = overflowRatio * overflowCircumference;

        setTimeout(() => {
            overflowCircle.style.strokeDasharray = `${overflowDash} ${overflowCircumference}`;
        }, 800); // Delay overflow animation until after main one likely finishes
    }
}

function animateEcoScoresSVG(gameState) {
    const waterFill = document.getElementById('water-fill');
    const landFill = document.getElementById('land-fill');

    if (!waterFill || !landFill) return;

    const barTotalHeight = 160;
    const barYOffset = 10;

    // Water
    const waterRemainingRatio = Math.max(0, 1 - (gameState.current.water_l / gameState.targets.water_budget_l));
    const waterFillHeight = barTotalHeight * waterRemainingRatio;
    const waterY = barYOffset + (barTotalHeight - waterFillHeight);
    waterFill.style.height = `${waterFillHeight}px`;
    waterFill.style.y = `${waterY}px`;

    // Land
    const landRemainingRatio = Math.max(0, 1 - (gameState.current.land_m2 / gameState.targets.land_budget_m2));
    const landFillHeight = barTotalHeight * landRemainingRatio;
    const landY = barYOffset + (barTotalHeight - landFillHeight);
    landFill.style.height = `${landFillHeight}px`;
    landFill.style.y = `${landY}px`;
}

function animateStars(starMetrics) {
    const starFills = document.querySelectorAll('.star-fill');
    let delay = 250; // Initial delay
    const delayIncrement = 150; // Delay between each star animation

    starFills.forEach(star => {
        if (star.dataset.met === 'true') {
            setTimeout(() => {
                star.classList.add('met');
            }, delay);
            delay += delayIncrement;
        }
    });
}


export function createResultsScreen(gameState, onNextCustomer) {
    const container = document.createElement('div');
    container.className = 'results-screen';
    updateResultsScreen(container, gameState, onNextCustomer);
    return container;
}

export function updateResultsScreen(container, gameState, onNextCustomer) {
    const current = gameState.current;
    const targets = gameState.targets;
    const t = getTranslations(gameState.language);
    const feedback = gameState.evaluateBowl();
    const recommendedDoc = gameState.getRecommendedDoc();
    const starMetrics = gameState.getStarMetrics();

    const starsHTML = Object.keys(starMetrics).map(key => {
        const metric = starMetrics[key];
        return `
            <div class="star-outline">
                ★
                <div class="star-fill" data-met="${metric.met}" style="color: ${metric.color};">★</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="results-card">
            <div class="reviewer-block">
                <div class="reviewer-avatar">${gameState.currentProfile.emoji}</div>
                <div class="reviewer-name">${gameState.currentProfile[`name_${gameState.language}`]}</div>
                <div class="reviewer-bio">${gameState.currentProfile[`description_${gameState.language}`]}</div>
            </div>
            <div class="stars-container">${starsHTML}</div>
            <div class="speech-bubble">
                ${feedback}
            </div>
            <div class="visuals-container" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                <div class="visual-plate-container">${createPlateSVG(gameState)}</div>
                <div class="visual-eco-container">${createEcoScoresSVG(gameState)}</div>
            </div>
            ${recommendedDoc ? `
            <div class="documentary-recommendation">
                <a href="${recommendedDoc.trailer_url}" target="_blank">
                    <h3>${t.learn_more}</h3>
                    <img src="${recommendedDoc.image_url}" alt="${recommendedDoc[`title_${gameState.language}`]}">
                    <p><strong>${recommendedDoc[`title_${gameState.language}`]}</strong></p>
                    <p>${recommendedDoc[`hook_${gameState.language}`]}</p>
                </a>
            </div>
            ` : ''}
            <button id="next-btn">${t.next_customer}</button>
        </div>
    `;

    container.querySelector('#next-btn').addEventListener('click', onNextCustomer);

    // Trigger the animation after the SVG is in the DOM
    setTimeout(() => {
        animatePlateSVG(gameState);
        animateEcoScoresSVG(gameState);
        animateStars(starMetrics);
    }, 100); // A small delay ensures the transition is applied correctly
}