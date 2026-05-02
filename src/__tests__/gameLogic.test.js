// gameLogic.test.js
import { calculateTargets } from '../logic/gameLogic.js';

test('calculateTargets for adult standard', () => {
    const profile = {
        target_kcal: 1500,
        pct_carbs: 0.5,
        pct_fats: 0.3,
        pct_protein: 0.2
    };
    const targets = calculateTargets(profile);
    expect(targets.carbs_g).toBeCloseTo(187.5);
    expect(targets.fats_g).toBeCloseTo(50);
    expect(targets.protein_g).toBeCloseTo(75);
    expect(targets.water_budget_l).toBe(2250);
    expect(targets.land_budget_m2).toBe(30);
});