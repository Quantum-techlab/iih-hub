// Validation middleware for Ilorin Innovation Hub API

import Joi from 'joi';

// API Key validation
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'API key required',
        status: 401
      }
    });
  }

  // In a real application, you would validate against a database
  // For now, we'll use a simple check
  if (apiKey !== process.env.API_KEY && apiKey !== 'iih-hub-dev-key') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key',
        status: 401
      }
    });
  }

  next();
};

// User registration validation
export const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('intern', 'admin', 'staff').default('intern'),
    phone: Joi.string().optional(),
    department: Joi.string().optional(),
    supervisor: Joi.string().optional(),
    adminCode: Joi.string().when('role', {
      is: 'admin',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: error.details,
        status: 400
      }
    });
  }

  next();
};

// Attendance validation
export const validateAttendance = (req, res, next) => {
  const schema = Joi.object({
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      accuracy: Joi.number().min(0).required(),
      timestamp: Joi.string().isoDate().required()
    }).required(),
    action: Joi.string().valid('sign_in', 'sign_out').required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: error.details,
        status: 400
      }
    });
  }

  next();
};

// Location validation
export const validateLocation = (req, res, next) => {
  const schema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    accuracy: Joi.number().min(0).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid location data',
        details: error.details,
        status: 400
      }
    });
  }

  next();
};
