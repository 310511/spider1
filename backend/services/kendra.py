# This file will contain the logic for interacting with AWS Kendra. 

import uuid
import time
from backend.config import settings
from backend.clients import kendra_client
from backend.logger import logger
from typing import Optional

def add_document(original_transcript: str, analysis_json: dict, user_id: str, s3_url: Optional[str] = None, speaker_cluster_id: Optional[str] = None):
    """
    Adds a document to the Kendra index. The document contains the original
    transcript and the AI-generated summary. Can optionally include an S3 URL
    and a speaker cluster ID.
    """
    doc_id = str(uuid.uuid4())
    summary = analysis_json.get("summary", "")
    importance = analysis_json.get("importance_score", 0.5)
    title = f"Memory from {time.ctime()}"

    # We combine the summary and the transcript for better searchability
    full_text = f"Summary: {summary}\n\nTranscript:\n{original_transcript}"

    # Custom attributes like our importance score must be placed in the "Attributes" list.
    document = {
        "Id": doc_id,
        "Title": title,
        "Blob": full_text.encode('utf-8'),
        "ContentType": "PLAIN_TEXT",
        "AccessControlList": [{
            'Name': user_id,
            'Type': 'USER',
            'Access': 'ALLOW'
        }],
        "Attributes": [
            {
                "Key": "creation_timestamp",
                "Value": { "LongValue": int(time.time()) }
            },
            {
                "Key": "importance_score",
                "Value": {
                    # Kendra API requires numeric values to be sent as strings here.
                    # The facet definition in the Kendra console ensures it's treated as a Double for queries.
                    "StringValue": str(float(importance))
                }
            }
        ]
    }

    if s3_url:
        document["Attributes"].append({
            "Key": "s3_url",
            "Value": {
                "StringValue": s3_url
            }
        })

    if speaker_cluster_id:
        document["Attributes"].append({
            "Key": "speaker_cluster_id",
            "Value": {
                "StringValue": speaker_cluster_id
            }
        })

    try:
        result = kendra_client.batch_put_document(
            IndexId=settings.kendra_index_id,
            Documents=[document]
        )
        logger.info(f"Successfully added document {doc_id} to Kendra.")
        if result.get('FailedDocuments'):
            logger.error(f"Failed documents: {result['FailedDocuments']}")
        return result
    except Exception as e:
        logger.error(f"Error adding document to Kendra: {e}")
        return None 


def query_index(query_text: str, user_id: str) -> list[dict]:
    """
    Queries the Kendra index and returns a list of result dictionaries.
    Each dictionary contains the text and an optional s3_url.
    """
    try:
        response = kendra_client.query(
            IndexId=settings.kendra_index_id,
            QueryText=query_text,
            UserContext={'UserId': user_id},
            SortingConfiguration={
                'DocumentAttributeKey': 'creation_timestamp',
                'SortOrder': 'DESC'
            },
            RequestedDocumentAttributes=["s3_url", "importance_score", "creation_timestamp"]
        )
        
        results = []
        for item in response.get('ResultItems', [])[:3]:
            text = item['DocumentExcerpt']['Text']
            s3_url = None
            if item.get('DocumentAttributes'):
                for attr in item['DocumentAttributes']:
                    if attr['Key'] == 's3_url':
                        s3_url = attr['Value']['StringValue']
            results.append({"text": text, "s3_url": s3_url})

        logger.info(f"Found {len(results)} results from Kendra.")
        return results
        
    except Exception as e:
        logger.error(f"Error querying Kendra index: {e}")
        return [] 