from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db
from app.routes import api


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)

    app.register_blueprint(api, url_prefix="/api")

    with app.app_context():
        db.create_all()

    return app