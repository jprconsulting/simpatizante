import { Candidato } from "./candidato";
import { Operador } from "./operador";
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
    candidato: Candidato;
    operador: Operador;
}
