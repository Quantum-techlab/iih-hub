// Error handling utility for the Ilorin Innovation Hub project
import { supabase } from '@/integrations/supabase/client';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
  context?: string;
}

export class ErrorHandler {
  static async logError(error: any, context?: string): Promise<void> {
    try {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      const errorCode = error?.code || error?.status || 'UNKNOWN';
      const errorDetails = error?.details || error?.hint || null;
      
      // Log to console for development
      console.error('Error logged:', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        context,
        timestamp: new Date().toISOString()
      });

      // Log to database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase
            .from('error_logs')
            .insert({
              error_message: errorMessage,
              error_detail: errorDetails,
              error_context: context || 'Unknown context'
            });
        } catch (dbError) {
          console.error('Failed to log error to database:', dbError);
        }
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  static getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    if (error?.msg) return error.msg;
    return 'An unexpected error occurred';
  }

  static getErrorCode(error: any): string {
    return error?.code || error?.status || error?.error_code || 'UNKNOWN';
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('network') ||
           error?.message?.includes('fetch') ||
           !navigator.onLine;
  }

  static isAuthError(error: any): boolean {
    const authErrorCodes = [
      'invalid_credentials',
      'email_not_confirmed',
      'user_not_found',
      'invalid_token',
      'token_expired',
      'unauthorized'
    ];
    return authErrorCodes.includes(this.getErrorCode(error));
  }

  static isValidationError(error: any): boolean {
    return error?.code === 'validation_error' ||
           error?.message?.includes('validation') ||
           error?.message?.includes('required') ||
           error?.message?.includes('invalid');
  }

  static async handleSupabaseError(error: any, context?: string): Promise<AppError> {
    await this.logError(error, context);
    
    const message = this.getErrorMessage(error);
    const code = this.getErrorCode(error);
    
    // Handle specific Supabase errors
    if (code === '23505') {
      return {
        message: 'This email is already registered. Please use a different email or try signing in.',
        code: 'DUPLICATE_EMAIL',
        details: error,
        context
      };
    }
    
    if (code === '23503') {
      return {
        message: 'Database constraint violation. Please contact support.',
        code: 'CONSTRAINT_VIOLATION',
        details: error,
        context
      };
    }
    
    if (code === '42501') {
      return {
        message: 'Permission denied. You do not have access to perform this action.',
        code: 'PERMISSION_DENIED',
        details: error,
        context
      };
    }
    
    if (this.isNetworkError(error)) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        details: error,
        context
      };
    }
    
    if (this.isAuthError(error)) {
      return {
        message: 'Authentication error. Please sign in again.',
        code: 'AUTH_ERROR',
        details: error,
        context
      };
    }
    
    return {
      message,
      code,
      details: error,
      context
    };
  }
}

export default ErrorHandler;
