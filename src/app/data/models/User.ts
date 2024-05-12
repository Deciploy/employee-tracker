import { Company } from "./Company";

export interface User {
  id: string;
  fullName: string;
  roles: string[];
  company?: Company;
  team?: string;
  username: string;
}
