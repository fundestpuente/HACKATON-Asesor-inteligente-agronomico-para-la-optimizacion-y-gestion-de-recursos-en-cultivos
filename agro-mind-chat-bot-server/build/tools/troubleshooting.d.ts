export declare function troubleshootIssue(symptoms: string, cropType?: string): string;
export declare const troubleshootTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            symptoms: {
                type: string;
                description: string;
            };
            crop_type: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
