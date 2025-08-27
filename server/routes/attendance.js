// Attendance routes for Ilorin Innovation Hub API

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { validateAttendance, validateLocation } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Helper function to verify user location
function verifyLocation(userLat, userLon) {
  const hubLat = parseFloat(process.env.HUB_LATITUDE || '8.4969');
  const hubLon = parseFloat(process.env.HUB_LONGITUDE || '4.5421');
  const maxDistance = parseInt(process.env.HUB_RADIUS_METERS || '100');

  const distance = calculateDistance(userLat, userLon, hubLat, hubLon);
  
  return {
    isWithinRange: distance <= maxDistance,
    distance: Math.round(distance),
    hubCoordinates: { lat: hubLat, lng: hubLon }
  };
}

// Submit attendance (sign in/out)
router.post('/submit', validateAttendance, asyncHandler(async (req, res) => {
  const { location, action } = req.body;
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

    // Verify location
    const locationVerification = verifyLocation(location.latitude, location.longitude);
    
    if (!locationVerification.isWithinRange) {
      return res.status(400).json({
        success: false,
        error: {
          message: `You are ${locationVerification.distance}m away from the hub. Please be within ${process.env.HUB_RADIUS_METERS || 100}m to sign in/out.`,
          status: 400,
          data: {
            distance: locationVerification.distance,
            maxDistance: process.env.HUB_RADIUS_METERS || 100,
            hubCoordinates: locationVerification.hubCoordinates
          }
        }
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    if (action === 'sign_in') {
      // Check if user already signed in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingRecord && existingRecord.sign_in_time) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'You have already signed in today',
            status: 400
          }
        });
      }

      // Create or update attendance record
      const attendanceData = {
        user_id: user.id,
        date: today,
        sign_in_time: now,
        sign_in_location: {
          ...location,
          distanceToHub: locationVerification.distance,
          hubCoordinates: locationVerification.hubCoordinates
        },
        status: 'signed_in'
      };

      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('attendance_records')
          .update(attendanceData)
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;

        res.json({
          success: true,
          message: 'Sign in successful',
          data: { attendance: data }
        });
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('attendance_records')
          .insert(attendanceData)
          .select()
          .single();

        if (error) throw error;

        res.json({
          success: true,
          message: 'Sign in successful',
          data: { attendance: data }
        });
      }

    } else if (action === 'sign_out') {
      // Check if user has signed in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (!existingRecord || !existingRecord.sign_in_time) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'You must sign in before signing out',
            status: 400
          }
        });
      }

      if (existingRecord.sign_out_time) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'You have already signed out today',
            status: 400
          }
        });
      }

      // Update attendance record with sign out
      const { data, error } = await supabase
        .from('attendance_records')
        .update({
          sign_out_time: now,
          sign_out_location: {
            ...location,
            distanceToHub: locationVerification.distance,
            hubCoordinates: locationVerification.hubCoordinates
          },
          status: 'signed_out'
        })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        message: 'Sign out successful',
        data: { attendance: data }
      });
    }

  } catch (error) {
    console.error('Attendance submission error:', error);
    throw error;
  }
}));

// Get user's attendance history
router.get('/history', asyncHandler(async (req, res) => {
  const { authorization } = req.headers;
  const { start_date, end_date, limit = 30 } = req.query;

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

    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(parseInt(limit));

    if (start_date) {
      query = query.gte('date', start_date);
    }

    if (end_date) {
      query = query.lte('date', end_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: { attendance: data }
    });

  } catch (error) {
    console.error('Get attendance history error:', error);
    throw error;
  }
}));

// Get today's attendance status
router.get('/today', asyncHandler(async (req, res) => {
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

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    res.json({
      success: true,
      data: { 
        attendance: data || null,
        status: data ? data.status : 'absent'
      }
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    throw error;
  }
}));

export default router;
