declare module 'react-text-mask' {
	import * as React from 'react';

	interface MaskedInputProps
		extends React.InputHTMLAttributes<HTMLInputElement> {
		mask: (string | RegExp)[];
		guide?: boolean;
		placeholderChar?: string;
		showMask?: boolean;
		render?: (
			ref: (inputElement: HTMLElement) => void,
			props: any
		) => JSX.Element;
	}

	const MaskedInput: React.FC<MaskedInputProps>;

	export default MaskedInput;
}
