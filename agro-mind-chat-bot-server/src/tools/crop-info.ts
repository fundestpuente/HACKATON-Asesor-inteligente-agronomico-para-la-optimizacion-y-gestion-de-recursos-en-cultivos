// src/tools/crop-info.ts
import { CROPS_DATABASE } from '../resources/crops-database.js';
import { getOrFetchCrop } from './openfarm-adapter.js';

/**
 * Herramienta:  Obtener información de cultivos
 */
export async function getCropInformation(cropName: string): Promise<string> {
  const normalizedName = cropName.toLowerCase().trim();

  // Buscar en la base de datos local primero
  const crop = (CROPS_DATABASE as any)[normalizedName];
  if (crop) {
    return formatCrop(crop);
  }

  // Intentar adapter externo (OpenFarm)
  try {
    const external = await getOrFetchCrop(cropName);
    if (external) {
      const note = '(datos obtenidos desde OpenFarm — campos hidroponía pueden faltar)';
      return formatCrop(external, note);
    }
  } catch (err) {
    // ignorar y devolver mensaje de no encontrado abajo
  }

  const available = Object.keys(CROPS_DATABASE).join(', ');
  return `❌ Cultivo "${cropName}" no encontrado.\n\nCultivos disponibles: ${available}`;
}

function formatCrop(crop: any, note?: string) {
  const name = crop.name || crop._raw?.name || 'Desconocido';
  const scientific = crop.scientific_name || crop._raw?.binomial_name || 'N/A';

  const phIdeal = crop.ph_range?.ideal ?? 'N/A';
  const phMin = crop.ph_range?.min ?? 'N/A';
  const phMax = crop.ph_range?.max ?? 'N/A';

  const ecIdeal = crop.ec_range?.ideal ?? 'N/A';
  const ecMin = crop.ec_range?.min ?? 'N/A';
  const ecMax = crop.ec_range?.max ?? 'N/A';

  const waterIdeal = crop.temperature?.water?.ideal ?? 'N/A';
  const waterMin = crop.temperature?.water?.min ?? 'N/A';
  const waterMax = crop.temperature?.water?.max ?? 'N/A';

  const airIdeal = crop.temperature?.air?.ideal ?? 'N/A';
  const airMin = crop.temperature?.air?.min ?? 'N/A';
  const airMax = crop.temperature?.air?.max ?? 'N/A';

  const growth = Array.isArray(crop.growth_stages) ? crop.growth_stages : [];
  const issues = Array.isArray(crop.common_issues) ? crop.common_issues : [];
  const tips = Array.isArray(crop.tips) ? crop.tips : (crop._raw?.description ? [crop._raw.description] : []);

  return `\n🌱 **${name}** (${scientific})\n\n📊 **PARÁMETROS IDEALES:**\n• pH: ${phIdeal} (rango: ${phMin}-${phMax})\n• EC: ${ecIdeal} mS/cm (rango: ${ecMin}-${ecMax})\n• Temp.  agua: ${waterIdeal}°C (${waterMin}-${waterMax}°C)\n• Temp. aire: ${airIdeal}°C (${airMin}-${airMax}°C)\n• Horas de luz: ${crop.light_hours ?? 'N/A'}h/día\n\n⏱️ **TIEMPOS:**\n• Germinación: ${crop.germination_days ?? 'N/A'} días\n• Cosecha: ${crop.harvest_days ?? 'N/A'} días desde siembra\n\n📈 **ETAPAS DE CRECIMIENTO:**\n${growth.map((stage: string, i: number) => `${i + 1}. ${stage}`).join('\n')}\n\n⚠️ **PROBLEMAS COMUNES:**\n${issues.map((issue: string) => `• ${issue}`).join('\n')}\n\n💡 **CONSEJOS:**\n${tips.map((tip: string) => `• ${tip}`).join('\n')}\n${note ? `\n_Nota_: ${note}` : ''}`.trim();
}

// Definición de la herramienta para MCP
export const cropInfoTool = {
  name: "get_crop_information",
  description: "Obtiene información detallada sobre cultivos hidropónicos específicos",
  inputSchema: {
    type: "object",
    properties: {
      crop_name: {
        type: "string",
        description: "Nombre del cultivo (ej: lechuga, tomate, fresa)"
      }
    },
    required: ["crop_name"]
  }
};