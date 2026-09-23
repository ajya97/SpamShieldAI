import onnxruntime as ort

from src.text_cleaning import remove__number
from src.text_to_sequence import text_to_sequence
from src.pad_sequences import pad_sequence


def get_model():
    session =  ort.InferenceSession(
        "models/best_model_cpu.onnx",
        providers=["CPUExecutionProvider"]
    )

    input_name = session.get_inputs()[0].name
    return session,input_name


def predicter(txt):

    txt = remove__number(txt)
    squence = text_to_sequence(txt,"models/word_index.json")
    squence = pad_sequence(squence)

    model,input_name = get_model()

    output = model.run(
        None,
        {input_name: [squence]}
    )[0][0]
    value = output[0] < 0.5
    result = {
        "prediction" : "Spam" if value else "Safe",
        "confidence" : output[int(value)]
    }
    return result 