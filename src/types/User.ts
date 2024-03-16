export interface User {
	_id: string;
	companyId: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string; // Hashed password
	role: string;
}
