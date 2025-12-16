import numpy as np
from scipy.optimize import linprog

class HydroOptimizer:
    def __init__(self):
        self.salts = {
            "Nitrato de Calcio": {
                "N": 155, "P": 0, "K": 0, "Ca": 190, "Mg": 0, "S": 0,
                "cost": 1.2, "type": "A"
            },
            "Nitrato de Potasio": {
                "N": 130, "P": 0, "K": 380, "Ca": 0, "Mg": 0, "S": 0,
                "cost": 1.8, "type": "B"
            },
            "Fosfato Monopotásico (MKP)": {
                "N": 0, "P": 520, "K": 340, "Ca": 0, "Mg": 0, "S": 0,
                "cost": 2.5, "type": "B"
            },
            "Sulfato de Magnesio": {
                "N": 0, "P": 0, "K": 0, "Ca": 0, "Mg": 96, "S": 130,
                "cost": 0.8, "type": "B"
            },
            "Sulfato de Potasio": { 
                "N": 0, "P": 0, "K": 450, "Ca": 0, "Mg": 0, "S": 180,
                "cost": 1.5, "type": "B"
            }
        }

    def calculate_recipe(self, targets, water_liters):
        names = list(self.salts.keys())
        n_vars = len(names)
        costs = [self.salts[k]["cost"] for k in names]
        tolerance = 0.10 

        A_ub = []
        b_ub = []

        for nutrient in ["N", "P", "K"]:
            target_val = targets[nutrient]
            
        
            row_upper = [self.salts[s][nutrient] for s in names]
            A_ub.append(row_upper)
            b_ub.append(target_val * (1 + tolerance))

            row_lower = [-self.salts[s][nutrient] for s in names]
            A_ub.append(row_lower)
            b_ub.append(-(target_val * (1 - tolerance)))

    
        A_ub.append([-self.salts[s]["Ca"] for s in names])
        b_ub.append(-100) 

        # Mg >= 30 ppm
        A_ub.append([-self.salts[s]["Mg"] for s in names])
        b_ub.append(-30)  

        bounds = [(0, None)] * n_vars

        # Resolver
        res = linprog(
            c=costs,
            A_ub=A_ub,
            b_ub=b_ub,
            bounds=bounds,
            method="highs" 
        )

        if not res.success:
            return self._fallback_calculation(names, targets, water_liters)

        return self._format_result(res.x, names, water_liters)

    def _format_result(self, quantities, names, water_liters):
        recipe = []
        for i, gpl in enumerate(quantities):
            if gpl > 0.01: 
                total = gpl * water_liters
                
                recipe.append({
                    "name": names[i],
                    "grams_total": round(total, 2),
                    "dose_per_liter": round(gpl, 3),
                    "tank_type": self.salts[names[i]]["type"],
                    "human_instruction": f"Disuelve {total:.2f} g de {names[i]} en tus {water_liters} L de agua."
                })
        return recipe

    def _fallback_calculation(self, names, targets, water_liters):
        recipe = []
        
        p_target = targets["P"]
        mkp_val = p_target / 520 
        if mkp_val > 0:
            total = mkp_val * water_liters
            recipe.append({
                "name": "Fosfato Monopotásico (MKP)", 
                "grams_total": round(total, 2), 
                "dose_per_liter": round(mkp_val, 3),
                "tank_type": "B",
                "human_instruction": f"Disuelve {total:.2f} g de MKP (Fallback)."
            })
        
        n_target = targets["N"]
        nit_cal_val = n_target / 155
        if nit_cal_val > 0:
            total = nit_cal_val * water_liters
            recipe.append({
                "name": "Nitrato de Calcio", 
                "grams_total": round(total, 2),
                "dose_per_liter": round(nit_cal_val, 3),
                "tank_type": "A",
                "human_instruction": f"Disuelve {total:.2f} g de Nitrato de Calcio."
            })

        mg_val = 40 / 96 
        recipe.append({
             "name": "Sulfato de Magnesio", 
             "grams_total": round(mg_val * water_liters, 2),
             "dose_per_liter": round(mg_val, 3),
             "tank_type": "B",
             "human_instruction": f"Disuelve {round(mg_val * water_liters, 2)} g de Sulfato de Magnesio."
        })

        return recipe