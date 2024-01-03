import { AreaAdscripcion } from "./area-adscripcion"
import { Rol } from "./rol"

export interface Usuario {
    id: number;
    nombreCompleto: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    password: string;
    estatus: boolean;
    rol: Rol;
    areaAdscripcion: AreaAdscripcion;
}