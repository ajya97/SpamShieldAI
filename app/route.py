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
            prediction=result["prediction"],
            confidence=result["confidence"],
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


# ------------------------------------------------------------------
# ADDITION (not part of the original backend): the frontend spec asks
# for an About page. This adds a new route only — it does not touch
# /predict, /api/predict, or /api/health, and no existing function,
# field name, or response shape above was changed.
# ------------------------------------------------------------------
@main.route("/about", methods=["GET"])
def about():
    return render_template("about.html")


# ------------------------------------------------------------------
# ADDITION (not part of the original backend): the API reference was
# split out of the homepage into its own page/route. This does not
# rename or alter /api/predict or /api/health themselves — it only
# adds a human-readable docs page at a new path, "/api".
# ------------------------------------------------------------------
@main.route("/api", methods=["GET"])
def api_docs():
    return render_template("api.html")
