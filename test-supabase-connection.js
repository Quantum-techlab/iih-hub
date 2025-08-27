// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cxkzcsduxaeziwfwbcyz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3pjc2R1eGFleml3ZndiY3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTA5OTQsImV4cCI6MjA2Njg2Njk5NH0.OZ0Jcil6tgHFonCwmt-4oZcCf3gKCX37S9y8qKHvz-Q";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test user registration
    console.log('🔍 Testing user registration...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    const testName = 'Test User';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
          role: 'intern'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ User registration failed:', signUpError.message);
      return false;
    }
    
    console.log('✅ User registration successful');
    
    if (signUpData.user) {
      console.log('📧 User created:', signUpData.user.email);
      console.log('🔑 User ID:', signUpData.user.id);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed! Supabase is working correctly.');
    console.log('📋 You can now try creating an account in the application.');
  } else {
    console.log('\n⚠️  Tests failed. Please check your Supabase configuration.');
  }
});

