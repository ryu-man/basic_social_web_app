<script>
	import { initializeDynamo, initializeS3 } from '$lib/services';
	import { setAppContext } from '$lib/context';
	import './app.css';
	import { onMount } from 'svelte';
	import { ListTablesCommand } from '@aws-sdk/client-dynamodb';

	// initialize Dynamo client
	const dynamo = initializeDynamo();

	// initialize S3 client
	const s3 = initializeS3();

	// share clients within the context
	setAppContext({ dynamo, s3 });

	onMount(() => {
		const command = new ListTablesCommand({});
		dynamo.send(command).then((res) => {
			console.log(res.TableNames);
		});
	});
</script>

<div class="app-root w-full h-full flex flex-col relative">
	<slot />
</div>

<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.min.js"></script>
</svelte:head>
