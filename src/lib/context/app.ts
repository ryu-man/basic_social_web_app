import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { S3Client } from '@aws-sdk/client-s3';
import { getContext, setContext } from 'svelte';

const APP_CONTEXT_KEY = 'app_context_key';

export type AppContext = {
	dynamo: DynamoDBClient;
	s3: S3Client;
};

export function getAppContext() {
	return getContext(APP_CONTEXT_KEY) as AppContext;
}

type AppContextInputs = AppContext & object;

export function setAppContext({ dynamo, s3 }: AppContextInputs) {
	return setContext(APP_CONTEXT_KEY, {
		dynamo,
		s3
	}) as AppContext;
}
