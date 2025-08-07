from datetime import datetime
from typing import List, Dict
import uuid
from backend.clients import tasks_table
from backend.logger import logger
from boto3.dynamodb.conditions import Key, Attr

def create_task(patient_id: str, summary: str, start_date: str, end_date: str, description: str = "") -> Dict:
    """Creates a new task with a start and end date."""
    task_id = str(uuid.uuid4())
    item = {
        'patient_id': patient_id,
        'task_id': task_id,
        'summary': summary,
        'start_date': start_date,
        'end_date': end_date,
        'description': description,
        'completed': False,
        'created_at': datetime.now().isoformat()
    }
    try:
        tasks_table.put_item(Item=item)
        logger.info(f"Created task {task_id} for patient {patient_id}.")
        return item
    except Exception as e:
        logger.error(f"Error creating task for patient {patient_id}: {e}")
        return {"error": str(e)}

def get_tasks_for_patient(patient_id: str, upcoming_only: bool = True) -> List[Dict]:
    """Retrieves tasks for a patient from DynamoDB."""
    try:
        filter_expressions = []
        if upcoming_only:
            filter_expressions.append(Attr('end_date').gte(datetime.now().strftime('%Y-%m-%d')))
            filter_expressions.append(Attr('completed').eq(False))
        
        # We must query by partition key first
        response = tasks_table.query(
            KeyConditionExpression=Key('patient_id').eq(patient_id)
        )
        items = response.get('Items', [])
        
        # Then, filter the results in the application code
        if upcoming_only:
            now_str = datetime.now().strftime('%Y-%m-%d')
            items = [
                item for item in items 
                if item.get('end_date') and item.get('end_date') >= now_str and not item.get('completed')
            ]
            
        return items
    except Exception as e:
        logger.error(f"Error getting tasks for patient {patient_id}: {e}")
        return []

def mark_task_as_completed(patient_id: str, task_id: str) -> Dict:
    """Marks a specific task as completed in DynamoDB."""
    try:
        response = tasks_table.update_item(
            Key={'patient_id': patient_id, 'task_id': task_id},
            UpdateExpression="set completed = :c",
            ExpressionAttributeValues={':c': True},
            ReturnValues="UPDATED_NEW"
        )
        return response
    except Exception as e:
        logger.error(f"Error completing task {task_id} for patient {patient_id}: {e}")
        return {"error": str(e)} 