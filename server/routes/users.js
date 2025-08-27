// User management routes for Ilorin Innovation Hub API

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get all users (Admin only)
router.get('/', asyncHandler(async (req, res) => {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          status: 401
        }
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          status: 403
        }
      });
    }

    // Get all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
}));

// Update user profile
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          status: 401
        }
      });
    }

    // Check if user can update this profile (own profile or admin)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Profile not found',
          status: 403
        }
      });
    }

    if (profile.role !== 'admin' && user.id !== id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You can only update your own profile',
          status: 403
        }
      });
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: data }
    });

  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}));

// Delete user (Admin only)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          status: 401
        }
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Admin access required',
          status: 403
        }
      });
    }

    // Delete user from auth and profile will be deleted by cascade
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}));

export default router;

