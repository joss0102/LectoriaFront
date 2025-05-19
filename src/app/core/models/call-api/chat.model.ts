export interface ChatData {
  user_profile: UserProfile;
  reading_stats: ReadingStats;
  user_books: UserBook[];
  reading_goals: ReadingGoals;
  reading_progress: ReadingProgress[];
}

export interface UserProfile {
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

export interface ReadingStats {
  average_rating: string;
  avg_pages_per_day: string;
  avg_reading_days_per_book: string;
  completed_books: string;
  dropped_books: string;
  favorite_author: string;
  favorite_genre: string;
  on_hold_books: string;
  planned_books: string;
  reading_books: string;
  total_books: number;
  total_pages_all_books: string;
  total_pages_read_completed: string;
  total_pages_read_sessions: string;
  user_full_name: string;
  user_id: number;
  user_nickname: string;
}

export interface ReadingGoals {
  yearly: number;
  monthly: number;
  daily_pages: number;
  completed_books_this_year: number;
  completed_books_this_month: number;
}

export interface ReadingProgress {
  id: number;
  date: string;
  pages: number;
  book_id: number;
  book_title: string;
  authors: string;
  total_pages: number;
  cumulative_pages: number;
  cumulative_percentage: number;
}

export interface UserBook {
  id_book: number;
  title: string;
  status: string;
  date_added: string;
  date_start?: string;
  date_ending?: string;
  pages_read: string;
  progress_percentage: string;
  authors?: string;
  genres?: string;
  sagas?: string;
  rating?: number;
  review?: string;
  total_pages: number;
}

export interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'system' | 'assistant';
  timestamp: string;
}

export interface DailyReadingStats {
  reading_date: string;
  pages_read: number;
  books_read: number;
  book_titles: string;
}