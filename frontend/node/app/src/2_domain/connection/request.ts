export interface Request {
  path: string;
  method?: string;
  token: string;
  headers: Record<string, string | number | boolean>;
  data?: string | Record<string, string | number | boolean>;
}
