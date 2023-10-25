import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import {
	PUBLIC_AWS_ACCESS_KEY_ID,
	PUBLIC_AWS_REGION,
	PUBLIC_AWS_SECRET_ACCESS_KEY
} from '$env/static/public';

const configuration: S3ClientConfig = {
	region: PUBLIC_AWS_REGION,
	credentials: {
		accessKeyId: PUBLIC_AWS_ACCESS_KEY_ID,
		secretAccessKey: PUBLIC_AWS_SECRET_ACCESS_KEY
	}
};

let s3Client: S3Client | undefined = undefined;

export function initializeS3() {
	if (s3Client) return s3Client;

	s3Client = new S3Client(configuration);

	return s3Client;
}
