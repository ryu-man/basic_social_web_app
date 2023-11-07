<script lang="ts">
	import { Appbar, UploadMediaModal } from '$lib/views';
	import { Modal, Post } from '$lib/components';
	import { Plus } from 'lucide-svelte';
	import { readPosts } from '$lib/models';
	import { onMount } from 'svelte';
	import { getAppContext, getPostContext } from '$lib/context';
	import { goto } from '$app/navigation';

	const { dynamo, s3 } = getAppContext();
	const context = getPostContext();

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

	function onPostClickedHandler(post: Record<string, any>) {
		return () => {
			context.post = post;
			goto('/post');
		};
	}
</script>

<Appbar />

<div class="posts px-4 flex flex-col gap-2">
	{#each posts as post}
		<Post {post} on:click={onPostClickedHandler(post)} />
	{/each}
</div>

<UploadMediaModal bind:open={openUploadMedialModal} />

<button
	class="fixed bottom-4 right-4 bg-gray-400 p-2 rounded-full text-gray-50 z-10 hover:brightness-95 active:brightness-90"
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

	.pdf-preview {
		object-fit: contain;
		object-position: 50% 0;
	}
</style>
