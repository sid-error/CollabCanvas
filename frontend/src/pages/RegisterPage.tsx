import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AtSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { UsernameChecker } from '../components/ui/UsernameChecker';
import { useState } from 'react';
import { validateEmailFormat, sendVerificationEmail } from '../utils/emailValidation';
import { openInNewTab } from '../utils/navigation';

/**
 * RegisterPage component - User registration page
 * Allows new users to create an account with password strength validation
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  
  // Form state management
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    valid: boolean;
    message: string;
  }>({ valid: false, message: '' });

  /**
   * Opens Terms of Service in a new tab
   */
  const openTermsOfService = () => {
    openInNewTab('/terms-of-service');
  };

  /**
   * Opens Privacy Policy in a new tab
   */
  const openPrivacyPolicy = () => {
    openInNewTab('/privacy-policy');
  };

  /**
   * Validates email on change
   */
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    const validation = validateEmailFormat(newEmail);
    setEmailValidation(validation);
  };

  /**
   * Handles registration form submission
   * Validates inputs and processes registration
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!isUsernameAvailable) {
      alert('Please choose an available username');
      return;
    }
    
    if (!emailValidation.valid) {
      alert(emailValidation.message || 'Please enter a valid email address');
      return;
    }
    
    if (!agreeToTerms) {
      alert('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    // Password validation
    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    // Username validation
    if (username.length < 3 || username.length > 20) {
      alert('Username must be between 3 and 20 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      alert('Username can only contain letters, numbers, dots, hyphens, and underscores');
      return;
    }

    try {
      setIsLoading(true);
      
      // In production: Add registration logic here
      // Example: const userData = await authService.register({ fullName, username, email, password });
      console.log('Registration attempt:', { fullName, username, email, password });
      
      // Send verification email
      const verificationResult = await sendVerificationEmail(email, username);
      
      if (!verificationResult.success) {
        throw new Error(verificationResult.message);
      }
      
      // Navigate to verification page
      navigate('/verify-email', { 
        state: { 
          email,
          message: 'Registration successful! Please check your email for verification.' 
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      {/* Registration card container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Header section with icon */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-blue-600" size={32} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-slate-500">Join the Collaborative Canvas platform</p>
        </div>

        {/* Registration form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full name input */}
          <div className="relative">
            <User 
              className="absolute left-3 top-3 text-slate-400" 
              size={20} 
              aria-hidden="true" 
            />
            <input 
              type="text" 
              placeholder="Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              aria-label="Enter your full name"
              aria-required="true"
              disabled={isLoading}
            />
          </div>
          
          {/* Username input */}
          <div className="relative">
            <AtSign 
              className="absolute left-3 top-3 text-slate-400" 
              size={20} 
              aria-hidden="true" 
            />
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              aria-label="Choose a username"
              aria-required="true"
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_.-]+"
              title="Letters, numbers, dots, hyphens, and underscores only"
              disabled={isLoading}
            />
          </div>
          
          {/* Username availability checker */}
          <UsernameChecker 
            username={username}
            onAvailabilityChange={setIsUsernameAvailable}
          />
          
          {/* Email input */}
          <div className="relative">
            <Mail 
              className="absolute left-3 top-3 text-slate-400" 
              size={20} 
              aria-hidden="true" 
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                emailValidation.valid && email 
                  ? 'border-green-300' 
                  : email && !emailValidation.valid 
                  ? 'border-red-300' 
                  : 'border-slate-200'
              }`}
              required
              aria-label="Enter your email address"
              aria-required="true"
              disabled={isLoading}
            />
          </div>
          
          {/* Email validation feedback */}
          {email && (
            <div className={`text-sm ${emailValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
              {emailValidation.message}
            </div>
          )}

          {/* Password input */}
          <div className="relative">
            <Lock 
              className="absolute left-3 top-3 text-slate-400" 
              size={20} 
              aria-hidden="true" 
            />
            <input 
              type="password" 
              placeholder="Password (min. 8 characters)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              aria-label="Create a password"
              aria-required="true"
              minLength={8}
              disabled={isLoading}
            />
          </div>
          
          {/* Password strength meter */}
          <PasswordStrengthMeter 
            password={password}
            className="mt-2"
          />

          {/* Terms and conditions agreement */}
          <div className="flex items-start gap-2 py-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-1"
              required
              aria-label="Agree to Terms of Service and Privacy Policy"
              aria-required="true"
              disabled={isLoading}
            />
            <label htmlFor="terms" className="text-sm text-slate-500">
              I agree to the{' '}
              <button 
                type="button" 
                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:text-slate-400"
                onClick={openTermsOfService}
                disabled={isLoading}
                aria-label="Open Terms of Service in new tab"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                type="button" 
                className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded disabled:text-slate-400"
                onClick={openPrivacyPolicy}
                disabled={isLoading}
                aria-label="Open Privacy Policy in new tab"
              >
                Privacy Policy
              </button>.
            </label>
          </div>

          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full py-3 text-lg"
            isLoading={isLoading}
            aria-label="Create account"
            disabled={isLoading || !isUsernameAvailable || !emailValidation.valid || !agreeToTerms}
          >
            Sign Up
          </Button>
        </form>

        {/* Login redirect link */}
        <p className="text-center mt-6 text-slate-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-blue-600 font-semibold hover:underline disabled:text-slate-400"
            aria-label="Go to login page"
          >
            Log in
          </Link>
        </p>
        
        {/* Legal links footer */}
        <div className="text-center mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-xs text-slate-400">
            <Link 
              to="/terms-of-service" 
              className="hover:text-slate-600 transition-colors"
              aria-label="View Terms of Service"
            >
              Terms of Service
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              to="/privacy-policy" 
              className="hover:text-slate-600 transition-colors"
              aria-label="View Privacy Policy"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">
              © {new Date().getFullYear()} Collaborative Canvas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;