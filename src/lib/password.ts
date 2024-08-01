import bcrypt from 'bcryptjs';

// Function to hash the password
export const hashPassword = async (password: string): Promise<string> => {
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt);
};

// Function to verify the password against the hashed password
export async function verifyPassword(
	password: string,
	hashedPassword: string
): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}
