import { S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';

const configuration: S3ClientConfig = {
	region: 'eu-north-1',
	credentials: {
		accessKeyId: 'AKIARY7LL5ER2MI7ZELY',
		secretAccessKey: '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'
	}
};

export function initializeS3() {
	const client = new S3Client(configuration);

	return client;
}
