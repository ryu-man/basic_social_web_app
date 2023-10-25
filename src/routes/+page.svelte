<script lang="ts">
	import { Appbar, UploadMediaModal } from '$lib/views';
	import { Modal } from '$lib/components';
	import { Plus } from 'lucide-svelte';
	import { readPosts } from '$lib/models';
	import { onMount } from 'svelte';
	import { getAppContext } from '$lib/context';

	const { dynamo, s3 } = getAppContext();

	let openUploadMedialModal = false;
	let posts = [];

	function onUploadNewVideo() {
		openUploadMedialModal = true;
	}

	onMount(() => {
		readPosts(dynamo).then((res) => {
			posts = res.Items;
		});
	});
</script>

<Appbar />

<div class="posts px-4 flex flex-col gap-2">
	{#each posts as post}
		{@const url = post?.url?.S ?? ''}
		{@const type = post?.type?.S}

		<div class="post pb-4 overflow-hidden border rounded-lg flex flex-col gap-4">
			{#if type.includes('video')}
				<!-- content here -->
				<video class="w-full" src={url} alt="" controls />
			{:else if type.includes('image')}
				<img class="w-full" src={url} alt="" />
			{:else}
				<object
					class="w-full"
					type="application/pdf"
					data={url + '#toolbar=0'}
					width="100%"
					height="144px"
				/>
			{/if}
			<div class="px-4">
				<p class="text-base">
					{post.description.S}
				</p>
			</div>
		</div>
	{/each}
</div>

<UploadMediaModal bind:open={openUploadMedialModal} />

<button
	class="absolute bottom-4 right-4 bg-gray-400 p-2 rounded-full text-gray-50 z-10 hover:brightness-95 active:brightness-90"
	on:click={onUploadNewVideo}
>
	<Plus />
</button>

<style lang="postcss">
	img,
	video,
	object {
		@apply rounded-lg rounded-b-none;

		height: 50vw;
		object-fit: cover;
	}
</style>
