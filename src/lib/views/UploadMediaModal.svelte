<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Upload } from 'lucide-svelte';
	import { Modal } from '$lib/components';
	import { getAppContext } from '$lib/context';
	import { createPost, uploadVideo } from '$lib/models';
	import type { Progress } from '@aws-sdk/lib-storage';

	const { dynamo, s3 } = getAppContext();

	export let open = false;

	let fileElement: HTMLInputElement;
	let canvasElement: HTMLCanvasElement;
	let file: File;
	let description = '';
	let error: Error | undefined = undefined;
	let progress: Progress | undefined = undefined;
	let uploading = false;

	onMount(() => {});

	function openFilePicker(node: HTMLInputElement) {
		node.click();
	}

	function openFilePickerHandler() {
		fileElement.click();
	}

	async function onOpenHandler() {
		// const handler = await showOpenFilePicker();
		// console.log(handler)
	}

	async function onFileChange(e: Event) {
		const currentTarget = e.currentTarget as HTMLInputElement;

		const files = currentTarget.files;
		const firstFile = files?.item(0);
		if (firstFile) {
			if (firstFile.type.includes('video')) {
				const duration = await getDuration(firstFile);
				const fiveMinutesDuration = 60 * 1; // 1 minutes in seconds

				if (duration < fiveMinutesDuration) {
					file = firstFile;
					error = undefined;
				} else {
					error = Error('The video file is too long, maximum duration is 1 minute', {
						cause: "'duration is too long'"
					});
				}

				return;
			}

			file = firstFile;
			error = undefined;
			console.log(file);
		}
	}

	async function onUploadHandler() {
		if (!file) return;
		uploading = true;
		const uploadRes = await uploadVideo(s3, file, (p) => {
			progress = p;
		}).catch((err) => {
			uploading = false;
		});

		if (uploadRes) {
			console.log(uploadRes);
			const res = await createPost(dynamo, {
				description: {
					S: description
				},
				url: {
					S: uploadRes.Location || ''
				},
				type: {
					S: file.type
				}
			}).then((res) => {
				uploading = false;
				return res;
			});
			console.log(res);

			open = false;
		}
	}

	async function getDuration(file: File) {
		const videoElement = document.createElement('video');

		return new Promise<number>((resolve, reject) => {
			videoElement.addEventListener('durationchange', (e) => {
				resolve(videoElement.duration);
			});

			videoElement.src = URL.createObjectURL(file);
		});
	}
</script>

<Modal bind:open on:open={onOpenHandler}>
	<div class="w-full h-full flex flex-col gap-4 px-4 pb-4">
		<input
			type="file"
			use:openFilePicker
			bind:this={fileElement}
			hidden
			accept="video/*, image/*, .pdf"
			on:change={onFileChange}
		/>

		<h1 class="py-2 font-bold text-lg">Upload new video</h1>

		<div
			class="preview cursor-pointer h-40 rounded-lg overflow-hidden bg-white border"
			on:click={openFilePickerHandler}
		>
			{#if file}
				{#if file.type.includes('image')}
					<!-- content here -->
					<img class="w-full h-full" src={URL.createObjectURL(file)} alt={file.name} />
				{:else if file.type.includes('video')}
					<!-- else content here -->
					<video class="w-full h-full" src={URL.createObjectURL(file)} />
				{:else}
					<object
						data={URL.createObjectURL(file)}
						type="application/pdf"
						width="100%"
						height="100%"
					/>
				{/if}
			{:else}
				<span class="text-lg font-black text-gray-400">Click here</span>
			{/if}
		</div>

		<textarea
			class="w-full px-1 py-1 outline-none text-sm rounded-lg border"
			rows="3"
			bind:value={description}
		/>

		{#if error}
			<div class="errors text-red-700">
				<span>{error.message}</span>
			</div>
		{/if}

		<div class="flex justify-between">
			<div>
				{#if progress}
					<span>{Math.trunc(progress.loaded || 0 / 1000)} KB</span>
					<span>/</span>
					<span>{Math.trunc(progress.total || 0 / 1000)} KB</span>
				{/if}
			</div>

			<button
				class="bg-gray-900 text-gray-50 p-2 rounded-full"
				disabled={!file}
				on:click={onUploadHandler}
			>
				<div class:uploading>
					<Upload size="16px" />
				</div>
			</button>
		</div>
	</div>
</Modal>

<style>
	img,
	video {
		object-fit: cover;
	}

	img {
		object-position: 100% 25%;
	}

	.preview {
		@apply flex justify-center items-center;

		height: 40vw;
	}

	button > .uploading {
		animation: uploading;
		animation-duration: .6s;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	@keyframes uploading {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>
