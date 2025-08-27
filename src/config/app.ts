// Application configuration for Ilorin Innovation Hub

export const APP_CONFIG = {
  // Application Information
  name: import.meta.env.VITE_APP_NAME || 'Ilorin Innovation Hub',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Digital attendance management system for Ilorin Innovation Hub',
  
  // Hub Information
  hub: {
    name: import.meta.env.VITE_HUB_NAME || 'Ilorin Innovation Hub',
    latitude: parseFloat(import.meta.env.VITE_HUB_LATITUDE || '8.4969'),
    longitude: parseFloat(import.meta.env.VITE_HUB_LONGITUDE || '4.5421'),
    radius: parseInt(import.meta.env.VITE_HUB_RADIUS_METERS || '100'), // meters
    address: 'Ilorin, Kwara State, Nigeria'
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3
  },

  // Authentication Configuration
  auth: {
    adminAccessCode: import.meta.env.VITE_ADMIN_ACCESS_CODE || 'IIH-ADMIN-2025',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    refreshThreshold: 5 * 60 * 1000 // 5 minutes before expiry
  },

  // Feature Flags
  features: {
    enableLocationTracking: true,
    enablePushNotifications: false,
    enableOfflineMode: false,
    enableAnalytics: import.meta.env.VITE_DEBUG_MODE === 'true'
  },

  // UI Configuration
  ui: {
    theme: 'light',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    successColor: '#059669',
    warningColor: '#d97706',
    errorColor: '#dc2626',
    borderRadius: '0.5rem',
    animationDuration: 200
  },

  // Geolocation Configuration
  geolocation: {
    enableHighAccuracy: true,
    timeout: 10000, // 10 seconds
    maximumAge: 300000, // 5 minutes
    watchPosition: false
  },

  // Development Configuration
  development: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableMockData: false
  }
} as const;

// Validation function to check if configuration is valid
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required hub coordinates
  if (isNaN(APP_CONFIG.hub.latitude) || isNaN(APP_CONFIG.hub.longitude)) {
    errors.push('Invalid hub coordinates');
  }

  // Check hub radius
  if (APP_CONFIG.hub.radius <= 0) {
    errors.push('Hub radius must be greater than 0');
  }

  // Check API URL format
  try {
    new URL(APP_CONFIG.api.baseUrl);
  } catch {
    errors.push('Invalid API base URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to get distance between two points
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
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

// Helper function to check if location is within hub radius
export function isWithinHubRadius(latitude: number, longitude: number): {
  isWithinRange: boolean;
  distance: number;
  hubCoordinates: { lat: number; lng: number };
} {
  const distance = calculateDistance(
    latitude, 
    longitude, 
    APP_CONFIG.hub.latitude, 
    APP_CONFIG.hub.longitude
  );

  return {
    isWithinRange: distance <= APP_CONFIG.hub.radius,
    distance: Math.round(distance),
    hubCoordinates: {
      lat: APP_CONFIG.hub.latitude,
      lng: APP_CONFIG.hub.longitude
    }
  };
}

export default APP_CONFIG;
