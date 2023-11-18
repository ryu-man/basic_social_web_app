<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { getPostContext } from '$lib/context';
	import { goto } from '$app/navigation';

	const context = getPostContext();

	$: post = context?.post;
	$: url = post?.url?.S ?? '';
	$: type = post?.type?.S;

	function onBackHandler() {
		goto('/');
	}
</script>

<div class="flex px-4 py-4 absolute top-0 z-10 text-white">
	<button class="bg-black bg-opacity-20 rounded-full p-0.5" on:click={onBackHandler}>
		<ArrowLeft />
	</button>
</div>

{#if post}
	<!-- content here -->
	<div class="post-page" on:click>
		<div class="relative z-0 flex-1">
			{#if type.includes('video')}
				<!-- content here -->
				<video class="w-full" src={url} alt="" controls={true} autoplay />
			{:else if type.includes('image')}
				<img class="w-full" src={url} alt="" />
			{:else}
				<img class="w-full" src={post?.preview?.S ?? ''} />
			{/if}
		</div>

		<div class="description">
			<p class="text-base">
				{post?.description?.S ?? ''}
			</p>
		</div>
	</div>
{/if}

<style lang="postcss">
	.post-page {
		@apply overflow-hidden border rounded-lg flex flex-col relative w-full h-full flex-1 p-0 m-0;
		height: 100vh;
	}
	.description {
		@apply text-black bg-white w-full;

		padding: 4vw;
	}

	video,
	img {
		@apply bg-white flex-1 absolute top-0 left-0 w-full h-full;
		object-fit: contain;
		height: 100%;
	}
</style>
