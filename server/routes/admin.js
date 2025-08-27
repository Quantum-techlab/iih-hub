// Admin routes for Ilorin Innovation Hub API

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to check admin access
const requireAdmin = asyncHandler(async (req, res, next) => {
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

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    throw error;
  }
});

// Get dashboard statistics
router.get('/stats', requireAdmin, asyncHandler(async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total attendance records
    const { count: totalAttendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true });

    if (attendanceError) throw attendanceError;

    // Get pending sign-ins
    const { count: pendingSignIns, error: pendingError } = await supabase
      .from('pending_sign_ins')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { count: todayAttendance, error: todayError } = await supabase
      .from('attendance_records')
      .select('*', { count: 'exact', head: true })
      .eq('date', today);

    if (todayError) throw todayError;

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalAttendance: totalAttendance || 0,
        pendingSignIns: pendingSignIns || 0,
        todayAttendance: todayAttendance || 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
}));

// Get all pending sign-ins
router.get('/pending-signins', requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pending_sign_ins')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email,
          role
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { pendingSignIns: data }
    });

  } catch (error) {
    console.error('Get pending sign-ins error:', error);
    throw error;
  }
}));

// Approve/reject pending sign-in
router.put('/pending-signins/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejection_reason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Status must be either approved or rejected',
        status: 400
      }
    });
  }

  try {
    const updateData = {
      status,
      approved_by: req.user.id,
      approved_at: new Date().toISOString()
    };

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    const { data, error } = await supabase
      .from('pending_sign_ins')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `Sign-in ${status} successfully`,
      data: { pendingSignIn: data }
    });

  } catch (error) {
    console.error('Update pending sign-in error:', error);
    throw error;
  }
}));

// Get error logs
router.get('/error-logs', requireAdmin, asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    res.json({
      success: true,
      data: { errorLogs: data }
    });

  } catch (error) {
    console.error('Get error logs error:', error);
    throw error;
  }
}));

export default router;

