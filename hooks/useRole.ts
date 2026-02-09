import { AuthUser } from './useAuth';

export function useRole(user: AuthUser | null) {
  return {
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };
}
