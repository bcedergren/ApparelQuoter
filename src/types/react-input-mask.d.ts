declare module 'react-input-mask' {
	import * as React from 'react';

	interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
		mask: string;
		maskChar?: string | null;
		formatChars?: {
			[key: string]: string;
		};
		alwaysShowMask?: boolean;
		inputRef?: (ref: HTMLInputElement | null) => void;
	}

	export default class InputMask extends React.Component<Props> {}
}
