import {
	type DynamoDBClient,
	PutItemCommand,
	DeleteItemCommand,
	UpdateItemCommand,
	ScanCommand,
	AttributeValue
} from '@aws-sdk/client-dynamodb';
import { type S3Client } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Upload, type Progress } from '@aws-sdk/lib-storage';
import { nanoid } from 'nanoid';

export {};

export function createPost(client: DynamoDBClient, item: Record<string, AttributeValue>) {
	const command = new PutItemCommand({
		TableName: 'posts',
		Item: {
			...item,
			id: {
				S: nanoid()
			},
			createdAt: {
				S: new Date().toISOString()
			}
		}
	});

	const docClient = DynamoDBDocumentClient.from(client);
	return docClient.send(command);
}

export function deletePost(client: DynamoDBClient, id: string) {
	const command = new DeleteItemCommand({
		TableName: 'posts',
		Key: {
			id: {
				S: id
			}
		}
	});

	const docClient = DynamoDBDocumentClient.from(client);
	return docClient.send(command);
}

export function updatePost(client: DynamoDBClient, id: string, item: Record<string, unknown>) {
	const command = new UpdateItemCommand({
		TableName: 'posts',
		Key: {
			id: {
				S: id
			}
		},
		AttributeUpdates: item
	});

	const docClient = DynamoDBDocumentClient.from(client);
	return docClient.send(command);
}

export function readPost(client: DynamoDBClient, id: string) {
	const command = new ScanCommand({
		TableName: 'posts',
		ScanFilter: {
			id: {
				ComparisonOperator: 'EQ',
				AttributeValueList: [
					{
						S: id
					}
				]
			}
		}
	});

	const docClient = DynamoDBDocumentClient.from(client);
	return docClient.send(command);
}

export function readPosts(client: DynamoDBClient) {
	const command = new ScanCommand({ TableName: 'posts' });

	const docClient = DynamoDBDocumentClient.from(client);
	return docClient.send(command);
}

export type ProgressCallback = (value: Progress) => void;

export async function uploadPostFile(
	client: S3Client,
	file: File,
	onProgress: ProgressCallback = (_) => {}
) {
	const bucketName = 'posts-media-1';
	const fileName = crypto.randomUUID() + file.name.slice(file.name.lastIndexOf('.'));
	const partSize = 1024 * 1024 * 10;

	return new Upload({
		client,
		partSize,
		queueSize: 4,
		params: {
			Bucket: bucketName,
			ACL: 'public-read',
			Key: fileName,
			Body: file
		}
	})
		.on('httpUploadProgress', onProgress)
		.done();
}
export async function uploadBlob(
	client: S3Client,
	file: Blob,
	onProgress: ProgressCallback = (_) => {}
) {
	const bucketName = 'posts-media-1';
	const fileName = crypto.randomUUID() + '.' + file.type.slice(file.type.lastIndexOf('/') + 1);
	const partSize = 1024 * 1024 * 10;

	return new Upload({
		client,
		partSize,
		queueSize: 4,
		params: {
			Bucket: bucketName,
			ACL: 'public-read',
			Key: fileName,
			Body: file
		}
	})
		.on('httpUploadProgress', onProgress)
		.done();
}
