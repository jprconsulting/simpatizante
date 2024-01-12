import { Cargo } from "./cargo";

export interface Candidatos {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    sexo: number;
    sobrenombre: string;
    cargo: Cargo;
    estatus: boolean;
    imagenBase64foto: string;
    imagenBase64emblema: string;
}

