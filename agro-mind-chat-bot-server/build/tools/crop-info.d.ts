/**
 * Herramienta:  Obtener información de cultivos
 */
export declare function getCropInformation(cropName: string): Promise<string>;
export declare const cropInfoTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            crop_name: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
