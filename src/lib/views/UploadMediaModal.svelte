<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Upload } from 'lucide-svelte';
	import { Modal } from '$lib/components';
	import { getAppContext } from '$lib/context';
	import { createPost, uploadBlob, uploadPostFile } from '$lib/models';
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
	let pdfPreviewBlob: Blob | null;

	onMount(() => {});

	function pdf(node: HTMLCanvasElement, file: File) {
		render(node, file);

		return {
			update(file: File) {
				render(node, file);
			}
		};
	}

	function render(node: HTMLCanvasElement, file: File) {
		pdfjsLib.getDocument(URL.createObjectURL(file)).promise.then(async (pdf) => {
			const page = await pdf.getPage(1);

			const outputScale = window.devicePixelRatio || 1;
			const viewport = page.getViewport({ scale: 1.5 });
			node.width = viewport.width;
			node.height = viewport.height;
			// console.log('viewport::', viewport, node.clientHeight);

			// const scale = node.clientWidth / (viewport.width * 1.2);
			// const scaledViewport = page.getViewport({ scale });
			// node.style.height = scaledViewport.height + 'px';
			// console.log(scale);

			const context = node.getContext('2d');

			const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

			await tick();
			await page.render({
				canvasContext: context,
				viewport: viewport
			}).promise;

			// const imageData = context?.getImageData(0, 0, scaledViewport.width, scaledViewport.height);

			node.toBlob((blob) => {
				pdfPreviewBlob = blob;
			}, 'image/jpg');
		});
	}

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
		const uploadRes = await uploadPostFile(s3, file, (p) => {
			progress = p;
		}).catch((err) => {
			uploading = false;
		});

		if (uploadRes) {
			let additionalAttributes = {};
			if (file.type === 'application/pdf' && pdfPreviewBlob) {
				const preview = await uploadBlob(s3, pdfPreviewBlob, (p) => {
					progress = p;
				});
				console.log(preview);
				additionalAttributes = {
					preview: {
						S: preview.Location || ''
					}
				};
			}
			const res = await createPost(dynamo, {
				description: {
					S: description
				},
				url: {
					S: uploadRes.Location || ''
				},
				type: {
					S: file.type
				},
				...additionalAttributes
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

		<h1 class="py-2 font-bold text-lg">Upload new post</h1>

		<div
			class="preview cursor-pointer h-40 w-full rounded-lg overflow-hidden bg-white border"
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
					<!-- <object
						data={URL.createObjectURL(file)}
						type="application/pdf"
						width="100%"
						height="100%"
					/> -->
					<canvas class="w-full h-full max-w-ful hidden" use:pdf={file} />

					<img
						class="pdf-preview w-full h-full"
						src={pdfPreviewBlob ? URL.createObjectURL(pdfPreviewBlob) : ''}
						alt=""
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
				class="bg-gray-900 text-gray-50 p-2 rounded-full disabled:bg-gray-500"
				disabled={!file || (file.type === 'application/pdf' && !pdfPreviewBlob) || !description}
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

	img.pdf-preview {
		object-fit: contain;
		object-position: 50% 0;
	}

	.preview {
		@apply flex justify-center items-center;

		height: 40vw;
	}

	button > .uploading {
		animation: uploading;
		animation-duration: 0.6s;
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
