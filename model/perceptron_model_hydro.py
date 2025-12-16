import pandas as pd
import numpy as np 
import tensorflow as tf
import matplotlib.pyplot as plt
import joblib

from tensorflow.keras import layers, models, optimizers, callbacks
from model.preprocessing_data_hydro import preprocess_data
from sklearn.metrics import r2_score

def build_model(num_features_dim, num_classes, embedding_dim=0):
    
    input_num = layers.Input(shape=(num_features_dim, ), name="input_numerico")
    x1 = layers.Dense(64, activation='relu')(input_num)
    x1 = layers.BatchNormalization()(x1)

    
    input_cat = layers.Input(shape=(1,), name="input_cultivo")
    x2 = layers.Embedding(input_dim=num_classes, output_dim=embedding_dim,name="embedding_cultivos")(input_cat)
    x2 = layers.Flatten()(x2)

    merged = layers.Concatenate()([x1, x2])

    dense = layers.Dense(128, activation='relu')(merged)
    dense = layers.Dropout(0.3)(dense)

    dense = layers.Dense(64, activation='relu')(dense)
    dense = layers.Dropout(0.2)(dense)

    dense = layers.Dense(32, activation='relu')(dense)

    output = layers.Dense(4, activation='linear', name='output_nutrientes')(dense)

    model = models.Model(inputs=[input_num, input_cat], outputs=output)
    optimizer = optimizers.Adam(learning_rate=0.001)

    model.compile(optimizer=optimizer, loss='mse', metrics=['mae'])

    return model

def plot_history(model, history, X_test, y_test, scaler_y):
    
    y_pred_scaled = model.predict(X_test, verbose=0)
    y_test_real = scaler_y.inverse_transform(y_test)
    y_pred_real = scaler_y.inverse_transform(y_pred_scaled)

    r2_global = r2_score(y_test_real, y_pred_real)
    mae_real = np.mean(np.abs(y_test_real - y_pred_real), axis=0)

    print("\nResultados Finales:")
    print(f"R2 Score Global: {r2_global*100:.2f}%")
    
    plt.figure(figsize=(14, 6))

    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Entrenamiento (Train)', linewidth=2)
    plt.plot(history.history['val_loss'], label='Validación (Test)', linewidth=2)
    plt.title('Curva de Aprendizaje (Debe bajar)')
    plt.xlabel('Épocas')
    plt.ylabel('Error (MSE)')
    plt.legend()
    plt.grid(True, alpha=0.3)

    plt.subplot(1, 2, 2)
    plt.scatter(y_test_real.flatten(), y_pred_real.flatten(), alpha=0.4, color='green', s=10)

    min_val = np.min(y_test_real)
    max_val = np.max(y_test_real)
    plt.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfección Ideal')
    
    plt.xlabel("Valor Real (Dataset)")
    plt.ylabel("Predicción IA")
    plt.title(f"Predicción vs Realidad (R2: {r2_global*100:.2f})%")
    plt.legend()
    plt.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()
    

def train_model_hydro():

    X_num_train, X_num_test, X_cat_train, X_cat_test, y_train, y_test, num_classes = preprocess_data()
    num_features_dim = X_num_train.shape[1]
    scaler_y = joblib.load('Artifacts/scaler_y_hydro.joblib')

    model = build_model(num_features_dim, num_classes, embedding_dim=10)
    model.summary()

    early_stop = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=15,
        restore_best_weights=True
    )

    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=0.00001
    )

    history = model.fit(
        x=[X_num_train, X_cat_train],
        y=y_train,
        validation_data=([X_num_test, X_cat_test], y_test),
        epochs=150,
        batch_size=32,
        callbacks=[early_stop, reduce_lr],
        verbose=1 
    )

    model.save('training_models/hydro_model.keras')

    loss, mae = model.evaluate([X_num_test, X_cat_test], y_test)

    print(f"\nResultados finales en Test -> Loss (MSE): {loss:.4f}, MAE: {mae:.4f}")

    plot_history(model, history, [X_num_test, X_cat_test], y_test, scaler_y)