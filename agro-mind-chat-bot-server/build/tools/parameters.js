// src/tools/parameters.ts
import { PARAMETERS } from '../resources/parameters-reference.js';
export function explainParameter(parameter, context) {
    const key = parameter.trim();
    const param = PARAMETERS[key];
    if (!param) {
        const available = Object.keys(PARAMETERS).join(', ');
        return `❌ Parámetro "${parameter}" no encontrado. Parámetros disponibles: ${available}`;
    }
    let text = `**${param.name}**\n${param.description}\n\nRango ideal: ${param.ideal_range}\n\nCómo medir:\n${param.how_to_measure}\n\nCómo ajustar:\n${param.how_to_adjust}`;
    if (context) {
        text += `\n\nContexto: ${context}`;
    }
    return text;
}
export const parametersTool = {
    name: "explain_parameter",
    description: "Explica parámetros técnicos de hidroponía",
    inputSchema: {
        type: "object",
        properties: {
            parameter: {
                type: "string",
                enum: ["pH", "EC", "PPM", "TDS", "temperature", "humidity", "light", "DO"],
                description: "Parámetro a explicar"
            },
            context: {
                type: "string",
                description: "Contexto específico (opcional)"
            }
        },
        required: ["parameter"]
    }
};
