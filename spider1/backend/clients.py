import boto3
from .config import settings
from elevenlabs.client import ElevenLabs

# Centralized Boto3 clients
# This prevents re-creating clients on every request

bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region_name,
)

kendra_client = boto3.client(
    "kendra",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region_name,
)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region_name
)

dynamodb_resource = boto3.resource(
    "dynamodb",
    aws_access_key_id=settings.aws_access_key_id,
    aws_secret_access_key=settings.aws_secret_access_key,
    region_name=settings.aws_region_name
)

analytics_table = dynamodb_resource.Table(settings.dynamodb_analytics_table_name)
alerts_table = dynamodb_resource.Table(settings.dynamodb_alerts_table_name)
tasks_table = dynamodb_resource.Table(settings.dynamodb_tasks_table_name)

# Centralized ElevenLabs Client
elevenlabs_client = ElevenLabs(
    api_key=settings.elevenlabs_api_key,
) 