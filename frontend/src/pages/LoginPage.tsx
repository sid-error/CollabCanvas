import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, Globe, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { 
  loginWithEmailPassword, 
  loginWithGoogle, 
  getClientIP, 
  getDeviceType 
} from '../utils/authService';
import { 
  getAuthErrorMessage, 
  displayErrorMessage, 
  logError,
  type ErrorMessage 
} from '../utils/errorHandler';
import { useState, useEffect } from 'react';

/**
 * LoginPage component - User authentication page
 * Provides login form with email/password and Google OAuth options
 */
const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Check for verification message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setError({
        title: 'Success',
        message: location.state.message,
        type: 'success'
      });
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load recent login activities on component mount
  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('login_activities') || '[]');
    setRecentActivities(activities.slice(0, 3)); // Show only last 3
  }, []);

  /**
   * Handles login form submission
   * Validates credentials and redirects to dashboard on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowVerificationAlert(false);
    setIsLoading(true);
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError(getAuthErrorMessage('Please enter both email and password'));
      setIsLoading(false);
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(getAuthErrorMessage('Please enter a valid email address'));
      setIsLoading(false);
      return;
    }
    
    try {
      // Get client information for activity logging
      const ipAddress = await getClientIP();
      const deviceType = getDeviceType();
      
      // Call authentication service
      const result = await loginWithEmailPassword(
        { email, password },
        {
          ipAddress,
          deviceType,
          userAgent: navigator.userAgent
        }
      );
      
      if (result.success && result.user) {
        // Check if email is verified
        if (!result.user.emailVerified) {
          setShowVerificationAlert(true);
          setError(getAuthErrorMessage('Email not verified'));
          setIsLoading(false);
          return;
        }
        
        // Login through auth context
        const loginResult = await login(
          result.user.email,
          result.user.username,
          {
            id: result.user.id,
            fullName: result.user.fullName,
            emailVerified: result.user.emailVerified,
            avatar: result.user.avatar
          }
        );
        
        if (loginResult.success) {
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem('remembered_email', email);
          } else {
            localStorage.removeItem('remembered_email');
          }
          
          // Navigate to dashboard or intended destination
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        } else {
          setError(getAuthErrorMessage(loginResult.message));
        }
      } else {
        setError(getAuthErrorMessage(result.message));
      }
    } catch (err) {
      logError(err, 'Login');
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google OAuth login
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get client information
      const ipAddress = await getClientIP();
      const deviceType = getDeviceType();
      
      // Call Google authentication service
      const result = await loginWithGoogle({
        ipAddress,
        deviceType,
        userAgent: navigator.userAgent
      });
      
      if (result.success && result.user) {
        // Login through auth context
        const loginResult = await login(
          result.user.email,
          result.user.name.split(' ')[0],
          {
            id: result.user.id,
            fullName: result.user.name,
            emailVerified: result.user.emailVerified,
            avatar: result.user.picture
          }
        );
        
        if (loginResult.success) {
          navigate('/dashboard', { replace: true });
        } else {
          setError(getAuthErrorMessage(loginResult.message));
        }
      } else {
        setError(getAuthErrorMessage(result.message));
      }
    } catch (err) {
      logError(err, 'Google Login');
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles resending verification email
   */
  const handleResendVerification = async () => {
    if (!email) {
      setError(getAuthErrorMessage('Please enter your email address'));
      return;
    }
    
    setIsLoading(true);
    try {
      // In production: Call your API to resend verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setError({
        title: 'Verification Email Sent',
        message: `A new verification email has been sent to ${email}. Please check your inbox and spam folder.`,
        type: 'success'
      });
      setShowVerificationAlert(false);
    } catch (err) {
      logError(err, 'Resend Verification');
      setError(getAuthErrorMessage('Failed to resend verification email'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Left column - Login form */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            
            {/* Header section with logo */}
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="text-blue-600" size={32} aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
              <p className="text-slate-500">Log in to continue your session</p>
            </div>

            {/* Error message display */}
            {error && (
              <div className={`mb-6 p-4 rounded-lg border ${
                error.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                error.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                error.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{error.title}</h3>
                    <p className="text-sm">{error.message}</p>
                    {error.code && (
                      <p className="text-xs opacity-75 mt-1">Error code: {error.code}</p>
                    )}
                    
                    {showVerificationAlert && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm">You need to verify your email before logging in.</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={handleResendVerification}
                            isLoading={isLoading}
                            variant="outline"
                            className="text-sm py-1"
                          >
                            Resend Verification Email
                          </Button>
                          <Link 
                            to="/verify-email"
                            className="text-sm text-blue-600 hover:underline py-1 px-3"
                          >
                            Go to Verification
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Login form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email input field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-3 text-slate-400" 
                    size={20} 
                    aria-hidden="true" 
                  />
                  <input 
                    id="email"
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                      setShowVerificationAlert(false);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                    aria-label="Enter your email address"
                    aria-required="true"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password input field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-blue-600 hover:underline"
                    aria-label="Reset your password"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-3 text-slate-400" 
                    size={20} 
                    aria-hidden="true" 
                  />
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                    aria-label="Enter your password"
                    aria-required="true"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-700">
                  Remember me on this device
                </label>
              </div>

              {/* Sign in button */}
              <Button 
                type="submit" 
                className="w-full py-3"
                isLoading={isLoading}
                aria-label="Sign in to your account"
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* OAuth login section */}
            <div className="mt-6">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-sm">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Google login button */}
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full mt-4 flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Continue with Google"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Registration link */}
            <p className="text-center mt-8 text-slate-600">
              New here?{' '}
              <Link 
                to="/register" 
                className={`text-blue-600 font-semibold hover:underline ${isLoading ? 'pointer-events-none text-slate-400' : ''}`}
                aria-label="Create a new account"
                onClick={isLoading ? (e) => e.preventDefault() : undefined}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Right column - Login activity and info */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100 h-full">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-slate-900">Recent Login Activity</h2>
            </div>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      activity.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className={`font-medium ${
                          activity.status === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {activity.status === 'success' ? 'Successful' : 'Failed'} Login
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-slate-600">
                      {activity.ipAddress && (
                        <div className="flex items-center gap-2">
                          <Globe size={14} />
                          <span>IP: {activity.ipAddress}</span>
                        </div>
                      )}
                      {activity.deviceType && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>Device: {activity.deviceType}</span>
                        </div>
                      )}
                      {activity.reason && activity.status === 'failed' && (
                        <div className="text-red-600 text-sm mt-1">
                          Reason: {activity.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-2">No recent login activity</p>
                <p className="text-sm text-slate-400">
                  Your login activity will appear here after you sign in
                </p>
              </div>
            )}
            
            {/* Security tips */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Security Tips</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Always check the URL before entering credentials</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Use a strong, unique password for your account</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Enable two-factor authentication if available</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5" />
                  <span>Log out from shared or public computers</span>
                </li>
              </ul>
            </div>
            
            {/* Help links */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
                <Link 
                  to="/verify-email" 
                  className="text-blue-600 hover:underline"
                >
                  Verify Email
                </Link>
                <Link 
                  to="/terms-of-service" 
                  className="text-blue-600 hover:underline"
                >
                  Terms of Service
                </Link>
                <Link 
                  to="/privacy-policy" 
                  className="text-blue-600 hover:underline"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;