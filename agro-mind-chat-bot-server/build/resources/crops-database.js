export const CROPS_DATABASE = {
    lechuga: {
        name: "Lechuga",
        scientific_name: "Lactuca sativa",
        ph_range: { min: 5.5, max: 6.5, ideal: 6.0 },
        ec_range: { min: 0.8, max: 1.2, ideal: 1.0 },
        temperature: {
            water: { min: 18, max: 22, ideal: 20 },
            air: { min: 15, max: 24, ideal: 18 }
        },
        light_hours: 12,
        germination_days: 7,
        harvest_days: 45,
        growth_stages: ["Germinación", "Plántula", "Crecimiento vegetativo", "Maduración"],
        common_issues: [
            "Tip burn (puntas quemadas)",
            "Crecimiento lento",
            "Hojas amarillas"
        ],
        tips: [
            "Mantén la temperatura del agua fresca",
            "Evita exceso de nitrógeno en etapa final",
            "Asegura buena circulación de aire"
        ]
    },
    tomate: {
        name: "Tomate",
        scientific_name: "Solanum lycopersicum",
        ph_range: { min: 5.5, max: 6.5, ideal: 6.0 },
        ec_range: { min: 2.0, max: 3.5, ideal: 2.5 },
        temperature: {
            water: { min: 20, max: 24, ideal: 22 },
            air: { min: 20, max: 28, ideal: 24 }
        },
        light_hours: 14,
        germination_days: 10,
        harvest_days: 90,
        growth_stages: ["Germinación", "Plántula", "Vegetativo", "Floración", "Fructificación"],
        common_issues: [
            "Podredumbre apical",
            "Hojas enrolladas",
            "Caída de flores"
        ],
        tips: [
            "Aumenta EC gradualmente durante fructificación",
            "Requiere polinización manual o vibración",
            "Poda chupones regularmente"
        ]
    },
    // TODO: Agregar más cultivos (albahaca, fresa, espinaca, cilantro, pimiento, pepino, rúcula, col rizada)
};
