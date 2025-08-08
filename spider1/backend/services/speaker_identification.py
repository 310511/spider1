from ..config import settings
from ..logger import logger
from ..clients import dynamodb_resource
import numpy as np
from scipy.spatial.distance import cdist
from decimal import Decimal
import boto3

table = dynamodb_resource.Table(settings.dynamodb_speakers_table_name)

SIMILARITY_THRESHOLD = 0.85 # Using 1 - cosine distance

def identify_and_update_speaker(embedding: np.ndarray, importance_score: float, user_id: str) -> str:
    """
    Finds the closest speaker cluster for a given user or creates a new one.
    Updates the cluster with the new embedding and importance score.
    Returns the cluster_id.
    """
    try:
        response = table.query(KeyConditionExpression=boto3.dynamodb.conditions.Key('user_id').eq(user_id))
        user_speakers = response.get('Items', [])
    except Exception as e:
        logger.error(f"Could not query DynamoDB table for user {user_id}: {e}")
        return "speaker_unknown"

    # Flatten the embedding to a 1D array to ensure consistency
    embedding_1d = embedding.flatten()

    if not user_speakers:
        # First speaker for this user
        new_speaker_id = f"{user_id}_speaker_0"
        new_item = {
            "user_id": user_id,
            "cluster_id": new_speaker_id,
            "average_embedding": [Decimal(str(x)) for x in embedding_1d],
            "average_importance_score": Decimal(str(importance_score)),
            "utterance_count": 1,
            "llm_inferred_labels": []
        }
        table.put_item(Item=new_item)
        logger.info(f"Created new speaker cluster: {new_speaker_id}")
        return new_speaker_id

    # Compare against existing speakers
    known_embeddings = np.array([[float(x) for x in s['average_embedding']] for s in user_speakers])
    # Ensure the input embedding is 2D for cdist
    distances = cdist(embedding_1d.reshape(1, -1), known_embeddings, metric="cosine")
    
    closest_speaker_index = np.argmin(distances)
    min_distance = distances[0, closest_speaker_index]
    similarity = 1 - min_distance

    if similarity >= SIMILARITY_THRESHOLD:
        # Match found, update existing cluster
        matched_speaker = user_speakers[closest_speaker_index]
        cluster_id = matched_speaker['cluster_id']
        
        # Explicitly cast all numeric types from DynamoDB before using them in calculations
        old_count = int(matched_speaker['utterance_count'])
        new_count = old_count + 1
        
        # Explicitly convert Decimal back to float for calculation
        old_avg_emb = np.array([float(x) for x in matched_speaker['average_embedding']])
        new_avg_emb = (old_avg_emb * old_count + embedding_1d) / new_count
        
        old_avg_imp = float(matched_speaker['average_importance_score'])
        new_avg_imp = (old_avg_imp * old_count + importance_score) / new_count
        
        table.update_item(
            Key={'user_id': user_id, 'cluster_id': cluster_id},
            UpdateExpression="set average_embedding = :emb, average_importance_score = :imp, utterance_count = :count",
            ExpressionAttributeValues={
                ':emb': [Decimal(str(x)) for x in new_avg_emb],
                ':imp': Decimal(str(new_avg_imp)),
                ':count': new_count
            }
        )
        logger.info(f"Matched and updated speaker cluster: {cluster_id} (Similarity: {similarity:.2f})")
        return cluster_id
    else:
        # No match, create new speaker for this user
        new_speaker_id = f"{user_id}_speaker_{len(user_speakers)}"
        new_item = {
            "user_id": user_id,
            "cluster_id": new_speaker_id,
            "average_embedding": [Decimal(str(x)) for x in embedding_1d],
            "average_importance_score": Decimal(str(importance_score)),
            "utterance_count": 1,
            "llm_inferred_labels": []
        }
        table.put_item(Item=new_item)
        logger.info(f"No match found. Created new speaker cluster: {new_speaker_id} (Closest similarity: {similarity:.2f})")
        return new_speaker_id 