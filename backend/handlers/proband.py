import json
import boto3
import uuid
from datetime import datetime
from pydantic import BaseModel, ValidationError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('pedigree-ai-backend-dev')

class ProbandModel(BaseModel):
    name: str
    sex: str
    age: int
    diagnosis: str

def create(event, context):
    try:
        body = json.loads(event['body'])
        proband = ProbandModel(**body)
        
        proband_id = str(uuid.uuid4())
        
        item = {
            'pk': f'PROBAND#{proband_id}',
            'sk': f'PROBAND#{proband_id}',
            'id': proband_id,
            'name': proband.name,
            'sex': proband.sex,
            'age': proband.age,
            'diagnosis': proband.diagnosis,
            'created_at': datetime.utcnow().isoformat(),
            'type': 'proband'
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            'body': json.dumps({
                'message': 'Proband created successfully',
                'id': proband_id,
                'data': item
            })
        }
        
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Validation error', 'details': e.errors()})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def get(event, context):
    try:
        proband_id = event['pathParameters']['id']
        
        response = table.get_item(
            Key={
                'pk': f'PROBAND#{proband_id}',
                'sk': f'PROBAND#{proband_id}'
            }
        )
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Proband not found'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(response['Item'])
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }