import { Municipio } from "./municipio";
import { Candidato } from "./candidato";

export interface Propaganda {
    id: number;
    folio: string;
    dimensiones: string;
    comentarios: string;
    latitud: number;
    longitud: number;
    municipio: Municipio;
    imagenBase64: string;
    ubicacion: string;
    foto: string;
    candidato: Candidato;
  }
