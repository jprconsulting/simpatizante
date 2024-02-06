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
    candidatoId: number;
    operadorId: number;
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