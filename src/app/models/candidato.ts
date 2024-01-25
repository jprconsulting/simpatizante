import { Cargo } from "./cargo";

export interface Candidatos {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    sexo: number;
    sobrenombre: string;
    cargo: Cargo;
    estatus: boolean;
    imagenBase64: string;
    emblemaBase64: string;
    foto: string;
    emblema: string;
}

