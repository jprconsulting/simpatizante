import { Seccion } from "./seccion";

export interface Operadores {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    strFechaNacimiento: string;
    fechaNacimiento: string;
    strfechanacimineto: string;
    sexo: number;
    estatus: boolean;
    seccionesIds: Seccion;
    secciones: string;
}
