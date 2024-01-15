import { Estado } from "./estados";
import { Municipio } from "./municipio"
import { ProgramaSocial } from "./programa-social";
import { Seccion } from "./seccion";

export interface Simpatizante {
    id: number;
    nombres: string;
    nombreCompleto: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    strFechaNacimiento: string;
    domicilio: string;
    sexo: number;
    curp: string;
    latitud: number;
    longitud: number;
    estatus: boolean;
    programaSocial: ProgramaSocial;
    municipio: Municipio;
    seccion: Seccion;
    estado: Estado;

}

export interface TotalBeneficiariosMunicipio extends Municipio {
    totalBeneficiarios: number;
    color: string;
    descripcionIndicador: string;
}

export interface DataMapa {
    id: string;
    color: string;
    total: number;
}
