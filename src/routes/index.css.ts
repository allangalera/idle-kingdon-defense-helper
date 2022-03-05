import { theme } from '$lib/styles/themes/index.css';
import { style } from '@vanilla-extract/css';

export const grid = style({
	width: '100%',
	display: 'grid',
	gridTemplateColumns: '1fr',
	gap: theme.space[2],
	'@media': {
		'screen and (min-width: 768px)': {
			gridTemplateColumns: '1fr 1fr',
		},
	},
});