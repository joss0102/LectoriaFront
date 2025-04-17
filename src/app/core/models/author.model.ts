export interface Author {
    id: number;
    name: string;
    last_name1?: string;
    last_name2?: string;
    description?: string;
}

export interface AuthorBook {
    id: number;
    title: string;
    pages: number;
    synopsis?: string;
}

export interface AuthorResponse {
    data: Author[];
}

export interface AuthorBooksResponse {
    data: AuthorBook[];
}

export interface AuthorSearchResponse {
    data: Author[];
    pagination: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

export interface AuthorRequest {
    name: string;
    last_name1?: string;
    last_name2?: string;
    description?: string;
}

export interface AuthorUpdateRequest {
    name?: string;
    last_name1?: string;
    last_name2?: string;
    description?: string;
}