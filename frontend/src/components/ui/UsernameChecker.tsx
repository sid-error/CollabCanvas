import React, { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { debounce } from '../../utils/debounce';
import { checkUsernameAvailability } from '../../services/usernameService';
import type { UsernameCheckResult } from '../../services/usernameService';

export interface UsernameCheckerProps {
  username: string;
  onAvailabilityChange?: (available: boolean) => void;
  className?: string;
  debounceTime?: number;
}

/**
 * UsernameChecker Component
 * Real-time username availability checker with validation
 * 
 * @component
 * @example
 * <UsernameChecker 
 *   username={username} 
 *   onAvailabilityChange={(available) => setUsernameAvailable(available)}
 * />
 */
export const UsernameChecker: React.FC<UsernameCheckerProps> = ({
  username,
  onAvailabilityChange,
  className = '',
  debounceTime = 500
}) => {
  const [checkResult, setCheckResult] = useState<UsernameCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced check function
  const debouncedCheck = React.useMemo(() => 
    debounce(async (usernameToCheck: string) => {
      if (!usernameToCheck.trim() || usernameToCheck.trim().length < 3) {
        setCheckResult(null);
        setIsChecking(false);
        onAvailabilityChange?.(false);
        return;
      }

      try {
        setIsChecking(true);
        setError(null);
        const result = await checkUsernameAvailability(usernameToCheck);
        setCheckResult(result);
        onAvailabilityChange?.(result.available);
      } catch (err) {
        console.error('Username check failed:', err);
        setError('Unable to check username availability');
        setCheckResult(null);
        onAvailabilityChange?.(false);
      } finally {
        setIsChecking(false);
      }
    }, debounceTime),
    [debounceTime, onAvailabilityChange]
  );

  // Effect to trigger username check
  useEffect(() => {
    setIsChecking(true);
    debouncedCheck(username);
  }, [username, debouncedCheck]);

  if (!username.trim() || username.trim().length < 1) {
    return null;
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    if (checkResult?.available) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    
    if (checkResult && !checkResult.available) {
      return <X className="w-4 h-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusText = () => {
    if (isChecking) {
      return 'Checking availability...';
    }
    
    if (error) {
      return <span className="text-red-600">{error}</span>;
    }
    
    if (checkResult) {
      return (
        <span className={checkResult.available ? 'text-green-600' : 'text-red-600'}>
          {checkResult.message}
        </span>
      );
    }
    
    return null;
  };

  return (
    <div className={`mt-2 space-y-2 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
      </div>

      {/* Suggestions for taken usernames */}
      {checkResult?.suggestions && checkResult.suggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-slate-600 mb-1">Try these suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {checkResult.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
                onClick={() => {
                  // This would be connected to a parent component to update the username
                  console.log('Suggested username:', suggestion);
                  // In a real implementation, you might emit an event or use a callback
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Username requirements */}
      <div className="text-xs text-slate-500 space-y-0.5 pt-2 border-t border-slate-100">
        <p className="font-medium mb-1">Username requirements:</p>
        <ul className="space-y-0.5">
          <li className="flex items-center">
            <span className="mr-1">•</span> 3-20 characters
          </li>
          <li className="flex items-center">
            <span className="mr-1">•</span> Letters, numbers, dots, hyphens, and underscores only
          </li>
          <li className="flex items-center">
            <span className="mr-1">•</span> No spaces or special characters
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UsernameChecker;