export declare function calculateSolutionVolume(tankLiters: number, targetEC?: number, calculationType?: string): string;
export declare const calculationsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            tank_liters: {
                type: string;
                description: string;
            };
            target_ec: {
                type: string;
                description: string;
            };
            calculation_type: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
};
