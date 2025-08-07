from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region_name: str
    elevenlabs_api_key: str
    bedrock_model_id: str
    bedrock_synthesis_model_id: str
    kendra_index_id: str
    neptune_endpoint: str
    s3_bucket_name: str
    dynamodb_speakers_table_name: str
    hugging_face_token: str
    dynamodb_analytics_table_name: str
    dynamodb_alerts_table_name: str
    google_credentials_path: str = "credentials.json"
    google_token_path: str = "token.json"
    dynamodb_tasks_table_name: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings() 