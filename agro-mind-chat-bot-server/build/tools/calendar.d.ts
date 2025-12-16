export declare function getGrowingCalendar(cropName: string, startDate?: string, quantity?: number): string;
export declare const calendarTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            crop_name: {
                type: string;
                description: string;
            };
            start_date: {
                type: string;
                description: string;
            };
            quantity: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
