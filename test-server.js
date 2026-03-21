console.log('Starting server test...');
try {
  const express = require('express');
  const app = express();
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
  });
  
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Open http://localhost:5000/test in browser');
  });
  
} catch (error) {
  console.error('Error starting server:', error);
}
