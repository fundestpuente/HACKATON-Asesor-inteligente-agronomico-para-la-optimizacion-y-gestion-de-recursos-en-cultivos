import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder, PowerTransformer
from sklearn.compose import ColumnTransformer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA



def load_data():
    df = pd.read_csv("data/Crop_recommendation.csv")
    print("Datos cargados correctamente.")
    return df

def clean_outliers(df):
    cols_weather = ['temperature', 'humidity', 'ph', 'rainfall']

    # plt.figure(figsize=(12, 5))
    # plt.subplot(1, 2, 1)
    # sns.boxplot(data=df[cols_weather])
    # plt.title('Boxplot antes de eliminar outliers')
    # plt.xticks(rotation=45)

    Q1 = df[cols_weather].quantile(0.05)
    Q3 = df[cols_weather].quantile(0.95)
    IQR = Q3 - Q1

    condition = ~((df[cols_weather] < (Q1 - 1.5 * IQR)) | (df[cols_weather] > (Q3 + 1.5 * IQR))).any(axis=1)
    df_clean = df[condition].copy()
    rows_removed = df.shape[0] - df_clean.shape[0]
    print(f"Outliers eliminados: {rows_removed}")

    # plt.subplot(1, 2, 2)
    # sns.boxplot(data=df_clean[cols_weather])
    # plt.title('Boxplot después de eliminar outliers')
    # plt.xticks(rotation=45)
    # plt.tight_layout()
    # plt.show()

    return df_clean

def feature_engineering(df):
    df_eng = df.copy()

    df_eng['climate_interaction'] = df_eng['temperature'] * df_eng['humidity']
    return df_eng

def fit_transform_data(df):

    features_num = ['temperature', 'humidity', 'ph', 'rainfall']
    features_cat = ['label']

    X = df[features_num + features_cat]
    y = df[['N', 'P', 'K']]

    preprocessor_X = ColumnTransformer(transformers=[
        ('num', PowerTransformer(method='yeo-johnson'), features_num),
        ('cat', OneHotEncoder(sparse_output=False), features_cat)
    ])

    X_processed = preprocessor_X.fit_transform(X)
    categories = preprocessor_X.named_transformers_['cat'].categories_[0]

    scaler_y = MinMaxScaler()
    y_processed = scaler_y.fit_transform(y)

    print("Transformación completada: X Shape: {X_processed.shape}, y Shape: {y_processed.shape}")

    return X_processed, y_processed, preprocessor_X, scaler_y, categories

def save_artifacts(preprocessor_X, scaler_y, categories):
    joblib.dump(preprocessor_X, 'Artifacts/preprocessor_X.joblib')
    joblib.dump(scaler_y, 'Artifacts/scaler_y.joblib')
    joblib.dump(categories, 'Artifacts/categories.joblib')
    print("Artefactos guardados exitosamente")


def preprocess_data(test_size=0.2, random_state=42):
    df = load_data()
    df_clean = clean_outliers(df)
    df_final = feature_engineering(df_clean)
    
    X_processed, y_processed, preprocessor_X, scaler_y, categories = fit_transform_data(df_final)

    save_artifacts(preprocessor_X, scaler_y, categories)

    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y_processed, 
        test_size=test_size, 
        random_state=random_state
        )
    
    print("Datos dividios en conjuntos de entrenamiento y prueba")
    return X_train, X_test, y_train, y_test, scaler_y


def visualize_kmeans():
    df = load_data()
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X= df[features]

    scaler  = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("Ejecutando KMeans para visualizacion...")
    model = KMeans(n_clusters=22, random_state=42, n_init=10)
    clusters = model.fit_predict(X_scaled)

    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)

    df_plot = pd.DataFrame(X_pca, columns=['PCA1', 'PCA2'])
    df_plot['Cluster_KMeans'] = clusters
    df_plot['Cultivo_Real'] = df['label']

    plt.figure(figsize=(14, 10))

    sns.scatterplot(
        data=df_plot,
        x='PCA1',
        y='PCA2',
        hue='Cluster_KMeans',
        palette='tab20',
        s=60,
        alpha=0.7,
        legend='full'
    )

    centroids_pca = pca.transform(model.cluster_centers_)
    plt.scatter(centroids_pca[:, 0], centroids_pca[:, 1], s=200, c='black', marker='X', label='Centroides')

    plt.title('Agrupamiento K-Means (k=22) proyectado en 2D', fontsize=16)
    plt.xlabel('Componente Principal 1')
    plt.ylabel('Componente Principal 2')
    plt.legend(bbox_to_anchor=(1.05, 1), loc=2)
    plt.tight_layout()
    plt.show()

    crosstab = pd.crosstab(df_plot['Cluster_KMeans'], df_plot['Cultivo_Real'])
    print(crosstab.idxmax(axis=1))





