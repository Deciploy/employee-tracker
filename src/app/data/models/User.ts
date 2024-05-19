import { Company } from "./Company";
import { Team } from "./Team";

export interface User {
  id: string;
  fullName: string;
  roles: string[];
  company?: Company;
  team?: Team;
  username: string;
}
