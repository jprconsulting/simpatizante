import { Cargo } from "./cargo";
import { Genero } from "./genero";

export interface Candidato {
    id: number;
    nombreCompleto: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    strFechaNacimiento: string;
    genero: Genero;
    sobrenombre: string;
    cargo: Cargo;
    estatus: boolean;
    imagenBase64: string;
    emblemaBase64: string;
    foto: string;
    emblema: string;
    edad: string;
}

