/* eslint-disable prettier/prettier */
interface PeopleQuery {
  first_name?: string;
  last_name?: string;
  username?: string;
  nationality?: string;
  sortBy?: string; // e.g. 'created_at' or 'first_name'
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export type { PeopleQuery };