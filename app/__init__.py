import os

from flask import Flask, render_template

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(BASE_DIR, "templates"),
        static_folder=os.path.join(BASE_DIR, "static"),
    )

    from app.route import main
    app.register_blueprint(main)

    @app.errorhandler(404)
    def not_found(e):
        return render_template("404.html"), 404

    return app
