import tensorflow as tf
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import numpy as np

from sklearn.metrics import mean_squared_error, r2_score, accuracy_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, Activation
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from model.preprocessing_data_normal import preprocess_data


#Este modelo se encarga de calcular el fertilizante para plantaciones realizadas en tierra.

#Uso de GPU para el entrenamiento del modelo
gpus = tf.config.experimental.list_physical_devices('GPU')

if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print(f"GPU Detectada y Configurada: {len(gpus)}")
    except RuntimeError as e:
        print(e)

def r2_keras(y_true, y_pred):
    SS_res = tf.reduce_sum(tf.square(y_true - y_pred))
    SS_tot = tf.reduce_sum(tf.square(y_true - tf.reduce_mean(y_true)))
    return (1 - SS_res / (SS_tot + tf.keras.backend.epsilon()))

#Se definen las capas que vamos a tener en nuestra red neuronal Perceptron Multicapa
def build_model(input_dim, output_dim):
    model = Sequential()

    #Capa 1
    model.add(Dense(256, input_shape=(input_dim,)))
    model.add(BatchNormalization())
    model.add(Activation('swish'))
    model.add(Dropout(0.3))

    #Capa 2
    model.add(Dense(128))
    model.add(BatchNormalization())
    model.add(Activation('swish'))
    model.add(Dropout(0.3))

    #Capa 3
    model.add(Dense(64))
    model.add(BatchNormalization())
    model.add(Activation('swish'))
    model.add(Dropout(0.2))

    #Capa 4
    model.add(Dense(32))
    model.add(Activation('swish'))

    model.add(Dense(output_dim, activation='sigmoid'))

    optimizer = Adam(learning_rate=0.001)

    model.compile(
        optimizer=optimizer,
        loss='mse',
        metrics=['mae', r2_keras]
    )

    return model

#Entrenamiento del modelo y visualización de los resultados obtenidos.
def train_pipeline():
    X_train, X_test, y_train, y_test, scaler_y = preprocess_data()

    input_shape = X_train.shape[1]
    output_shape = y_train.shape[1]

    print(f"Construyendo el modelo con Input Shape: {input_shape}, Output Shape: {output_shape} salidas...")
    model = build_model(input_shape, output_shape)
    model.summary()

    callbacks = [

        ModelCheckpoint('training_models/agromind_best.keras', monitor='val_loss', save_best_only=True, verbose=1),

        EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True, verbose=1),

        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6,verbose=1)
    ]

    history = model.fit(
        X_train, y_train,
        validation_split=0.2,
        epochs=200,
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )

    loss, mae, r2 = model.evaluate(X_test, y_test, verbose=0)
    print("Resultados Finales:\n")
    print(f"Error MAE: {mae:.4f}")
    print(f"R2 Score: {r2:.4f}")

    print(f"\nPrueba de Realidad\n")
    y_pred_scaled = model.predict(X_test)
    y_test_real = scaler_y.inverse_transform(y_test)
    y_pred_real = scaler_y.inverse_transform(y_pred_scaled)

    mae_real = np.mean(np.abs(y_test_real - y_pred_real), axis=0)
    print(f"Error Promedio en Nitrógeno (N): +/- {mae_real[0]:.2f} kg/ha")
    print(f"Error Promedio en Fósforo (P):   +/- {mae_real[1]:.2f} kg/ha")
    print(f"Error Promedio en Potasio (K):   +/- {mae_real[2]:.2f} kg/ha")

    plt.figure(figsize=(14, 5))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Train Loss')
    plt.plot(history.history['val_loss'], label='Val Loss')
    plt.title('Evolución del Error (MSE)')
    plt.xlabel('Épocas')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['r2_keras'], label='Train R2')
    plt.plot(history.history['val_r2_keras'], label='Val R2')
    plt.title('Evolución de la Precisión (R2 Score)')
    plt.xlabel('Épocas')
    plt.legend()

    plt.show()

    plt.figure(figsize=(8,8))
    plt.scatter(y_test_real.flatten(), y_pred_real.flatten(), alpha=0.3, color='green')
    plt.plot([0, 200], [0, 200], 'r--', lw=2) 
    plt.xlabel("Valor Real (Kg/ha)")
    plt.ylabel("Predicción IA (Kg/ha)")
    plt.title("Predicción vs Realidad (Si los puntos están en la línea roja, es perfecto)")
    plt.show()