import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, PowerTransformer
from sklearn.compose import ColumnTransformer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA



def load_data():
    df = pd.read_csv("data/hydro_dataset.csv")
    print("Datos cargados correctamente.")
    return df

def clean_outliers(df):
    cols_weather = ['Temp_C', 'Humidity_RH', 'pH_Water', 'Week']

    Q1 = df[cols_weather].quantile(0.05)
    Q3 = df[cols_weather].quantile(0.95)
    IQR = Q3 - Q1

    condition = ~((df[cols_weather] < (Q1 - 1.5 * IQR)) | (df[cols_weather] > (Q3 + 1.5 * IQR))).any(axis=1)
    df_clean = df[condition].copy()
    rows_removed = df.shape[0] - df_clean.shape[0]
    print(f"Outliers eliminados: {rows_removed}")

    return df_clean

def feature_engineering(df):
    df_eng = df.copy()

    df_eng['climate_interaction'] = df_eng['Temp_C'] * df_eng['Humidity_RH']
    return df_eng

def fit_transform_data(df):

    features_num = ['Temp_C', 'Humidity_RH', 'pH_Water', 'Week','climate_interaction']
    features_cat = ['Crop']
    targets = ['N_ppm','P_ppm','K_ppm','EC_Target']

    X_num = df[features_num].values
    X_cat = df[features_cat].values
    y = df[targets].values

    scaler_num = PowerTransformer(method='yeo-johnson')
    X_num_processed = scaler_num.fit_transform(X_num)

    encoder_cat = LabelEncoder()
    X_cat_processed = encoder_cat.fit_transform(X_cat)

    scaler_y = MinMaxScaler()
    y_processed = scaler_y.fit_transform(y)

    print(f"Transformación completada: X Shape: {X_num_processed.shape}, y Shape: {y_processed.shape}")

    return X_num_processed, X_cat_processed, y_processed, scaler_num, encoder_cat, scaler_y

def save_artifacts(scaler_num, encoder_cat, scaler_y):
    joblib.dump(scaler_num, 'Artifacts/scaler_num_hydro.joblib')
    joblib.dump(encoder_cat, 'Artifacts/label_encoder_hydro.joblib')
    joblib.dump(scaler_y, 'Artifacts/scaler_y_hydro.joblib')
    print("Artefactos guardados exitosamente")


def preprocess_data(test_size=0.2, random_state=42):
    df = load_data()
    df_clean = clean_outliers(df)
    df_final = feature_engineering(df_clean)
    
    X_num, X_cat, y, scaler_num, encoder_cat, scaler_y = fit_transform_data(df_final)

    save_artifacts(scaler_num, encoder_cat, scaler_y)

    X_num_train, X_num_test, X_cat_train, X_cat_test, y_train, y_test = train_test_split(
        X_num, X_cat, y, 
        test_size=test_size, 
        random_state=random_state
        )
    
    num_classes = len(encoder_cat.classes_)

    print("Datos dividios en conjuntos de entrenamiento y prueba")
    return X_num_train, X_num_test, X_cat_train, X_cat_test, y_train, y_test, num_classes


def visualize_kmeans():

    df = load_data()
    
    features = ['N_ppm', 'P_ppm', 'K_ppm', 'EC_Target', 'Temp_C', 'Humidity_RH']
    col_crop = 'Crop'
        
    X = df[features]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("Ejecutando KMeans para visualización...")
    model = KMeans(n_clusters=15, random_state=42, n_init=10)
    clusters = model.fit_predict(X_scaled)

    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)

    df_plot = pd.DataFrame(X_pca, columns=['PCA1', 'PCA2'])
    df_plot['Cluster_KMeans'] = clusters
    df_plot['Cultivo_Real'] = df[col_crop]

    plt.figure(figsize=(12, 8))
    sns.scatterplot(
        data=df_plot, x='PCA1', y='PCA2', hue='Cluster_KMeans',
        palette='tab20', s=50, alpha=0.6
    )
    plt.title('Agrupamiento K-Means proyectado en 2D')
    plt.show()





