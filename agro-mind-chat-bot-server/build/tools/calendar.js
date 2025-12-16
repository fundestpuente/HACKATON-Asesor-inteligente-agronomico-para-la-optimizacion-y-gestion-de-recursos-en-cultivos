// src/tools/calendar.ts
import { CROPS_DATABASE } from '../resources/crops-database.js';
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
export function getGrowingCalendar(cropName, startDate, quantity) {
    const normalized = cropName.toLowerCase().trim();
    const crop = CROPS_DATABASE[normalized];
    if (!crop) {
        const available = Object.keys(CROPS_DATABASE).join(', ');
        return `❌ Cultivo "${cropName}" no encontrado. Cultivos disponibles: ${available}`;
    }
    const start = startDate ? new Date(startDate) : new Date();
    if (isNaN(start.getTime())) {
        return 'Fecha de inicio inválida. Usa formato ISO (YYYY-MM-DD) o deja vacía para usar hoy.';
    }
    const sowing = start;
    const germination = addDays(sowing, crop.germination_days);
    const transplant = addDays(sowing, Math.min(14, Math.floor(crop.germination_days + 7)));
    const harvest = addDays(sowing, crop.harvest_days);
    return [`Calendario para ${crop.name}`,
        `• Siembra: ${sowing.toISOString().slice(0, 10)}`,
        `• Germinación estimada: ${germination.toISOString().slice(0, 10)} (~${crop.germination_days} días)`,
        `• Trasplante estimado: ${transplant.toISOString().slice(0, 10)}`,
        `• Cosecha estimada: ${harvest.toISOString().slice(0, 10)} (~${crop.harvest_days} días)`,
        quantity ? `• Cantidad: ${quantity} plantas` : ''
    ].filter(Boolean).join('\n');
}
export const calendarTool = {
    name: "get_growing_calendar",
    description: "Genera calendario de siembra y cosecha",
    inputSchema: {
        type: "object",
        properties: {
            crop_name: {
                type: "string",
                description: "Nombre del cultivo"
            },
            start_date: {
                type: "string",
                description: "Fecha de inicio (formato ISO 8601, opcional)"
            },
            quantity: {
                type: "number",
                description: "Cantidad de plantas (opcional)"
            }
        },
        required: ["crop_name"]
    }
};
