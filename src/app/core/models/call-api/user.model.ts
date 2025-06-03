export interface User {
    id: number;
    name: string;
    last_name1?: string;
    last_name2?: string;
    nickName: string;
    birthdate?: string;
    union_date: string;
    id_role: number;
    role_name: string;
}

export interface UserStats {
    user_id: number;
    user_nickname: string;
    user_full_name: string;
    total_books: number;
    completed_books: number;
    reading_books: number;
    planned_books: number;
    dropped_books: number;
    on_hold_books: number;
    total_pages_all_books: number;
    total_pages_read_completed: number;
    total_pages_read_sessions: number;
    average_rating: number;
    favorite_genre?: string;
    favorite_author?: string;
    avg_reading_days_per_book: number;
    avg_pages_per_day: number;
}

export interface UserResponse {
    data: User[];
    pagination: PaginationInfo;
}

export interface UserStatsResponse {
    user_id: number;
    user_nickname: string;
    user_full_name: string;
    total_books: number;
    completed_books: number;
    reading_books: number;
    planned_books: number;
    dropped_books: number;
    on_hold_books: number;
    total_pages_all_books: number;
    total_pages_read_completed: number;
    total_pages_read_sessions: number;
    average_rating: number;
    favorite_genre?: string;
    favorite_author?: string;
    avg_reading_days_per_book: number;
    avg_pages_per_day: number;
}

export interface PaginationInfo {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

export interface UserRequest {
    name: string;
    last_name1?: string;
    last_name2?: string;
    birthdate?: string;
    union_date?: string;
    nickname: string;
    password: string;
    role_name: string;
}

export interface UserUpdateRequest {
    name?: string;
    last_name1?: string;
    last_name2?: string;
    birthdate?: string;
    role_name?: string;
}

export interface PasswordChangeRequest {
    current_password?: string;
    new_password: string;
}

export interface UserProfileForm {
    name: string;
    last_name1: string;
    last_name2: string;
    birthdate: string;
}

export interface PasswordChangeForm {
    current_password: string;
    new_password: string;
    confirm_password: string;
}