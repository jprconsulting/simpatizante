import { AreaAdscripcion } from "./area-adscripcion"

export interface ProgramaSocial {
    id: number;
    nombre: string;
    descripcion: string;
    color: string;
    estatus: boolean;
    acronimo: string;
    areaAdscripcion: AreaAdscripcion;
}
export interface ProgramaSocialEstadistica extends ProgramaSocial  {
    totalBeneficiarios: number;
    porcentaje: number;  
}