<script lang="ts">
	export let post: any;

	let url = post?.url?.S ?? '';
	let type = post?.type?.S;
</script>

<div
	class="post pb-4 overflow-hidden border rounded-lg flex flex-col gap-4 cursor-pointer"
	on:click
>
	{#if type.includes('video')}
		<!-- content here -->
		<video class="w-full pointer-events-none" src={url} alt="" controls />
	{:else if type.includes('image')}
		<img class="w-full pointer-events-none" src={url} alt="" />
	{:else}
		<div class="pdf-preview text-[10rem] flex justify-center">
			<img src={post?.preview?.S ?? ''} />
		</div>
	{/if}
	<div class="px-4">
		<p class="text-base">
			{post.description.S}
		</p>
	</div>
</div>
