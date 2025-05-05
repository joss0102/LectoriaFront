export interface AddBookModel {
    title: string;
    pages: number;
    synopsis?: string;
    custom_description?: string;
    author_name: string;
    author_last_name1?: string;
    author_last_name2?: string;
    genre1?: string;
    genre2?: string;
    genre3?: string;
    genre4?: string;
    genre5?: string;
    saga_name?: string;
    user_nickname: string;
    status?: 'reading' | 'completed' | 'dropped' | 'on_hold' | 'plan_to_read';
    date_added?: string;
    date_start?: string;
    date_ending?: string;
    review?: string;
    rating?: number;
    phrases?: string;
    notes?: string;
}

export interface AddBookResponse {
    message: string;
    data: any;
}

export interface BookSearchResult {
    book_id: number;
    book_title: string;
    book_pages: number;
    synopsis: string;
    authors: string;
    genres: string;
    sagas: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    }
}