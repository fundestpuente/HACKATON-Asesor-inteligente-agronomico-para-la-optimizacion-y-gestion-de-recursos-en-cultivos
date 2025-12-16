import requests


API_KEY = "44f6f5e71b85bbcd05354bd8507831dc"  
URL = "https://api.openweathermap.org/data/2.5/weather"

def get_weather(lat, lon):
    try:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": API_KEY,
            "units": "metric"
        }

        response = requests.get(URL, params=params)
        data = response.json()

        if response.status_code != 200:
            print(f"Error OpenWeatherMap: {data.get('message', 'Desconocido')}")
            return {"temperature": 25.0, "humidity": 60.0, "rainfall": 50.0}

        
        rain_value = 0.0
        if "rain" in data:
            rain_value = data["rain"].get("1h", data["rain"].get("3h", 0.0))

        weather = {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "rainfall": rain_value
        }

        return weather

    except Exception as e:
        print(f"Error conectando al clima: {e}")
        return {"temperature": 25.0, "humidity": 60.0, "rainfall": 50.0}