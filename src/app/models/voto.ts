import { Simpatizante } from "./votante";

export interface Voto {
    id: number;
    estatusVoto: string;
    imagenBase64: string;
    foto: string;
    simpatizante: Simpatizante;
}
