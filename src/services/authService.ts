
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  password: string;
  createdAt: string;
  isOnline: boolean;
}

export interface AuthState {
  currentUser: User | null;
  users: User[];
  recentLogins: string[];
}

class AuthService {
  private static instance: AuthService;
  private readonly STORAGE_KEY = 'whatsapp_auth';
  private readonly RECENT_LOGINS_KEY = 'whatsapp_recent_logins';

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getAuthState(): AuthState {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { currentUser: null, users: [], recentLogins: [] };
  }

  private saveAuthState(state: AuthState): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private hashPassword(password: string): string {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  signup(userData: { name: string; email: string; phone: string; password: string }): { success: boolean; message: string; user?: User } {
    const state = this.getAuthState();
    
    // Check if user already exists
    if (state.users.find(u => u.email === userData.email)) {
      return { success: false, message: 'User with this email already exists' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: this.hashPassword(userData.password),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      createdAt: new Date().toISOString(),
      isOnline: false
    };

    state.users.push(newUser);
    this.saveAuthState(state);

    return { success: true, message: 'Account created successfully', user: newUser };
  }

  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const state = this.getAuthState();
    const hashedPassword = this.hashPassword(password);
    
    const user = state.users.find(u => u.email === email && u.password === hashedPassword);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Update user online status
    user.isOnline = true;
    state.currentUser = user;
    
    // Add to recent logins
    const recentLogins = state.recentLogins.filter(id => id !== user.id);
    recentLogins.unshift(user.id);
    state.recentLogins = recentLogins.slice(0, 3); // Keep only 3 recent logins

    this.saveAuthState(state);
    return { success: true, message: 'Login successful', user };
  }

  logout(): void {
    const state = this.getAuthState();
    if (state.currentUser) {
      const user = state.users.find(u => u.id === state.currentUser!.id);
      if (user) {
        user.isOnline = false;
      }
      state.currentUser = null;
      this.saveAuthState(state);
    }
  }

  getCurrentUser(): User | null {
    return this.getAuthState().currentUser;
  }

  getRecentUsers(): User[] {
    const state = this.getAuthState();
    return state.recentLogins
      .map(id => state.users.find(u => u.id === id))
      .filter(Boolean) as User[];
  }

  getAllUsers(): User[] {
    return this.getAuthState().users;
  }

  updateUserStatus(userId: string, isOnline: boolean): void {
    const state = this.getAuthState();
    const user = state.users.find(u => u.id === userId);
    if (user) {
      user.isOnline = isOnline;
      this.saveAuthState(state);
    }
  }
}

export default AuthService.getInstance();
