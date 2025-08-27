// Setup script for Ilorin Innovation Hub
// This script helps you get started with the project

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up Ilorin Innovation Hub...\n');

// Configuration
const SUPABASE_URL = "https://cxkzcsduxaeziwfwbcyz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3pjc2R1eGFleml3ZndiY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA5OTQsImV4cCI6MjA2Njg2Njk5NH0.OZ0Jcil6tgHFonCwmt-4oZcCf3gKCX37S9y8qKHvz-Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if .env file exists
function checkEnvFile() {
  const envPath = '.env';
  const envExamplePath = 'env.example';
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('📝 Creating .env file from template...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created. Please update with your actual values.');
    } else {
      console.log('⚠️  No .env file found. Please create one with your configuration.');
    }
  } else {
    console.log('✅ .env file exists.');
  }
}

// Check server .env file
function checkServerEnvFile() {
  const serverEnvPath = 'server/.env';
  const serverEnvExamplePath = 'server/env.example';
  
  if (!fs.existsSync(serverEnvPath)) {
    if (fs.existsSync(serverEnvExamplePath)) {
      console.log('📝 Creating server .env file from template...');
      fs.copyFileSync(serverEnvExamplePath, serverEnvPath);
      console.log('✅ Server .env file created. Please update with your actual values.');
    } else {
      console.log('⚠️  No server .env file found. Please create one with your configuration.');
    }
  } else {
    console.log('✅ Server .env file exists.');
  }
}

// Test database connection
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

// Check dependencies
function checkDependencies() {
  console.log('📦 Checking dependencies...');
  
  // Check client dependencies
  if (fs.existsSync('package.json')) {
    console.log('✅ Client package.json exists');
  } else {
    console.log('❌ Client package.json not found');
    return false;
  }
  
  // Check server dependencies
  if (fs.existsSync('server/package.json')) {
    console.log('✅ Server package.json exists');
  } else {
    console.log('❌ Server package.json not found');
    return false;
  }
  
  return true;
}

// Main setup function
async function setup() {
  console.log('=' .repeat(50));
  console.log('🏗️  ILORIN INNOVATION HUB SETUP');
  console.log('=' .repeat(50));
  
  // Check environment files
  console.log('\n📋 Checking environment configuration...');
  checkEnvFile();
  checkServerEnvFile();
  
  // Check dependencies
  console.log('\n📦 Checking project structure...');
  const depsOk = checkDependencies();
  
  // Test database
  console.log('\n🗄️  Testing database connection...');
  const dbOk = await testDatabaseConnection();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SETUP SUMMARY');
  console.log('=' .repeat(50));
  
  if (depsOk && dbOk) {
    console.log('🎉 Setup completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your .env files with actual values');
    console.log('2. Install dependencies: npm install');
    console.log('3. Install server dependencies: cd server && npm install');
    console.log('4. Start development: npm run dev');
    console.log('5. Start server: cd server && npm run dev');
    console.log('\n🌐 Access your application at: http://localhost:5173');
  } else {
    console.log('⚠️  Setup completed with issues.');
    console.log('\n🔧 Please resolve the issues above before proceeding.');
  }
  
  console.log('\n📚 For detailed instructions, see README.md');
  console.log('🆘 For support, create an issue in the repository');
}

// Run setup
setup().catch(console.error);
