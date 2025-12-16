def recommend_fertilizer(crop, N_ai, P_ai, K_ai):
    """
    Estrategia de Fertilización Mixta (Versión Texto Plano Profesional).
    Prioriza 15-15-15 y complementa con simples.
    """
    
    rec = []
    # Encabezado técnico
    rec.append(f"CULTIVO: {crop.upper()}")
    rec.append(f"Requerimiento Neto (kg/ha): N={N_ai:.1f}, P={P_ai:.1f}, K={K_ai:.1f}")
    rec.append("") # Espacio en blanco
    rec.append("PLAN DE FERTILIZACION SUGERIDO (Base 15-15-15):")

    # --- PASO 1: Calcular la BASE usando TRIPLE 15 ---
    limitante = min(N_ai, P_ai, K_ai)
    qty_15 = 0
    
    if limitante > 0:
        qty_15 = (limitante / 15) * 100
        rec.append(f"- BASE: Aplicar {qty_15:.2f} kg/ha de Triple 15")
        rec.append(f"  (Cubre {limitante:.1f} kg iniciales de N, P y K)")
    
    # Calcular remanentes
    n_restante = N_ai - limitante
    p_restante = P_ai - limitante
    k_restante = K_ai - limitante

    # --- PASO 2: Rellenar FÓSFORO (P) con DAP ---
    qty_dap = 0
    if p_restante > 1:
        qty_dap = (p_restante / 46) * 100
        rec.append(f"- REFUERZO P: Aplicar {qty_dap:.2f} kg/ha de DAP (18-46-0)")
        # Descuento de N por aporte del DAP
        aporte_n_dap = qty_dap * 0.18
        n_restante = n_restante - aporte_n_dap

    # --- PASO 3: Rellenar POTASIO (K) con KCl ---
    if k_restante > 1:
        qty_kcl = (k_restante / 60) * 100
        rec.append(f"- REFUERZO K: Aplicar {qty_kcl:.2f} kg/ha de KCl (0-0-60)")

    # --- PASO 4: Rellenar NITRÓGENO (N) con UREA ---
    if n_restante > 1:
        qty_urea = (n_restante / 46) * 100
        rec.append(f"- REFUERZO N: Aplicar {qty_urea:.2f} kg/ha de Urea (46-0-0)")

    rec.append("")
    rec.append("NOTA TECNICA:")
    rec.append("Aplicar Triple 15 y DAP a la siembra.")
    rec.append("Aplicar Urea y KCl en etapa de desarrollo.")
    
    return "\n".join(rec)