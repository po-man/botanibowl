// utils/radarChart.js - Generates SVG for a radar chart

export function createRadarChartSVG(ingredient, maxValues) {
    const size = 200; // SVG viewBox size (doubled from 100)
    const center = size / 2;
    const radius = 80; // Radius (doubled from 40)

    // Define the attributes and their corresponding colors and labels
    const attributes = [
        { key: 'protein_g', label: 'PROTEIN', color: '#FF6347' },  // Red
        { key: 'fats_g', label: 'FATS', color: '#0000FF' },      // Blue
        { key: 'land_m2', label: 'LAND USE', color: '#8B4513' },      // Brown
        { key: 'water_l', label: 'WATER USE', color: '#00BFFF' },    // Light Blue
        { key: 'carbs_g', label: 'CARBS', color: '#FFD700' }    // Yellow
    ];
    const numAxes = attributes.length;

    // Calculate polygon points for the ingredient's values
    const points = attributes.map((attr, i) => {
        const value = ingredient[attr.key];
        const maxValue = maxValues[attr.key];
        // Normalize value to a 0-1 scale, then scale by radius
        // Handle maxValue being 0 to prevent division by zero and ensure a point at the center
        const normalizedValue = maxValue > 0 ? (value / maxValue) : 0;
        const pointRadius = normalizedValue * radius;

        // Calculate angle for each axis, starting from the top (-PI/2) and going clockwise
        const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
        const x = center + pointRadius * Math.cos(angle);
        const y = center + pointRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    // Generate grid lines (concentric pentagons)
    const gridLevels = [1.0, 0.8, 0.6, 0.4, 0.2]; // Levels for the grid
    const gridPolygons = gridLevels.map(level => {
        const gridPoints = attributes.map((attr, i) => {
            // Calculate angle for each axis, starting from the top (-PI/2) and going clockwise
            const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
            const currentRadius = radius * level;
            const x = center + currentRadius * Math.cos(angle);
            const y = center + currentRadius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return `<polygon points="${gridPoints}" fill="none" stroke="lightgrey" stroke-width="0.5"/>`;
    }).join('');

    // Generate axis lines
    const axisLines = attributes.map((attr, i) => {
        const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
        // For the axis lines, we want them to extend to the full radius (level 1.0)
        // The grid already draws the outermost pentagon, so the axis lines should connect
        // the center to the vertices of the outermost grid pentagon.
        // This is effectively using the 'radius' variable directly.
        // No change needed here, as 'radius' already represents the max radius.

        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="${attr.color}" stroke-width="0.5"/>`;
    }).join('');

    // Generate labels for each axis
    const labelOffset = 15; // Distance from the end of the axis line to the label
    const axisLabels = attributes.map((attr, i) => {
        const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
        const labelX = center + (radius + labelOffset) * Math.cos(angle);
        const labelY = center + (radius + labelOffset) * Math.sin(angle);

        let textAnchor = 'middle';
        let dx = 0; // Horizontal adjustment

        // Adjust text-anchor and dx based on angle for better positioning
        // The angles for the 5 attributes are approximately:
        // Protein (index 0): -PI/2 (top)
        // Fats (index 1): -0.1PI (top-right)
        // Land Use (index 2): 0.3PI (bottom-right)
        // Water Use (index 3): 0.7PI (bottom-left)
        // Carbs (index 4): 1.1PI (top-left)

        if (i === 0) { // Protein (top)
            // No adjustment needed, already centered
        } else if (i === 1) { // Fats (top-right)
            textAnchor = 'start';
            dx = -10; // Shift left for better spacing
        } else if (i === 2) { // Land Use (bottom-right)
            textAnchor = 'middle';
        } else if (i === 3) { // Water Use (bottom-left)
            textAnchor = 'middle';
        } else if (i === 4) { // Carbs (top-left)
            textAnchor = 'end';
            dx = 10; // Shift right for better spacing
        }

        return `<text x="${labelX+dx}" y="${labelY}" text-anchor="${textAnchor}" dominant-baseline="central" fill="#333" font-size="0.4em">${attr.label}</text>`;
    }).join('');

    return `
        <svg viewBox="0 0 ${size} ${size}" class="radar-chart">
            ${gridPolygons}
            ${axisLines}
            ${axisLabels}
            <polygon points="${points}" fill="rgba(76, 175, 80, 0.5)" stroke="#4CAF50" stroke-width="1"/>
        </svg>
    `;
}