// Test authentication endpoint
const testAuth = async () => {
  try {
    console.log('Testing authentication endpoint...');
    
    const response = await fetch('https://cms-eta-beige.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bitadmin_110',
        password: 'Mani110'
      })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Authentication working!');
    } else {
      console.log('❌ Authentication failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

testAuth();
