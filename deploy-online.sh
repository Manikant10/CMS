#!/bin/bash

echo "🌐 BIT CMS Online Deployment Script"
echo "=================================="

echo "Choose your deployment platform:"
echo "1) Vercel (Easiest - Free tier available)"
echo "2) Heroku (Easy - Free tier available)"
echo "3) DigitalOcean (Production - $5/month)"
echo "4) AWS EC2 (Enterprise - Free tier)"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo "🚀 Deploying to Vercel..."
    echo "=========================="
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
      echo "📦 Installing Vercel CLI..."
      npm install -g vercel
    fi
    
    echo "🔧 Frontend deployment..."
    cd client/web
    vercel --prod
    
    echo "🔧 Backend deployment..."
    cd ../..
    vercel --prod
    
    echo "✅ Vercel deployment completed!"
    echo "📋 Next steps:"
    echo "   1. Set up MongoDB Atlas: https://www.mongodb.com/atlas"
    echo "   2. Add environment variables in Vercel dashboard"
    echo "   3. Update your domain name"
    ;;
    
  2)
    echo "🚀 Deploying to Heroku..."
    echo "=========================="
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
      echo "📦 Installing Heroku CLI..."
      npm install -g heroku
    fi
    
    echo "🔧 Logging into Heroku..."
    heroku login
    
    echo "🔧 Creating Heroku app..."
    heroku create bit-cms
    
    echo "🔧 Adding MongoDB Atlas addon..."
    heroku addons:create mongolab:sandbox
    
    echo "🔧 Setting environment variables..."
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET="your-super-secret-jwt-key-change-this"
    
    echo "🔧 Deploying to Heroku..."
    git add .
    git commit -m "Deploy to Heroku"
    git push heroku main
    
    echo "✅ Heroku deployment completed!"
    echo "📋 Next steps:"
    echo "   1. Update MongoDB URI in Heroku dashboard"
    echo "   2. Open app: heroku open"
    echo "   3. Test all functionality"
    ;;
    
  3)
    echo "🚀 Deploying to DigitalOcean..."
    echo "=============================="
    
    echo "📋 DigitalOcean Setup Instructions:"
    echo "1. Go to https://www.digitalocean.com"
    echo "2. Create account (get $200 free credit)"
    echo "3. Create Droplet:"
    echo "   - Image: Ubuntu 22.04 LTS"
    echo "   - Plan: $5/month (1GB RAM, 1 CPU)"
    echo "   - Region: Choose nearest to your users"
    echo "   - SSH Key: Add your SSH key"
    echo ""
    echo "4. SSH into server:"
    echo "   ssh root@your-server-ip"
    echo ""
    echo "5. Run setup commands:"
    echo "   apt update && apt upgrade -y"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   apt-get install -y nodejs"
    echo "   apt install -y mongodb-org nginx git"
    echo "   npm install -g pm2"
    echo ""
    echo "6. Deploy application:"
    echo "   git clone https://github.com/yourusername/bit-cms.git"
    echo "   cd bit-cms"
    echo "   chmod +x deploy.sh"
    echo "   ./deploy.sh"
    echo ""
    echo "7. Configure domain and SSL"
    echo "   sudo apt install certbot python3-certbot-nginx"
    echo "   sudo certbot --nginx -d your-domain.com"
    
    echo "✅ DigitalOcean setup instructions provided!"
    ;;
    
  4)
    echo "🚀 Deploying to AWS EC2..."
    echo "=========================="
    
    echo "📋 AWS EC2 Setup Instructions:"
    echo "1. Go to https://aws.amazon.com"
    echo "2. Create free tier account"
    echo "3. Go to EC2 dashboard"
    echo "4. Launch instance:"
    echo "   - AMI: Ubuntu Server 22.04 LTS"
    echo "   - Instance type: t2.micro (free tier)"
    echo "   - Storage: 20GB SSD"
    echo "   - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)"
    echo ""
    echo "5. SSH into EC2 instance:"
    echo "   ssh -i your-key.pem ubuntu@your-ec2-ip"
    echo ""
    echo "6. Setup server (same as DigitalOcean)"
    echo "7. Deploy application"
    echo "8. Configure AWS Route 53 for domain"
    echo "9. Set up SSL with AWS Certificate Manager"
    
    echo "✅ AWS EC2 setup instructions provided!"
    ;;
    
  5)
    echo "👋 Exiting deployment script"
    exit 0
    ;;
    
  *)
    echo "❌ Invalid choice. Please enter 1-5."
    exit 1
    ;;
esac

echo ""
echo "🎉 Deployment process initiated!"
echo "📚 For detailed instructions, see: ONLINE_DEPLOYMENT_GUIDE.md"
echo "🔧 Don't forget to:"
echo "   1. Set up MongoDB Atlas"
echo "   2. Update environment variables"
echo "   3. Change default passwords"
echo "   4. Configure your domain"
echo "   5. Set up SSL certificate"
