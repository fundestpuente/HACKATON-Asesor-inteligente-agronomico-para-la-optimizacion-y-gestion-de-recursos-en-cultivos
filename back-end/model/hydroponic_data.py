import pandas as pd
import numpy as np
import random
import os

# --- 1. BASE DE DATOS EXTENDIDA DE CULTIVOS (15 VARIEDADES) ---
# Definimos curvas de nutrientes (N-P-K) por semanas.

cultivos_db = {
    # === GRUPO A: HOJAS Y HIERBAS (Ciclos cortos, N alto) ===
    'lettuce': { 'ciclo': 7, 'curva': [ # Lechuga
        {'sem': [1, 2], 'N': 90, 'P': 30, 'K': 100}, {'sem': [3, 7], 'N': 160, 'P': 50, 'K': 200}]},
    
    'spinach': { 'ciclo': 6, 'curva': [ # Espinaca
        {'sem': [1, 2], 'N': 100, 'P': 30, 'K': 120}, {'sem': [3, 6], 'N': 180, 'P': 60, 'K': 250}]},
    
    'arugula': { 'ciclo': 5, 'curva': [ # Rúcula (Ciclo muy rápido)
        {'sem': [1, 2], 'N': 100, 'P': 30, 'K': 120}, {'sem': [3, 5], 'N': 160, 'P': 40, 'K': 200}]},
    
    'basil':   { 'ciclo': 8, 'curva': [ # Albahaca
        {'sem': [1, 2], 'N': 100, 'P': 30, 'K': 100}, {'sem': [3, 8], 'N': 150, 'P': 40, 'K': 180}]},
    
    'cilantro':{ 'ciclo': 6, 'curva': [ # Cilantro (Sensible a floración)
        {'sem': [1, 2], 'N': 80, 'P': 30, 'K': 100}, {'sem': [3, 6], 'N': 140, 'P': 40, 'K': 180}]},
    
    'mint':    { 'ciclo': 10, 'curva': [ # Menta (Muy resistente, traga mucho N)
        {'sem': [1, 2], 'N': 100, 'P': 30, 'K': 100}, {'sem': [3, 10], 'N': 190, 'P': 50, 'K': 220}]},
    
    'pak_choi':{ 'ciclo': 6, 'curva': [ # Col Asiática
        {'sem': [1, 2], 'N': 100, 'P': 40, 'K': 120}, {'sem': [3, 6], 'N': 170, 'P': 60, 'K': 250}]},

    # === GRUPO B: FRUTOS (Ciclos largos, demandan K y P) ===
    'tomato':  { 'ciclo': 16, 'curva': [
        {'sem': [1, 3], 'N': 120, 'P': 50, 'K': 150}, {'sem': [4, 7], 'N': 200, 'P': 60, 'K': 280},
        {'sem': [8, 16], 'N': 170, 'P': 80, 'K': 380}]}, # Mucho Potasio al final
    
    'pepper':  { 'ciclo': 14, 'curva': [ # Pimiento
        {'sem': [1, 3], 'N': 120, 'P': 40, 'K': 140}, {'sem': [4, 6], 'N': 180, 'P': 50, 'K': 240},
        {'sem': [7, 14], 'N': 160, 'P': 60, 'K': 320}]},
    
    'cucumber':{ 'ciclo': 12, 'curva': [ # Pepino
        {'sem': [1, 2], 'N': 120, 'P': 40, 'K': 150}, {'sem': [3, 12], 'N': 200, 'P': 70, 'K': 350}]},
    
    'zucchini':{ 'ciclo': 10, 'curva': [ # Calabacín
        {'sem': [1, 2], 'N': 130, 'P': 50, 'K': 160}, {'sem': [3, 10], 'N': 180, 'P': 60, 'K': 300}]},
    
    'eggplant':{ 'ciclo': 16, 'curva': [ # Berenjena
        {'sem': [1, 4], 'N': 120, 'P': 50, 'K': 150}, {'sem': [5, 16], 'N': 170, 'P': 70, 'K': 350}]},

    'strawberry':{'ciclo': 20, 'curva': [ # Fresa (EC Baja siempre)
        {'sem': [1, 4], 'N': 90, 'P': 40, 'K': 120}, {'sem': [5, 20], 'N': 110, 'P': 50, 'K': 210}]},

    'melon':   { 'ciclo': 12, 'curva': [ # Melón (Necesita K para dulzor)
        {'sem': [1, 3], 'N': 140, 'P': 50, 'K': 180}, {'sem': [4, 12], 'N': 160, 'P': 70, 'K': 380}]},
    
    'bean':    { 'ciclo': 9, 'curva': [ # Vainita / Judía verde
        {'sem': [1, 2], 'N': 120, 'P': 40, 'K': 120}, {'sem': [3, 9], 'N': 140, 'P': 50, 'K': 200}]}
}

