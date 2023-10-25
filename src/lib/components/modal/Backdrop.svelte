<script lang="ts">
    export let blurify = false
</script>

<div class="backdrop" class:blurify />

<style lang="postcss">
	.backdrop {
		@apply fixed top-0 left-0 w-full h-full z-20 bg-black bg-opacity-5;
	}

    .blurify {
        backdrop-filter: blur(4px);
    }
</style>
