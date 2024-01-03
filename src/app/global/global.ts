import { PaginationInstance } from "ngx-pagination/lib/ngx-pagination.module";

export enum ResponseSwitch {
    true = 'SI',
    false = 'NO'
}

export enum LoadingStates {
    neutro = 1,
    trueLoading = 2,
    falseLoading = 3,
    errorLoading = 4
}

export const ConfigPaginator: PaginationInstance = {
    itemsPerPage: 10,
    currentPage: 1
}

export interface GenericType {
    id: number
    name: string
}

export const Generos = {
    1: 'Masculino',
    2: 'Femenino',
}



