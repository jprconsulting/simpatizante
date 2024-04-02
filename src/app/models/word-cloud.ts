import { Candidato } from './candidato';
import { Seccion } from './seccion';

export interface WordCloud {
  name: string;
  weight: number;
}

export interface GeneralWordCloud {
  generalWordCloud: WordCloud[];
  wordCloudPorCandidatos: CandidatoWordCloud[];
  wordCloudPorMunicipios: MunicipiotoWordCloud[];
}

export interface CandidatoWordCloud extends Candidato {
  wordCloud: WordCloud[];
}

export interface MunicipiotoWordCloud extends Seccion {
  wordCloud: WordCloud[];
}
