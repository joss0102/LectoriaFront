export interface Book {
    book_id: number;
    book_title: string;
    book_pages: number;
    synopsis?: string;
    authors?: string;
    genres?: string;
    sagas?: string;
}

export interface UserBook extends Book {
    reading_status: string;
    date_added: string;
    date_start?: string;
    date_ending?: string;
    custom_description?: string;
    pages_read?: number;
    progress_percentage?: number;
}

export interface BookResponse {
    data: Book[];
    pagination: PaginationInfo;
}

export interface UserBookResponse {
    data: UserBook[];
    pagination: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

export interface BookRequest {
    title: string;
    pages: number;
    synopsis?: string;
    custom_description?: string;
    author_name?: string;
    author_last_name1?: string;
    author_last_name2?: string;
    genre1?: string;
    genre2?: string;
    genre3?: string;
    genre4?: string;
    genre5?: string;
    saga_name?: string;
    user_nickname: string;
    status?: string;
    date_added?: string;
    date_start?: string;
    date_ending?: string;
    review?: string;
    rating?: number;
    phrases?: string;
    notes?: string;
}

export interface BookUpdateRequest {
    title?: string;
    pages?: number;
    synopsis?: string;
    author_name?: string;
    author_last_name1?: string;
    author_last_name2?: string;
    genre1?: string;
    genre2?: string;
    genre3?: string;
    genre4?: string;
    genre5?: string;
    saga_name?: string;
}

export interface UserBookUpdateRequest {
    status?: string;
    date_start?: string;
    date_ending?: string;
    custom_description?: string;
    review?: string;
    rating?: number;
    phrases?: string;
    notes?: string;
}