/**
 * Authentication Service
 * Handles all authentication-related API calls and token management
 */

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    emailVerified: boolean;
    avatar?: string;
  };
  message?: string;
  requiresVerification?: boolean;
}

export interface GoogleAuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
  };
  message?: string;
}

export interface LoginActivity {
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceType?: string;
  status: 'success' | 'failed';
  reason?: string;
}

/**
 * Login with email and password
 * In production, this makes actual API calls to your backend
 */
export const loginWithEmailPassword = async (
  credentials: LoginCredentials,
  activityData?: Partial<LoginActivity>
): Promise<LoginResponse> => {
  try {
    // In production, uncomment this:
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     ...credentials,
    //     activityData
    //   }),
    // });
    // 
    // const data = await response.json();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response based on test credentials
    const mockUsers = [
      {
        email: 'user@example.com',
        password: 'password123',
        id: 'user123',
        username: 'user123',
        fullName: 'Test User',
        emailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=user@example.com'
      },
      {
        email: 'verified@example.com',
        password: 'password123',
        id: 'verified123',
        username: 'verifieduser',
        fullName: 'Verified User',
        emailVerified: true,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=verified@example.com'
      },
      {
        email: 'unverified@example.com',
        password: 'password123',
        id: 'unverified123',
        username: 'unverified',
        fullName: 'Unverified User',
        emailVerified: false,
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=unverified@example.com'
      }
    ];

    const user = mockUsers.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      // Log login activity (in production, this would be done by the backend)
      logLoginActivity({
        timestamp: new Date().toISOString(),
        status: 'success',
        ...activityData
      });

      // Generate mock token (in production, this comes from backend)
      const mockToken = `mock-jwt-token-${user.id}-${Date.now()}`;
      
      // Store token in localStorage (in production)
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_id', user.id);

      return {
        success: true,
        token: mockToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          emailVerified: user.emailVerified,
          avatar: user.avatar
        },
        message: 'Login successful'
      };
    } else {
      // Log failed login attempt
      logLoginActivity({
        timestamp: new Date().toISOString(),
        status: 'failed',
        reason: 'Invalid credentials',
        ...activityData
      });

      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Log failed login attempt due to error
    logLoginActivity({
      timestamp: new Date().toISOString(),
      status: 'failed',
      reason: 'Network error',
      ...activityData
    });

    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  }
};

/**
 * Login with Google OAuth
 * In production, this would handle the OAuth flow
 */
export const loginWithGoogle = async (
  activityData?: Partial<LoginActivity>
): Promise<GoogleAuthResponse> => {
  try {
    // In production, this would redirect to Google OAuth
    // For now, we'll simulate the process
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock Google user
    const mockGoogleUser = {
      id: 'google123',
      email: 'google.user@example.com',
      name: 'Google User',
      picture: 'https://api.dicebear.com/7.x/initials/svg?seed=google',
      emailVerified: true
    };
    
    // Log successful login
    logLoginActivity({
      timestamp: new Date().toISOString(),
      status: 'success',
      ...activityData
    });

    // Generate mock token
    const mockToken = `google-jwt-token-${mockGoogleUser.id}-${Date.now()}`;
    
    // Store token in localStorage (in production)
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user_id', mockGoogleUser.id);

    return {
      success: true,
      token: mockToken,
      user: mockGoogleUser,
      message: 'Google login successful'
    };
  } catch (error) {
    console.error('Google login error:', error);
    
    // Log failed login
    logLoginActivity({
      timestamp: new Date().toISOString(),
      status: 'failed',
      reason: 'Google OAuth error',
      ...activityData
    });

    return {
      success: false,
      message: 'Google login failed. Please try again.'
    };
  }
};

/**
 * Log login activity (frontend logging - in production, backend would handle this)
 */
export const logLoginActivity = (activity: LoginActivity): void => {
  try {
    // In production, this would send to your backend API
    // For now, we'll store in localStorage and log to console
    
    const activities = JSON.parse(localStorage.getItem('login_activities') || '[]');
    
    // Add new activity (limit to last 50)
    activities.unshift({
      ...activity,
      // Add client-side info if not provided
      userAgent: activity.userAgent || navigator.userAgent,
      timestamp: activity.timestamp || new Date().toISOString()
    });
    
    // Keep only last 50 activities
    const limitedActivities = activities.slice(0, 50);
    
    localStorage.setItem('login_activities', JSON.stringify(limitedActivities));
    
    // Log to console for debugging (remove in production)
    console.log('Login activity logged:', activity);
  } catch (error) {
    console.error('Failed to log login activity:', error);
  }
};

/**
 * Get recent login activities
 */
export const getRecentLoginActivities = (): LoginActivity[] => {
  try {
    return JSON.parse(localStorage.getItem('login_activities') || '[]');
  } catch (error) {
    console.error('Failed to get login activities:', error);
    return [];
  }
};

/**
 * Clear authentication tokens
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  // In production, you would validate the token with your backend
  return !!token;
};

/**
 * Get client IP address (mock for development)
 * In production, this would come from your backend
 */
export const getClientIP = async (): Promise<string> => {
  try {
    // In production, you might use a service like ipify
    // const response = await fetch('https://api.ipify.org?format=json');
    // const data = await response.json();
    // return data.ip;
    
    // Mock IP for development
    return '192.168.1.100';
  } catch (error) {
    console.error('Failed to get IP:', error);
    return 'Unknown';
  }
};

/**
 * Get device type from user agent
 */
export const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'Mobile';
  } else if (/Tablet|iPad/i.test(userAgent)) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
};