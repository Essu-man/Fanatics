// Authentication utilities for role-based access control
// NOTE: This is a demo implementation using localStorage
// For production, replace with Firebase Auth, Auth0, or similar

export type UserRole = "admin" | "customer" | "guest";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const STORAGE_KEY = "cediman:auth";
const DEMO_ADMIN_EMAIL = "admin@cediman.com";
const DEMO_ADMIN_PASSWORD = "admin123";

export class AuthService {
  static getAuthState(): AuthState {
    if (typeof window === "undefined") {
      return { user: null, isAuthenticated: false, isAdmin: false };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { user: null, isAuthenticated: false, isAdmin: false };
      }

      const user: User = JSON.parse(stored);
      return {
        user,
        isAuthenticated: true,
        isAdmin: user.role === "admin",
      };
    } catch (error) {
      console.error("Error reading auth state:", error);
      return { user: null, isAuthenticated: false, isAdmin: false };
    }
  }

  static login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    // Demo admin login
    if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      const adminUser: User = {
        id: "admin-1",
        email: DEMO_ADMIN_EMAIL,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // Demo customer login (any other email/password)
    if (email && password && password.length >= 6) {
      const customerUser: User = {
        id: `user-${Date.now()}`,
        email,
        firstName: email.split("@")[0],
        lastName: "Customer",
        role: "customer",
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customerUser));
      return { success: true, user: customerUser };
    }

    return { success: false, error: "Invalid credentials" };
  }

  static signup(email: string, password: string, firstName: string, lastName: string): { success: boolean; user?: User; error?: string } {
    if (!email || !password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static updateUser(updates: Partial<User>): User | null {
    const { user } = this.getAuthState();
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  static requireAuth(): User | null {
    const { user, isAuthenticated } = this.getAuthState();
    return isAuthenticated ? user : null;
  }

  static requireAdmin(): User | null {
    const { user, isAdmin } = this.getAuthState();
    return isAdmin ? user : null;
  }
}
