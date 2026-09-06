/**
 * Fields every persisted backend entity carries. Keep the raw snake_case
 * names the API uses — models never rename fields, they only wrap them.
 */
export type IBaseModel = {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};
