import type { Database } from '@/shared/types/database.types';

export type AppUser = Database['public']['Tables']['users']['Row'];

export interface AuthState {
  loading: boolean;
  authUserId: string | null;
  appUser: AppUser | null;
}
