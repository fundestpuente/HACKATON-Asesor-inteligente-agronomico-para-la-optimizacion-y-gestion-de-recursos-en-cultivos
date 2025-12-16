// src/tools/troubleshooting.ts
import { TROUBLESHOOTING_DATABASE } from '../resources/troubleshooting-guide.js';
export function troubleshootIssue(symptoms, cropType) {
    if (!symptoms || symptoms.trim().length === 0) {
        return 'Por favor describe los síntomas observados para poder diagnosticar.';
    }
    const query = symptoms.toLowerCase();
    const results = [];
    for (const key of Object.keys(TROUBLESHOOTING_DATABASE)) {
        const issue = TROUBLESHOOTING_DATABASE[key];
        let score = 0;
        // Puntuar coincidencias simples entre palabras clave
        for (const s of issue.symptoms) {
            const sLower = s.toLowerCase();
            if (query.includes(sLower) || sLower.includes(query))
                score += 2;
            // palabras individuales
            for (const word of query.split(/\W+/)) {
                if (sLower.includes(word) && word.length > 2)
                    score += 1;
            }
        }
        if (score > 0)
            results.push({ key, issue, score });
    }
    if (results.length === 0) {
        return 'No encontré coincidencias claras en la guía de troubleshooting. Intenta describir síntomas más específicos (ej: "hojas amarillas en la base", "raíces marrones y olor").';
    }
    // Ordenar por mejor puntuación
    results.sort((a, b) => b.score - a.score);
    const top = results[0];
    const issue = top.issue;
    return [`Diagnóstico posible: ${top.key.replace(/_/g, ' ')} (score: ${top.score})`,
        `Síntomas registrados:\n${issue.symptoms.map((s) => `• ${s}`).join('\n')}`,
        `Causas posibles:\n${issue.possible_causes.map((c) => `• ${c}`).join('\n')}`,
        `Soluciones sugeridas:\n${issue.solutions.map((s) => `• ${s}`).join('\n')}`,
        `Prevención:\n${issue.prevention.map((p) => `• ${p}`).join('\n')}`
    ].join('\n\n');
}
export const troubleshootTool = {
    name: "troubleshoot_issue",
    description: "Diagnostica problemas comunes en sistemas hidropónicos",
    inputSchema: {
        type: "object",
        properties: {
            symptoms: {
                type: "string",
                description: "Descripción de los síntomas observados"
            },
            crop_type: {
                type: "string",
                description: "Tipo de cultivo afectado (opcional)"
            }
        },
        required: ["symptoms"]
    }
};
