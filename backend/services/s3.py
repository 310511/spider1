from ..config import settings
from ..logger import logger
from ..clients import s3_client
from botocore.exceptions import NoCredentialsError
import uuid
from typing import Optional

def upload_file_to_s3(file_data: bytes, file_extension: str, user_id: str) -> Optional[str]:
    """
    Uploads a file to a user-specific folder in S3 and returns the file URL.
    """
    bucket_name = settings.s3_bucket_name
    # Generate a unique filename within the user's "folder"
    file_name = f"{user_id}/{uuid.uuid4()}.{file_extension}"
    
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=file_data,
            ContentType=f"image/{file_extension}"
        )
        # Construct the URL
        file_url = f"https://{bucket_name}.s3.{settings.aws_region_name}.amazonaws.com/{file_name}"
        logger.info(f"Successfully uploaded {file_name} to S3 bucket {bucket_name}.")
        return file_url
    except NoCredentialsError:
        logger.error("Credentials not available for S3 upload.")
        return None
    except Exception as e:
        logger.error(f"Error uploading to S3: {e}")
        return None 