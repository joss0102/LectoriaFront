export interface Books {
    id: number;
    titulo: string;
    autor: string;
    generos: string[];
    paginasTotales: number;
    paginasLeidas: number;
    progreso: number;
    sinopsis: string;

    estado: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    anotaciones: string[];
    frases: string[];
    saga: string;
    registroLectura: ReadingRecord[];
    descripcionPersonal: string;
}

export interface ReadingRecord {
    id: number;
    fecha: Date;
    paginasLeidas: number;
    tiempo?: number;
}

export interface ReadingProgress {
    id: number;
    book_id: number;
    user_id: number;
    pages_read: number;
    reading_date: string;
    book_title?: string;
    user_nickname?: string;
}

export interface BookDetails {
    book_id: number;
    book_title: string;
    authors: string;
    genres: string;
    pages: number;
    synopsis: string;
    pages_read: number;
    reading_status: string;
    date_start: string | null;
    date_ending: string | null;
    custom_description: string | null;
    notes: string | null;
    phrases: string | null;
    saga_name: string | null;
    cover_url: string | null;
}