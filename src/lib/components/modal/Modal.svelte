<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
	import { clickOutside } from '$lib/actions';
	import Backdrop from './Backdrop.svelte';

	export let open = false;

	const dispatch = createEventDispatcher();

	function dispatchEvents(node: HTMLDivElement) {
		tick().then(() => dispatch('open'));

		return {
			destroy() {
				dispatch('close');
			}
		};
	}

	function onClickOutsideHandler() {
		open = false;
	}
</script>

{#if open}
	<div class="modal-container" use:dispatchEvents>
		<Backdrop blurify />
		<div class="modal" use:clickOutside={onClickOutsideHandler}>
			<!--  -->
			<slot />
		</div>
	</div>
{/if}

<style lang="postcss">
	.modal-container {
		@apply fixed top-0 left-0 z-20;
		width: 100vw;
		height: 100vh;
	}
	.modal {
		@apply fixed z-20 border-gray-300 border-opacity-70 border shadow-sm rounded-lg bg-gray-50 overflow-hidden;

		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		width: 60vw;
		height: auto;
		min-height: 10vh;
		max-width: 90vw;
	}
</style>
