import { Municipio } from "./municipio"
import { ProgramaSocial } from "./programa-social"

export interface Beneficiario {
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
