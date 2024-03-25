import { Candidato } from './candidato';

export interface WordCloud {
  name: string;
  weight: number;
}

export interface GeneralWordCloud {
  generalWordCloud: WordCloud[];
  wordCloudPorCandidatos: CandidatoWordCloud[];
}

export interface CandidatoWordCloud extends Candidato {
  wordCloud: WordCloud[];
}
