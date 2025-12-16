// src/tools/ml-integration. ts

/**
 * NOTA:  Estas son funciones MOCK (simuladas)
 * Tu equipo las reemplazará con llamadas reales a sus APIs de ML
 */

export function getAINutrientRecommendation(params: {
  crop_type: string;
  growth_stage: string;
  current_ec?:  number;
  water_temperature?:  number;
  ambient_conditions?: any;
}): string {
  // TODO PARA TU EQUIPO: Reemplazar con llamada a API real
  // Ejemplo: const response = await fetch('https://tu-api. com/nutrients', {... })
  
  return `
🤖 **RECOMENDACIÓN DE NUTRIENTES (Simulada)**

⚠️ NOTA: Esta es una respuesta simulada. Conecta tu modelo ML aquí. 

Cultivo: ${params.crop_type}
Etapa:  ${params.growth_stage}

Recomendación simulada: 
• NPK: 15-5-20
• Calcio: 150 ppm
• Magnesio:  50 ppm
• EC objetivo: 2.0 mS/cm

---
🔧 Para tu equipo: Edita src/tools/ml-integration.ts y conecta tu API. 
  `.trim();
}

export function analyzePlantHealth(params: {
  image_base64?:  string;
  image_url?: string;
  crop_type?: string;
}): string {
  // TODO PARA TU EQUIPO:  Reemplazar con llamada a API de visión
  
  return `
📸 **ANÁLISIS DE SALUD DE PLANTA (Simulado)**

⚠️ NOTA: Esta es una respuesta simulada. Conecta tu modelo de visión aquí.

Estado general:  Saludable (simulado)
Problemas detectados:  Ninguno
Confianza: 95%

---
🔧 Para tu equipo: Edita src/tools/ml-integration.ts y conecta tu API de visión.
  `.trim();
}

// Definiciones de herramientas
export const aiNutrientTool = {
  name: "get_ai_nutrient_recommendation",
  description: "Obtiene recomendación de nutrientes usando IA",
  inputSchema: {
    type: "object",
    properties: {
      crop_type: { type: "string" },
      growth_stage: {
        type: "string",
        enum: ["seedling", "vegetative", "flowering", "fruiting"]
      },
      current_ec: { type: "number" },
      water_temperature: { type: "number" },
      ambient_conditions: { type: "object" }
    },
    required: ["crop_type", "growth_stage"]
  }
};

export const plantHealthTool = {
  name: "analyze_plant_health",
  description: "Analiza imagen de planta para detectar problemas",
  inputSchema: {
    type: "object",
    properties:  {
      image_base64: { type: "string" },
      image_url: { type: "string" },
      crop_type: { type: "string" }
    }
  }
};