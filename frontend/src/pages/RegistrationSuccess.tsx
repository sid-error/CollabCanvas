import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';

/**
 * RegistrationSuccess component - Success confirmation page after user registration
 * 
 * Displays a success message instructing users to check their email for verification.
 * This component is shown after successful registration and includes:
 * - Confirmation of email sent
 * - User's email address display
 * - Next steps instructions
 * - Navigation back to login
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/registration-success" element={<RegistrationSuccess />} />
 * ```
 * 
 * @returns {JSX.Element} A success confirmation page with email verification instructions
 */
const RegistrationSuccess: React.FC = () => {
  const location = useLocation();
  
  /**
   * Email address extracted from navigation state or default placeholder
   * @constant {string}
   */
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100">
        
        {/* Icon Section */}
        <div 
          className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          role="presentation"
          aria-hidden="true"
        >
          <Mail className="text-blue-600" size={40} aria-hidden="true" />
        </div>
        
        {/* Main Heading */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Check your email
        </h1>
        
        {/* Email Confirmation Message */}
        <p className="text-slate-600 mb-6" role="alert">
          We've sent a verification link to <br/>
          <span className="font-semibold text-slate-900">{email}</span>
        </p>
        
        {/* Next Steps Instructions */}
        <div 
          className="bg-blue-50 p-4 rounded-lg mb-8 text-sm text-blue-800 text-left"
          role="region"
          aria-label="Next steps instructions"
        >
          <strong>Next steps:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Click the link in the email to activate your account.</li>
            <li>Check your spam folder if you don't see it within a few minutes.</li>
          </ul>
        </div>
        
        {/* Navigation Link to Login */}
        <Link 
          to="/login" 
          className="flex items-center justify-center gap-2 text-blue-600 font-semibold hover:underline"
          aria-label="Return to login page"
        >
          Back to Login 
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};

export default RegistrationSuccess;