import os


class Config:
    APP_NAME = os.getenv("APP_NAME", "CloudCart API")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "cloudcart")
    DB_USER = os.getenv("DB_USER", "cloudcart_user")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "cloudcart_pass")

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False