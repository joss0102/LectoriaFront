export interface ReadingProgress {
    progress_id: number;
    user_id: number;
    user_nickname: string;
    book_id: number;
    book_title: string;
    total_pages: number;
    reading_date: string;
    pages_read_session: number;
    cumulative_pages_read: number;
    cumulative_progress_percentage: number;
    current_reading_status: string;
}

export interface Review {
    review_id: number;
    book_id: number;
    book_title: string;
    user_id: number;
    user_nickname: string;
    user_full_name: string;
    review_text: string;
    rating: number;
    review_date: string;
    authors?: string;
    genres?: string;
}

export interface Phrase {
    id: number;
    text: string;
    date_added: string;
    user_nickname: string;
    book_id: number;
    book_title: string;
}

export interface Note {
    id: number;
    text: string;
    date_created: string;
    date_modified?: string;
    user_nickname: string;
    book_id: number;
    book_title: string;
}

export interface ReadingProgressResponse {
    data: ReadingProgress[];
    pagination: PaginationInfo;
}

export interface ReviewResponse {
    data: Review[];
    pagination: PaginationInfo;
}

export interface PhraseResponse {
    data: Phrase[];
    pagination: PaginationInfo;
}

export interface NoteResponse {
    data: Note[];
    pagination: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

export interface ReadingProgressRequest {
    nickname: string;
    book_title: string;
    pages_read_list: string;
    dates_list: string;
}

export interface ReadingProgressUpdateRequest {
    pages?: number;
    date?: string;
}

export interface ReviewRequest {
    user_nickname: string;
    book_title: string;
    text: string;
    rating: number;
}

export interface ReviewUpdateRequest {
    text?: string;
    rating?: number;
}

export interface PhraseRequest {
    user_nickname: string;
    book_title: string;
    text: string;
}

export interface NoteRequest {
    user_nickname: string;
    book_title: string;
    text: string;
}