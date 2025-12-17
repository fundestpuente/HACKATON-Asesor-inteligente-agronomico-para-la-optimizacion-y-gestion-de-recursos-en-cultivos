// ==================== USER & AUTH ====================

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ==================== CROPS ====================

export type CropStatus = 'active' | 'harvested' | 'inactive';
export type CropType = 'hydroponic' | 'greenhouse' | 'field' | 'tomate' | 'lechuga' | 'papa' | 'maiz' | 'trigo' | 'cebada' | 'zanahoria' | 'cebolla' | 'ajo' | 'pimiento';

export interface Crop {
  id: number;
  name: string;
  crop_type: string;
  location_lat?: number;
  location_long?: number;
  area?: number;
  status: CropStatus;
  planting_date?: string;
  harvest_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface CreateCropRequest {
  name: string;
  crop_type: string;
  location_lat?: number;
  location_long?: number;
  area?: number;
  planting_date?: string;
  harvest_date?: string;
  notes?: string;
}

export interface UpdateCropRequest extends Partial<CreateCropRequest> {}

export interface CropListResponse {
  items: Crop[];
  total: number;
  skip: number;
  limit: number;
}

// ==================== PREDICTIONS ====================

export interface ClimateData {
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface Nutrients {
  N: number;
  P: number;
  K: number;
}

export interface Prediction {
  id: number;
  crop_id: number;
  ph: number;
  nutrientes_requeridos: Nutrients;
  datos_clima: ClimateData;
  recomendacion: string;
  created_at: string;
}

export interface PredictRequest {
  ph: number;
  latitude?: number;
  longitude?: number;
}

export interface PredictResponse {
  success: boolean;
  nutrientes_requeridos: Nutrients;
  datos_clima: ClimateData;
  recomendacion: string;
  prediction_id: number;
  saved: boolean;
}

// ==================== HYDRO RECIPES ====================

export interface RecipeComponents {
  N: number;
  P: number;
  K: number;
  Ca: number;
  Mg: number;
  S: number;
}

export interface HydroRecipe {
  id: number;
  crop_id: number;
  week: number;
  tank_liters: number;
  ph_water: number;
  components: RecipeComponents;
  climate_data: ClimateData;
  created_at: string;
}

export interface GenerateRecipeRequest {
  week: number;
  tank_liters: number;
  ph_water: number;
  latitude?: number;
  longitude?: number;
}

export interface GenerateRecipeResponse {
  success: boolean;
  cultivo: string;
  semana: number;
  tanque_litros: number;
  ph_agua: number;
  clima: ClimateData;
  receta_optimizada: RecipeComponents;
  recipe_id: number;
  saved: boolean;
}

// ==================== IMAGE PREDICTIONS ====================

export interface ImagePredictionResult {
  class: string;
  confidence: string;
  message: string;
}

export interface ImagePrediction {
  id: number;
  crop_id?: number;
  image_path: string;
  diagnosis: string;
  confidence: string;
  description: string;
  created_at: string;
}

export interface PredictImageResponse {
  success: boolean;
  data: ImagePredictionResult;
  prediction_id: number;
  saved: boolean;
}

// ==================== STATS ====================

export interface CropStats {
  total_predictions: number;
  total_recipes: number;
  total_detections: number;
  average_nutrients: Nutrients;
  recent_diseases: string[];
}

// ==================== API ERRORS ====================

export interface ApiErrorResponse {
  detail?: string | { [key: string]: string[] };
  message?: string;
  error?: string;
}

// ==================== PAGINATION ====================

export interface PaginationParams {
  skip?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
