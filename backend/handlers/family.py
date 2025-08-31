import json
import boto3
import uuid
from datetime import datetime
from pydantic import BaseModel, ValidationError

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('pedigree-ai-backend-dev')

class FamilyMemberModel(BaseModel):
    name: str
    sex: str
    relationship: str
    proband_id: str
    age: int = None

def create(event, context):
    try:
        body = json.loads(event['body'])
        member = FamilyMemberModel(**body)
        
        member_id = str(uuid.uuid4())
        
        item = {
            'pk': f'PROBAND#{member.proband_id}',
            'sk': f'FAMILY#{member_id}',
            'id': member_id,
            'name': member.name,
            'sex': member.sex,
            'relationship': member.relationship,
            'proband_id': member.proband_id,
            'age': member.age,
            'created_at': datetime.utcnow().isoformat(),
            'type': 'family_member'
        }
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Family member created successfully',
                'id': member_id,
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

def get_all(event, context):
    try:
        proband_id = event['pathParameters']['probandId']
        
        response = table.query(
            KeyConditionExpression='pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues={
                ':pk': f'PROBAND#{proband_id}',
                ':sk': 'FAMILY#'
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'family_members': response['Items'],
                'count': response['Count']
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def update(event, context):
    try:
        member_id = event['pathParameters']['id']
        body = json.loads(event['body'])
        
        # Get existing item first
        response = table.scan(
            FilterExpression='id = :id',
            ExpressionAttributeValues={':id': member_id}
        )
        
        if not response['Items']:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Family member not found'})
            }
        
        item = response['Items'][0]
        
        # Update fields
        for key, value in body.items():
            if key in ['name', 'sex', 'relationship', 'age']:
                item[key] = value
        
        item['updated_at'] = datetime.utcnow().isoformat()
        
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Family member updated successfully',
                'data': item
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def delete(event, context):
    try:
        member_id = event['pathParameters']['id']
        
        # Get existing item first
        response = table.scan(
            FilterExpression='id = :id',
            ExpressionAttributeValues={':id': member_id}
        )
        
        if not response['Items']:
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Family member not found'})
            }
        
        item = response['Items'][0]
        
        table.delete_item(
            Key={
                'pk': item['pk'],
                'sk': item['sk']
            }
        )
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Family member deleted successfully'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }