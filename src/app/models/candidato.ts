import { Cargo } from "./cargo";

export interface Candidato {
    id: number;
    nombreCompleto: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    strFechaNacimiento: string;
    sexo: number;
    sobrenombre: string;
    cargo: Cargo;
    estatus: boolean;
    imagenBase64: string;
    emblemaBase64: string;
    foto: string;
    emblema: string;
}

