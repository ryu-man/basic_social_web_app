import { getContext, setContext } from 'svelte';

const POST_CONTEXT_KEY = 'post_context_key';

export type PostContext = {
	post: Record<string, unknown>;
};

export function getPostContext() {
	return getContext(POST_CONTEXT_KEY) as PostContext;
}

export function setPostContext() {
	return setContext(POST_CONTEXT_KEY, {
		post: {}
	}) as PostContext;
}
