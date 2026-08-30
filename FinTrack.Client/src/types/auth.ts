export interface LoginRequest {
    email: string;
    password: string;}

export interface RegistrationRequest {
    name: string;
    email: string;
    password: string;
    baseCurrency: string;
}

export interface AuthResponse {
    accessToken: string,
    expiresAtUtc: string;
}