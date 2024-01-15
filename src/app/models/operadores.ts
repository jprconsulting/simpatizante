import { Seccion } from "./seccion";

export interface Operadores {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: Date;
    sexo: number;
    estatus: boolean;
    seccion: Seccion;
}
