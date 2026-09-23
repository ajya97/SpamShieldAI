# SpamShieldAI — Frontend for the AI Spam Email Detector

A production-quality frontend built for the existing Flask backend, without changing
`/predict`, `/api/predict`, `/api/health`, or the `email_text` / `prediction` / `confidence`
contract.

## Project structure

```
project/
├── app/
│   ├── __init__.py        # app factory, blueprint registration, 404 handler
│   └── route.py           # original routes, unchanged + one additive /about route
├── src/
│   └── predicter.py       # <- put your existing, unmodified predicter here
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── predict.html
│   ├── about.html
│   └── 404.html
├── static/
│   ├── css/
│   │   ├── style.css
│   │   ├── animations.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   └── prediction.js
│   └── assets/
│       └── logo.svg
├── run.py
├── requirements.txt
├── runtime.txt
└── README.md
```

## Local testing

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Visit `http://127.0.0.1:5000/`.

## Render deployment

**Build Command**
```
pip install -r requirements.txt
```

**Start Command**
```
gunicorn run:app
```
This matches `run.py`, which exposes a module-level `app` object created via
`create_app()`. If you rename `run.py` or the app factory, update this command to match.

**Python version**: pinned via `runtime.txt` (`python-3.11.9`). Render's native
"Python Version" environment setting can also be used instead of `runtime.txt` if you
prefer managing it from the dashboard — both are supported, so `runtime.txt` is provided
for portability but is not strictly required.

**Environment variables**: none are required by the frontend. If `predicter.py` needs
model paths, API keys, or config values, set those in Render's Environment tab — never
commit them to the repo or reference them in frontend JS/HTML.

## Deployment checklist

- [ ] Your real `predicter.py` is placed at `src/predicter.py`
- [ ] `requirements.txt` includes every package `predicter.py` actually imports
- [ ] `pip install -r requirements.txt` succeeds locally
- [ ] `python run.py` serves the home page, analyzer, and result page correctly
- [ ] `/api/health` returns `{"status": "healthy", ...}`
- [ ] `/about` renders correctly (new route, added in `app/route.py`)
- [ ] Static assets load (check browser devtools network tab for 404s)
- [ ] Render Start Command set to `gunicorn run:app`
- [ ] Test a real spam-like email and a real safe-like email end to end
