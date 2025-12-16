/**
 * NOTA:  Estas son funciones MOCK (simuladas)
 * Tu equipo las reemplazará con llamadas reales a sus APIs de ML
 */
export declare function getAINutrientRecommendation(params: {
    crop_type: string;
    growth_stage: string;
    current_ec?: number;
    water_temperature?: number;
    ambient_conditions?: any;
}): string;
export declare function analyzePlantHealth(params: {
    image_base64?: string;
    image_url?: string;
    crop_type?: string;
}): string;
export declare const aiNutrientTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            crop_type: {
                type: string;
            };
            growth_stage: {
                type: string;
                enum: string[];
            };
            current_ec: {
                type: string;
            };
            water_temperature: {
                type: string;
            };
            ambient_conditions: {
                type: string;
            };
        };
        required: string[];
    };
};
export declare const plantHealthTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            image_base64: {
                type: string;
            };
            image_url: {
                type: string;
            };
            crop_type: {
                type: string;
            };
        };
    };
};
