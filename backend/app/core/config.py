from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    CLERK_SECRET_KEY: str
    GROQ_API_KEY: str
    REDIS_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"  # ignore any extra env vars like NEXT_PUBLIC_*
    )

settings = Settings()