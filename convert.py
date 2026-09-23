import os

# GPU ko disable karo
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

import tensorflow as tf
import tf2onnx


INPUT_PATH = "Notebook/final_model.h5"
OUTPUT_PATH = "models/best_model_cpu.onnx"

MAX_LEN = 500


def convert():
    print("Loading original Keras model...")

    # Original trained model
    original_model = tf.keras.models.load_model(
        INPUT_PATH,
        compile=False
    )

    print("\nOriginal model:")
    original_model.summary()

    # ---------------------------------------------------------
    # Get layers
    # ---------------------------------------------------------

    embedding_layer = original_model.layers[0]
    lstm_layer = original_model.layers[1]
    dense_layer = original_model.layers[2]

    vocab_size = embedding_layer.input_dim
    embedding_dim = embedding_layer.output_dim

    lstm_units = lstm_layer.units

    print("\nArchitecture:")
    print("Vocab size :", vocab_size)
    print("Embedding  :", embedding_dim)
    print("LSTM units :", lstm_units)

    # ---------------------------------------------------------
    # Build CPU-compatible model
    # ---------------------------------------------------------

    inputs = tf.keras.Input(
        shape=(MAX_LEN,),
        dtype=tf.int32,
        name="input"
    )

    x = tf.keras.layers.Embedding(
        input_dim=vocab_size,
        output_dim=embedding_dim,
        name="embedding"
    )(inputs)

    x = tf.keras.layers.LSTM(
        units=lstm_units,
        return_sequences=False,
        use_cudnn=False,
        name="lstm"
    )(x)

    outputs = tf.keras.layers.Dense(
        2,
        activation="softmax",
        name="dense"
    )(x)

    cpu_model = tf.keras.Model(
        inputs=inputs,
        outputs=outputs,
        name="fake_email_detector"
    )

    # ---------------------------------------------------------
    # Copy trained weights
    # ---------------------------------------------------------

    print("\nCopying trained weights...")

    cpu_model.layers[1].set_weights(
        embedding_layer.get_weights()
    )

    cpu_model.layers[2].set_weights(
        lstm_layer.get_weights()
    )

    cpu_model.layers[3].set_weights(
        dense_layer.get_weights()
    )

    print("Weights copied successfully.")

    # ---------------------------------------------------------
    # Test model
    # ---------------------------------------------------------

    dummy_input = tf.zeros(
        (1, MAX_LEN),
        dtype=tf.int32
    )

    dummy_output = cpu_model(dummy_input)

    print("\nCPU model output shape:", dummy_output.shape)
    print("CPU model output:", dummy_output.numpy())

    # ---------------------------------------------------------
    # Convert to ONNX
    # ---------------------------------------------------------

    print("\nConverting to ONNX...")

    input_signature = (
        tf.TensorSpec(
            [None, MAX_LEN],
            tf.int32,
            name="input"
        ),
    )

    @tf.function(input_signature=input_signature)
    def model_fn(x):
        return {"output": cpu_model(x)}

    tf2onnx.convert.from_function(
        model_fn,
        input_signature=input_signature,
        opset=13,
        output_path=OUTPUT_PATH
    )

    print("\nONNX conversion completed!")
    print("Saved:", OUTPUT_PATH)


if __name__ == "__main__":
    convert()