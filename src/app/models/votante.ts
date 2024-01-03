import { Municipio } from "./municipio"

export interface Votante {
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
    municipio: Municipio;
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
