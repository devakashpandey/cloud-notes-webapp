export interface Note {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  tags?: string[];
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;

}

export interface PaginationData {
  totalNotes: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


export interface GetNotesParams {
  search?: string;
  tag?: string;
  isPinned?: boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
