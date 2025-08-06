// Global type definitions
import { User } from "firebase/auth";

declare module "*.ts" {
  const content: any;
  export default content;
}

declare module "*.tsx" {
  const content: any;
  export default content;
}

// Redux state types
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface RootState {
  user: UserState;
}
