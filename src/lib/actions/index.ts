
export type ClickOutsideCallback = (ev: Event) => void;

export function clickOutside(node: HTMLElement, callback: ClickOutsideCallback) {
	let clicked = false;

	function handler(e: Event) {
		if (!clicked) {
			clicked = true;
			return;
		}

		const target = e.target as HTMLElement;

		if (!node.contains(target)) {
			callback(e);
		}
	}

	document.addEventListener('click', handler);

	return {
		destroy() {
			document.removeEventListener('click', handler);
		}
	};
}
