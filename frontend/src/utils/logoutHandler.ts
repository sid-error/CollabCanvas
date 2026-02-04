// src/utils/logoutHandler.ts
/**
 * Logout Handler Utility
 * Centralized logout functionality with feedback
 */

/**
 * Clears all authentication tokens and user data from localStorage
 */
export const clearAuthTokens = (): void => {
  // Keep theme preference
  const theme = localStorage.getItem('user-theme');
  
  // Clear all auth-related items
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem('login_activities');
  localStorage.removeItem('remembered_email');
  
  // Clear session storage
  sessionStorage.clear();
  
  // Restore theme if it exists
  if (theme) {
    localStorage.setItem('user-theme', theme);
  }
  
  console.log('Auth tokens cleared successfully');
};

/**
 * Executes logout with optional feedback
 */
export const performLogout = async (options?: {
  showConfirmation?: boolean;
  showSuccess?: boolean;
  redirectTo?: string;
}): Promise<void> => {
  const {
    showConfirmation = true,
    showSuccess = true,
    redirectTo = '/login'
  } = options || {};

  // Show confirmation if requested
  if (showConfirmation) {
    const confirmed = window.confirm(
      'Are you sure you want to sign out? You will need to sign in again to access your account.'
    );
    
    if (!confirmed) {
      return;
    }
  }

  try {
    // Clear authentication tokens
    clearAuthTokens();
    
    // Show success feedback if requested
    if (showSuccess) {
      console.log('User signed out successfully');
      // In a real app, you might use a toast notification here
    }
    
    // Redirect to login page
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
};

/**
 * Checks if user is signed in
 */
export const isSignedIn = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Gets user data from localStorage
 */
export const getCurrentUser = (): any => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};