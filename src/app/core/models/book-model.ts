// Modelo de libro extendido con propiedades de seguimiento de lectura
export interface Book {
    // Propiedades básicas
    autor: string;
    saga: string;
    titulo: string;
    sinopsis: string;
    imagen: string;
    
    // Propiedades de seguimiento de lectura (opcionales)
    paginasTotales?: number;
    fechaInicio?: Date | null;
    fechaFin?: Date | null;
    paginasLeidas?: number;
    progreso?: number; // Porcentaje de progreso (0-100)
    estado?: 'no-iniciado' | 'en-progreso' | 'finalizado' | 'abandonado';
    registroLectura?: ReadingRecord[]; // Registro detallado de lectura diaria
    
    // Propiedades adicionales que podrías necesitar
    valoracion?: number; // Valoración del 1 al 5
    anotaciones?: string[]; // Anotaciones o notas personales
    etiquetas?: string[]; // Etiquetas o categorías personalizadas
}

  // Modelo para el registro diario de lectura
export interface ReadingRecord {
    fecha: Date;
    paginasLeidas: number;
    tiempo?: number; // Tiempo de lectura en minutos
    notas?: string;
}