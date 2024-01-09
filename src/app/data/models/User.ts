export interface User {
  id: string;
  fullName: string;
  roles: string[];
  company?: string;
  team?: string;
  username: string;
}
