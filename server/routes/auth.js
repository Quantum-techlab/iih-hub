// Authentication routes for Ilorin Innovation Hub API

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateUserRegistration } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// User registration
router.post('/register', validateUserRegistration, asyncHandler(async (req, res) => {
  const { email, password, name, role, phone, department, supervisor, adminCode } = req.body;

  // Validate admin code if admin role is selected
  if (role === 'admin' && adminCode !== process.env.ADMIN_ACCESS_CODE) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid admin access code',
        status: 400
      }
    });
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for development
      user_metadata: {
        name,
        role,
        phone,
        department,
        supervisor
      }
    });

    if (authError) {
      throw authError;
    }

    // The profile will be created automatically by the database trigger
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          role
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already registered')) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Email already registered',
          status: 409
        }
      });
    }

    throw error;
  }
}));

// User login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email and password are required',
        status: 400
      }
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          status: 401
        }
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: data.user,
        session: data.session,
        profile: profile || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}));

// User logout
router.post('/logout', asyncHandler(async (req, res) => {
  const { access_token } = req.body;

  if (!access_token) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Access token required',
        status: 400
      }
    });
  }

  try {
    const { error } = await supabase.auth.admin.signOut(access_token);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authorization header required',
        status: 401
      }
    });
  }

  try {
    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          status: 401
        }
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      success: true,
      data: {
        user,
        profile: profile || null
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}));

export default router;
