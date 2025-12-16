// src/tools/calculations.ts
export function calculateSolutionVolume(tankLiters, targetEC, calculationType) {
    // Implementación razonable y robusta sin dependencia externa.
    // Como entrada tenemos: volumen del tanque y EC objetivo (opcional).
    // Esta función devuelve sugerencias y fórmulas para el usuario.
    if (!tankLiters || tankLiters <= 0) {
        return 'Por favor provee un volumen de tanque (tank_liters) mayor que 0.';
    }
    const type = (calculationType || 'summary').toLowerCase();
    if (type === 'nutrient_amount') {
        if (typeof targetEC !== 'number') {
            return 'Para calcular cantidades de nutrientes, proporciona `target_ec` (mS/cm).';
        }
        // Regla heurística: sugerir gramos de fertilizante por 100 L según intensidad
        let gramsPer100L = 10; // valor por defecto
        let intensity = 'moderada';
        if (targetEC < 1.2) {
            gramsPer100L = 5;
            intensity = 'ligera';
        }
        else if (targetEC >= 1.2 && targetEC < 2.0) {
            gramsPer100L = 10;
            intensity = 'moderada';
        }
        else {
            gramsPer100L = 20;
            intensity = 'alta';
        }
        const grams = (gramsPer100L * tankLiters) / 100;
        return `Cálculo de nutrientes (estimado):\n• EC objetivo: ${targetEC} mS/cm\n• Intensidad: ${intensity}\n• Estimación: ${grams.toFixed(1)} g de fertilizante (equivalente a ${gramsPer100L} g/100 L) para ${tankLiters} L.\n\nNota: Estos valores son heurísticos. Para dosis exactas usa la ficha técnica del fertilizante y ajusta según PPM/EC reales.`;
    }
    if (type === 'dilution') {
        return ('Dilución para bajar EC — fórmula y ejemplo:\n' +
            'Necesitas conocer el EC actual (current_ec) y el EC objetivo (target_ec).\n' +
            'Fórmula (litros de agua fresca a añadir) si mezclas en el mismo tanque:\n' +
            '  V_add = V_tank * (EC_current - EC_target) / EC_current\n' +
            'Ejemplo: tanque 100 L, EC_current=3.0, EC_target=2.0 -> V_add = 100*(3-2)/3 = 33.3 L de agua fresca (o reemplaza ~33%).\n' +
            'Si realizas cambio parcial (reemplazar y rellenar), otra opción es extraer una fracción y rellenar con agua limpia.');
    }
    if (type === 'water_change') {
        return (`Recomendación de cambios de agua (heurística):\n` +
            `• EC bajo/moderado (<=1.5): cambio parcial 20–30% cada 1–2 semanas.\n` +
            `• EC moderado-alto (1.5–2.5): cambio parcial 30–50% cada 1–2 semanas.\n` +
            `• EC alto (>2.5): considerar cambio del 50–100% y revisar fuente de nutrientes.\n` +
            `Consejo: mide EC antes y después; mantén registros para ajustar frecuencia.`);
    }
    // Resumen si no se indica tipo
    return ('Cálculos disponibles: \n' +
        '- nutrient_amount (necesita target_ec)\n' +
        '- dilution (necesita EC actual y objetivo — muestra fórmula)\n' +
        '- water_change (recomendaciones generales)');
}
export const calculationsTool = {
    name: "calculate_solution_volume",
    description: "Calcula volúmenes y concentraciones para soluciones nutritivas",
    inputSchema: {
        type: "object",
        properties: {
            tank_liters: {
                type: "number",
                description: "Volumen del tanque en litros"
            },
            target_ec: {
                type: "number",
                description: "EC objetivo en mS/cm (opcional)"
            },
            calculation_type: {
                type: "string",
                enum: ["nutrient_amount", "water_change", "dilution"],
                description: "Tipo de cálculo a realizar"
            }
        },
        required: ["tank_liters"]
    }
};
