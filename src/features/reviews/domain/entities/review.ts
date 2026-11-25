/** Reseña visible que el backend devuelve para un elemento multimedia. */
export interface Review {
  id: string;
  title: string | null;
  content: string;
  isHidden: boolean;
  hiddenReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: number; username: string };
}

export interface ReviewPage {
  data: Review[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ReviewQuery {
  page: number;
  limit: number;
}

export interface CreateReviewDraft {
  title?: string;
  content: string;
}
