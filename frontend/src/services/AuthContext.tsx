import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  LoginResponse
} from '../utils/authService';
import { 
  clearAuthTokens, 
  isAuthenticated,
  getRecentLoginActivities 
} from '../utils/authService';

/**
 * Interface defining the structure of a user profile
 * Used throughout the application for user data management
 */
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  theme: 'light' | 'dark';
  emailVerified: boolean;
  username?: string;
  fullName?: string;
}

/**
 * Interface defining the authentication context API
 * Provides authentication state and methods to child components
 */
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, username?: string, userData?: Partial<UserProfile>) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
  toggleTheme: () => void;
  verifyEmail: (email: string) => void;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  loginActivities: any[];
  clearLoginActivities: () => void;
}

// Create authentication context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Helper function to apply theme to the document
 * Adds/removes 'dark' class from html element based on theme
 */
const applyThemeToDocument = (theme: 'light' | 'dark') => {
  const htmlElement = document.documentElement;
  
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
  
  // Also set data-theme attribute for additional CSS targeting if needed
  htmlElement.setAttribute('data-theme', theme);
};

/**
 * AuthProvider component - Provides authentication context to the application
 * Manages user authentication state and provides authentication methods
 * @param children - Child components that will consume the auth context
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State to hold current authenticated user, null if not authenticated
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginActivities, setLoginActivities] = useState<any[]>([]);

  /**
   * Apply theme effect - Updates HTML body when theme changes
   */
  useEffect(() => {
    if (user?.theme) {
      applyThemeToDocument(user.theme);
      
      // Persist theme preference to localStorage
      localStorage.setItem('user-theme', user.theme);
    }
  }, [user?.theme]);

  /**
   * Initialize user data from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const savedUser = localStorage.getItem('user-data');
        const savedTheme = localStorage.getItem('user-theme') as 'light' | 'dark';
        
        // Check if user has a valid token
        const authenticated = isAuthenticated();
        
        if (savedUser && authenticated) {
          try {
            const userData = JSON.parse(savedUser);
            setUser({
              ...userData,
              theme: savedTheme || userData.theme || 'light'
            });
          } catch (error) {
            console.error('Failed to parse saved user data:', error);
            localStorage.removeItem('user-data');
            clearAuthTokens();
          }
        } else if (!authenticated) {
          // Clear user data if not authenticated
          setUser(null);
          localStorage.removeItem('user-data');
        }
        
        // Load login activities
        const activities = getRecentLoginActivities();
        setLoginActivities(activities);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Persist user data to localStorage when it changes
   */
  useEffect(() => {
    if (user) {
      localStorage.setItem('user-data', JSON.stringify(user));
    } else {
      localStorage.removeItem('user-data');
    }
  }, [user]);

  /**
   * Login function - Authenticates a user and sets user profile
   * @param email - User's email address for authentication
   * @param username - User's username (optional)
   * @param userData - Additional user data (from API response)
   */
  const login = async (
    email: string, 
    username?: string, 
    userData?: Partial<UserProfile>
  ): Promise<LoginResponse> => {
    try {
      // Extract username from email if not provided
      const userName = username || email.split('@')[0];
      
      // Capitalize first letter for display name
      const displayName = userName.charAt(0).toUpperCase() + userName.slice(1) || "User";
      
      // Generate avatar using DiceBear API with email as seed
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${email}`;
      
      // Get saved theme or default to light
      const savedTheme = localStorage.getItem('user-theme') as 'light' | 'dark' || 'light';
      
      // Set user state with profile information
      const newUser: UserProfile = {
        id: userData?.id || `user-${Date.now()}`,
        name: userData?.fullName || displayName,
        email: email,
        avatar: userData?.avatar || avatar,
        theme: savedTheme,
        emailVerified: userData?.emailVerified || false,
        username: userName,
        fullName: userData?.fullName || displayName
      };
      
      setUser(newUser);
      
      // Return success response
      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username || '',
          fullName: newUser.fullName || newUser.name,
          emailVerified: newUser.emailVerified,
          avatar: newUser.avatar
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Failed to complete login process'
      };
    }
  };

  /**
   * Logout function - Clears user authentication state
   */
  const logout = async (): Promise<void> => {
    try {
      // Clear tokens
      clearAuthTokens();
      
      // Clear user state
      setUser(null);
      
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Update user function - Partially updates user profile data
   * Allows updating specific user properties without replacing entire object
   * Automatically applies theme changes to the HTML document
   * @param data - Partial user profile data to update
   */
  const updateUser = (data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      
      const newUser = { ...prev, ...data };
      
      // Apply theme change to HTML document if theme is being updated
      if (data.theme) {
        applyThemeToDocument(data.theme);
        
        // Persist theme preference to localStorage
        localStorage.setItem('user-theme', data.theme);
      }
      
      return newUser;
    });
  };

  /**
   * Toggle theme function - Switches between light and dark themes
   * Convenience method for toggling theme without directly calling updateUser
   */
  const toggleTheme = () => {
    if (user) {
      const newTheme = user.theme === 'light' ? 'dark' : 'light';
      updateUser({ theme: newTheme });
    }
  };

  /**
   * Verify email function - Marks user's email as verified
   * @param email - Email address to verify
   */
  const verifyEmail = (email: string) => {
    if (user && user.email === email) {
      updateUser({ emailVerified: true });
      console.log(`Email verified for: ${email}`);
    }
  };

  /**
   * Resend verification email function
   * Simulates sending a verification email
   * @param email - Email address to resend verification to
   * @returns Promise indicating success
   */
  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Verification email resent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      return false;
    }
  };

  /**
   * Clear login activities
   */
  const clearLoginActivities = () => {
    localStorage.removeItem('login_activities');
    setLoginActivities([]);
  };

  // Context value containing user state and authentication methods
  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    toggleTheme,
    verifyEmail,
    resendVerificationEmail,
    loginActivities,
    clearLoginActivities
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * Provides type-safe access to auth state and methods
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType - Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};