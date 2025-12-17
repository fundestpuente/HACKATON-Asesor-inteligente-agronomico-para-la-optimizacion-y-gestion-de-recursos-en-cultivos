/**
 * Formateadores para mostrar datos en la UI
 */

import { Nutrients, RecipeComponents, ClimateData } from '../types';

export const formatters = {
  /**
   * Formatea un número a 2 decimales
   */
  toFixed2: (num: number): string => {
    return Number.isNaN(num) ? '0.00' : num.toFixed(2);
  },

  /**
   * Formatea una fecha en formato legible
   */
  formatDate: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('es-ES', options);
    } catch {
      return dateString;
    }
  },

  /**
   * Formatea solo la fecha sin hora
   */
  formatDateOnly: (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return date.toLocaleDateString('es-ES', options);
    } catch {
      return dateString;
    }
  },

  /**
   * Formatea nutrientes para mostrar en tabla
   */
  formatNutrients: (nutrients: Nutrients): { N: string; P: string; K: string } => {
    return {
      N: formatters.toFixed2(nutrients.N),
      P: formatters.toFixed2(nutrients.P),
      K: formatters.toFixed2(nutrients.K),
    };
  },

  /**
   * Formatea componentes de receta para mostrar
   */
  formatRecipeComponents: (components: RecipeComponents) => {
    return {
      N: formatters.toFixed2(components.N),
      P: formatters.toFixed2(components.P),
      K: formatters.toFixed2(components.K),
      Ca: formatters.toFixed2(components.Ca),
      Mg: formatters.toFixed2(components.Mg),
      S: formatters.toFixed2(components.S),
    };
  },

  /**
   * Formatea datos de clima para mostrar
   */
  formatClimate: (climate: ClimateData) => {
    return {
      temperature: `${formatters.toFixed2(climate.temperature)}°C`,
      humidity: `${formatters.toFixed2(climate.humidity)}%`,
      rainfall: `${formatters.toFixed2(climate.rainfall)}mm`,
    };
  },

  /**
   * Formatea área en m²
   */
  formatArea: (area?: number): string => {
    if (!area) return 'N/A';
    return `${formatters.toFixed2(area)} m²`;
  },

  /**
   * Formatea estado del cultivo
   */
  formatCropStatus: (status: string): string => {
    const statusMap: { [key: string]: string } = {
      active: 'Activo',
      harvested: 'Cosechado',
      inactive: 'Inactivo',
    };
    return statusMap[status] || status;
  },

  /**
   * Formatea tipo de cultivo
   */
  formatCropType: (cropType: string): string => {
    const typeMap: { [key: string]: string } = {
      tomate: 'Tomate',
      lechuga: 'Lechuga',
      papa: 'Papa',
      maiz: 'Maíz',
      trigo: 'Trigo',
      cebada: 'Cebada',
      zanahoria: 'Zanahoria',
      cebolla: 'Cebolla',
      ajo: 'Ajo',
      pimiento: 'Pimiento',
    };
    return typeMap[cropType] || cropType;
  },

  /**
   * Formatea pH con símbolo
   */
  formatPH: (ph: number): string => {
    return `pH ${formatters.toFixed2(ph)}`;
  },

  /**
   * Formatea litros
   */
  formatLiters: (liters: number): string => {
    return `${formatters.toFixed2(liters)} L`;
  },

  /**
   * Formatea semana
   */
  formatWeek: (week: number): string => {
    return `Semana ${week}`;
  },

  /**
   * Trunca texto a cierto número de caracteres
   */
  truncate: (text: string, length: number = 50): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },
};
