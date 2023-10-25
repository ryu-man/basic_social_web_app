import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';

const clients: Record<string, DynamoDBClient> = {};

const configuration: DynamoDBClientConfig = {
	region: 'eu-north-1',
	credentials: {
		accessKeyId: 'AKIARY7LL5ER2MI7ZELY',
		secretAccessKey: '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'
	}
};

export function initializeDynamo(clientName = 'default') {
	if (clients[clientName]) return clients[clientName];

	const client = new DynamoDBClient(configuration);
	clients[clientName] = client;

	return client;
}
