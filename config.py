from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://assetflow:assetflow@localhost:5432/assetflow"
    jwt_secret: str = "change-me-before-the-demo"
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 720
    cors_origins: str = "http://localhost:5173"

    # Tunables for the Asset Health Score. Exposed so the score stays explainable.
    expected_life_years: int = 5
    idle_days_threshold: int = 45

    class Config:
        env_file = ".env"


settings = Settings()
