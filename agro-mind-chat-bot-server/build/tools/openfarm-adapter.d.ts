type OpenFarmCrop = any;
export declare function fetchFromOpenFarm(name: string): Promise<OpenFarmCrop | null>;
export declare function getOrFetchCrop(name: string): Promise<Record<string, any> | null>;
export {};
