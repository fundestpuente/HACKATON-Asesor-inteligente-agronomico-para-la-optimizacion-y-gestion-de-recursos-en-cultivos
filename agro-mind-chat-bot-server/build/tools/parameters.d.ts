export declare function explainParameter(parameter: string, context?: string): string;
export declare const parametersTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            parameter: {
                type: string;
                enum: string[];
                description: string;
            };
            context: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
