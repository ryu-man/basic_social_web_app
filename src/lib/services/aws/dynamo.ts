import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import {
	PUBLIC_AWS_ACCESS_KEY_ID,
	PUBLIC_AWS_REGION,
	PUBLIC_AWS_SECRET_ACCESS_KEY
} from '$env/static/public';

let dynamoClient: DynamoDBClient | undefined = undefined;

const configuration: DynamoDBClientConfig = {
	region: PUBLIC_AWS_REGION,
	credentials: {
		accessKeyId: PUBLIC_AWS_ACCESS_KEY_ID,
		secretAccessKey: PUBLIC_AWS_SECRET_ACCESS_KEY
	}
};

export function initializeDynamo() {
	if (dynamoClient) return dynamoClient;

	dynamoClient = new DynamoDBClient(configuration);

	return dynamoClient;
}
