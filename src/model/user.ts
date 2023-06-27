export interface User {
  username: string;
  password: string;
}

export interface AuhthenticatedUser {
  username: string;
  password: string;
  name: string;
  emailAddress: string;
}

export interface RegisterUser {
  username: string;
  password: string;
  name: string;
  emailAddress: string;
}

export interface AuthResponse {
  token: string;
}
