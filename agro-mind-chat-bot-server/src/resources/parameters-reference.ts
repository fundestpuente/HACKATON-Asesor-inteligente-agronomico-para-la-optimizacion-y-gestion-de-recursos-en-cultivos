// src/resources/parameters-reference.ts
import { Parameter } from '../types/index.js';

export const PARAMETERS:  Record<string, Parameter> = {
  pH: {
    name: "pH (Potencial de Hidrógeno)",
    description: "Mide la acidez o alcalinidad de la solución nutritiva.  Afecta la disponibilidad de nutrientes.",
    ideal_range: "5.5 - 6.5 (mayoría de cultivos)",
    how_to_measure: "Usar medidor de pH digital o tiras reactivas.  Calibrar regularmente.",
    how_to_adjust: "pH alto: agregar ácido fosfórico o pH down.  pH bajo: agregar hidróxido de potasio o pH up.  Ajustar gradualmente."
  },

  EC: {
    name:  "EC (Conductividad Eléctrica)",
    description: "Mide la concentración total de sales disueltas (nutrientes) en el agua. Indica la 'fuerza' de la solución nutritiva.",
    ideal_range: "0.8-1.2 mS/cm (lechugas) hasta 2.0-3.5 mS/cm (tomates)",
    how_to_measure: "Usar medidor de EC digital.  Medir a temperatura constante (20°C ideal).",
    how_to_adjust: "EC bajo: agregar más fertilizante.  EC alto: diluir con agua.  Cambiar solución si muy alta."
  },

  // TODO: Agregar PPM, TDS, temperature, humidity, light, DO (oxígeno disuelto)
};