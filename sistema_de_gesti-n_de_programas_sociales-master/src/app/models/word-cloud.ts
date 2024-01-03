import { Municipio } from "./municipio";

export interface WordCloud {
    name: string;
    weight: number;
}

export interface GeneralWordCloud {
    generalWordCloud: WordCloud[];
    wordCloudPorMunicipios: MunicipioWordCloud[];
}

export interface MunicipioWordCloud extends Municipio {
    wordCloud: WordCloud[];
}

