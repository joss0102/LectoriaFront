export interface HomeModel {
  book_id: number;
  book_title: string;
  book_pages: number;
  synopsis: string;
  authors: string;
  genres: string;
  sagas: string;
  imagen?: string;  // URL de la imagen, se agregará en el servicio
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}