# --- 2. GENERADOR DE DATOS REALISTAS ---

data = []
num_muestras = 15000 # Más cultivos = necesitamos más datos

print(f"Generando {num_muestras} muestras para 15 tipos de cultivos...")

for _ in range(num_muestras):
    
    # -- Selección --
    cultivo_nombre = random.choice(list(cultivos_db.keys()))
    info = cultivos_db[cultivo_nombre]
    semana = random.randint(1, info['ciclo'])
    
    # -- Base NPK --
    base_n, base_p, base_k = 0, 0, 0
    for etapa in info['curva']:
        if etapa['sem'][0] <= semana <= etapa['sem'][1]:
            base_n, base_p, base_k = etapa['N'], etapa['P'], etapa['K']
            break
            
    # -- Inputs Ambientales (Simulación de Sensores) --
    # Temperatura: Rango 5°C a 40°C
    temp = np.random.normal(24, 6)
    temp = round(max(5.0, min(40.0, temp)), 2)
    
    # Humedad: Rango 10% a 100%
    humedad = np.random.normal(60, 15)
    humedad = round(max(10.0, min(100.0, humedad)), 2)
    
    # pH: AQUI ESTA TU CAMBIO. Rango amplio 3.5 a 9.0
    # Usamos una distribución normal centrada en 6.0 pero con "colas" largas
    # para simular usuarios con agua muy mala.
    ph = np.random.normal(6.2, 0.8) 
    ph = round(max(3.5, min(9.0, ph)), 2)

    # -- Lógica Agronómica (Ajustes) --
    factor = 1.0
    
    # Calor: Diluir nutrientes
    if temp > 28.0: factor -= (temp - 28.0) * 0.03
    # Frío: Concentrar ligeramente
    elif temp < 15.0: factor += 0.05
    
    # Humedad Baja: Diluir para evitar quemadura por transpiración
    if humedad < 40.0: factor -= 0.10
    
    # pH Extremo (NUEVO): Si el pH es terrible (>8 o <4.5), la absorción cae.
    # La IA debería recomendar MENOS fertilizante porque la planta no puede comer bien,
    # y así evitamos acumulación de sales (bloqueo de nutrientes).
    if ph > 7.5 or ph < 5.0:
        factor -= 0.15 # Penalización por bloqueo de nutrientes
        
    # Limites del factor
    factor = max(0.4, min(1.3, factor))
    
    # -- Ruido y Cálculo Final --
    ruido = np.random.normal(0, 5)
    
    n_final = round(max(0.0, (base_n * factor + ruido)), 2)
    p_final = round(max(0.0, (base_p * factor + (ruido/2))), 2)
    k_final = round(max(0.0, (base_k * factor + ruido)), 2)
    
    # -- EC (Conductividad) --
    # Estimación: (PPMs Totales) / 700. Incluimos Ca+Mg+S estimando x1.35
    ec_target = round(((n_final + p_final + k_final) * 1.35) / 700, 3)
    
    # Lavado de raíces (semana final) -> EC casi cero
    if n_final < 10: ec_target = 0.4

    data.append([cultivo_nombre, semana, temp, humedad, ph, n_final, p_final, k_final, ec_target])

ruta_script = os.path.dirname(os.path.abspath(__file__))
ruta_salida = os.path.join(os.path.dirname(ruta_script), 'data', 'hydro_dataset.csv')

os.makedirs(os.path.dirname(ruta_salida), exist_ok=True)

# --- 3. GUARDAR ---
df = pd.DataFrame(data, columns=['Crop', 'Week', 'Temp_C', 'Humidity_RH', 'pH_Water', 'N_ppm', 'P_ppm', 'K_ppm', 'EC_Target'])
df.to_csv(ruta_salida, index=False)

print("Dataset generado con éxito.")
print(df.sample(5)) # Muestra 5 ejemplos aleatorios