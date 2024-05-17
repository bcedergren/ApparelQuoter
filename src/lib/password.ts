// src/lib/password.ts

let bcrypt: typeof import('bcrypt');
if (typeof window === 'undefined') {
	bcrypt = require('bcrypt');
}

export const hashPassword = async (password: string): Promise<string> => {
	if (!bcrypt) {
		throw new Error('bcrypt is not available on the client side');
	}
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	if (!bcrypt) {
		throw new Error('bcrypt is not available on the client side');
	}
	return await bcrypt.compare(password, hashedPassword);
};
