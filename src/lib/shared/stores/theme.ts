import { browser } from '$app/env';
import { writable } from 'svelte/store';

export const theme = writable<string>(
	browser ? window.localStorage.getItem('theme') || 'light' : 'dark'
);

theme.subscribe((value) => {
	if (browser) {
		window.localStorage.setItem('theme', value);
	}
});
