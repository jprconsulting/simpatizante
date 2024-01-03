export interface AppUser {
    email: string;
    password: string;
}

export interface AppUserAuth {
    usuarioId: number;
    nombreCompleto: string;
    email: string;
    rolId: number;
    rol: string;
    isAuthenticated: boolean;
    token: string;
    claims: Array<Claim>;
}

export interface Claim {
    id: number;
    claimType: string;
    claimValue: boolean;
    rolId: number;
}