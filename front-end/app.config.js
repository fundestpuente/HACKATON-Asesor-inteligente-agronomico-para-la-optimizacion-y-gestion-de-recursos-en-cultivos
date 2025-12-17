export default {
  expo: {
    name: "AgroIA",
    slug: "agroia",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1b5e20"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "AgroMind necesita acceso a tu ubicación para obtener datos climáticos precisos y realizar el análisis de tu cultivo.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "AgroMind necesita acceso a tu ubicación para obtener datos climáticos precisos y realizar el análisis de tu cultivo."
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1b5e20"
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-font",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "AgroMind necesita acceso a tu ubicación para obtener datos climáticos precisos y realizar el análisis de tu cultivo."
        }
      ]
    ]
  }
};
