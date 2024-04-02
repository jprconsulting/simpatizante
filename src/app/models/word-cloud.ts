import { Candidato } from './candidato';
import { Municipio } from './municipio';

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

export interface MunicipiotoWordCloud extends Municipio {
  wordCloud: WordCloud[];
}
