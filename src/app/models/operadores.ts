import { Seccion } from "./seccion";

export interface Operadores {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: Date;
    sexo: number;
    estatus: boolean;
    seccion: Seccion;
}
