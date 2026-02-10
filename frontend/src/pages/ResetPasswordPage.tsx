import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { resetPassword } from '../utils/authService';

/**
 * ResetPasswordPage component - Password reset interface
 * 
 * Provides a secure password reset form that validates reset tokens and allows users
 * to set a new password. Includes password strength validation, confirmation matching,
 * and success/error states. The component handles token validation and redirects users
 * to login upon successful password reset.
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/reset-password" element={<ResetPasswordPage />} />
 * ```
 * 
 * @returns {JSX.Element} A password reset form or success confirmation screen
 */
const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  /**
   * Password reset token extracted from URL query parameters
   * @constant {string | null}
   */
  const token = searchParams.get('token');

  // Form state management
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  /**
   * Validates reset token on component mount
   * 
   * @effect
   * @listens token
   */
  useEffect(() => {
    if (!token) {
      setError("No reset token found. Please request a new link.");
    }
  }, [token]);

  /**
   * Handles password reset form submission
   * 
   * Performs validation and sends the new password to the backend:
   * 1. Validates password length (min 8 characters)
   * 2. Confirms password match
   * 3. Validates token presence
   * 4. Sends reset request to backend
   * 5. Handles success/error responses
   * 
   * @async
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>}
   * 
   * @throws {Error} When reset fails or validation errors occur
   * 
   * @example
   * ```typescript
   * // Called when user submits the password reset form
   * handleSubmit(event);
   * ```
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Basic Validations
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) return;

    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Success screen component shown after successful password reset
   * 
   * @returns {JSX.Element} Success confirmation UI
   */
  const renderSuccessScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
        <CheckCircle 
          className="w-16 h-16 text-green-500 mx-auto mb-4" 
          aria-hidden="true" 
        />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Updated</h1>
        <p className="text-slate-600 mb-6">
          Your password has been reset successfully. Redirecting you to the login page...
        </p>
        <Button 
          onClick={() => navigate('/login')} 
          className="w-full"
          aria-label="Go to login page"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );

  /**
   * Main password reset form component
   * 
   * @returns {JSX.Element} Password reset form UI
   */
  const renderResetForm = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Back navigation */}
        <div className="mb-6">
          <Link 
            to="/login" 
            className="text-slate-400 hover:text-blue-600 flex items-center gap-2 text-sm transition-colors"
            aria-label="Return to login page"
          >
            <ArrowLeft size={16} aria-hidden="true" /> 
            Back to Login
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-slate-500">Create a secure password for your account.</p>
        </div>

        {/* Error display */}
        {error && (
          <div 
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="text-red-600" size={18} aria-hidden="true" />
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Password reset form */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          
          {/* New Password input */}
          <div className="relative">
            <Lock 
              className="absolute left-3 top-3 text-slate-400" 
              size={20} 
              aria-hidden="true" 
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLoading || (!!error && !token)}
              aria-label="New password"
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? 
                <EyeOff size={20} aria-hidden="true" /> : 
                <Eye size={20} aria-hidden="true" />
              }
            </button>
          </div>

          {/* Password strength indicator */}
          <PasswordStrengthMeter password={password} />

          {/* Confirm Password input */}
          <div className="relative">
            <Lock 
              className="absolute left-3 top-3 text-slate-400" 
              size={20} 
              aria-hidden="true" 
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLoading || (!!error && !token)}
              aria-label="Confirm new password"
              aria-required="true"
            />
          </div>

          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full py-3" 
            isLoading={isLoading} 
            disabled={isLoading || !token}
            aria-label={isLoading ? "Updating password..." : "Update password"}
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );

  // Return appropriate screen based on state
  return isSuccess ? renderSuccessScreen() : renderResetForm();
};

export default ResetPasswordPage;