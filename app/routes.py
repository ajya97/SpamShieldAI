from flask import Blueprint, render_template, request, jsonify

from src.predicter import predicter


main = Blueprint("main", __name__)



# Home Page
@main.route("/", methods=["GET"])
def home():
    return render_template("index.html")


# Predict Spam/Real email
@main.route("/predict", methods=["POST"])
def predict():
    try:
        # Get email text from form
        email_text = request.form.get("email_text", "").strip()
    except Exception as e:
        return render_template(
                    "index.html",
                    error="Enter email text error."
                )
    if not email_text:
        return render_template(
            "index.html",
            error="Please enter some email text."
        )
    try:
        # Prediction
        result = predicter(email_text)

        return render_template(
            "predict.html",
            prediction=result["prediction"], # "Safe" and "Spam"
            confidence=result["confidence"], # 0.6477516 similar this
            email_text=email_text
        )

    except Exception as e:
        return render_template(
            "index.html",
            error=f"Prediction error: {str(e)}"
        )


# REST API
@main.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        data = request.get_json()

        if not data or "email_text" not in data:
            return jsonify({
                "success": False,
                "error": "email_text is required"
            }), 400

        email_text = data["email_text"].strip()

        if not email_text:
            return jsonify({
                "success": False,
                "error": "email text cannot be empty"
            }), 400

        # Prediction
        result = predicter(email_text)

        return jsonify({
            "success": True,
            "prediction": result["prediction"],
            "confidence": result["confidence"]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# Health Check
@main.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "Spam email Detector API"
    }), 200