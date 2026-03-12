module.exports = {
  apps: [{
    name: 'bit-cms',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGODB_URI: 'mongodb://admin:secure_password_change_this@localhost:27017/bit_cms?authSource=admin',
      JWT_SECRET: 'your-super-secret-jwt-key-change-this',
      CORS_ORIGIN: 'https://yourdomain.com',
      REDIS_URL: 'redis://localhost:6379'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
