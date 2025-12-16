/**
 * Representa un cultivo en la base de datos
 */
export interface Crop {
    name: string;
    scientific_name: string;
    ph_range: {
        min: number;
        max: number;
        ideal: number;
    };
    ec_range: {
        min: number;
        max: number;
        ideal: number;
    };
    temperature: {
        water: {
            min: number;
            max: number;
            ideal: number;
        };
        air: {
            min: number;
            max: number;
            ideal: number;
        };
    };
    light_hours: number;
    germination_days: number;
    harvest_days: number;
    growth_stages: string[];
    common_issues: string[];
    tips: string[];
}
/**
 * Problema de troubleshooting
 */
export interface TroubleshootingIssue {
    symptoms: string[];
    possible_causes: string[];
    solutions: string[];
    prevention: string[];
}
/**
 * Parámetro técnico de hidroponía
 */
export interface Parameter {
    name: string;
    description: string;
    ideal_range: string;
    how_to_measure: string;
    how_to_adjust: string;
}
