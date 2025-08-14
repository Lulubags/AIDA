# AI Tutor Bot Deployment Guide

## Prerequisites

1. **OpenAI API Key**: Get one from https://platform.openai.com/api-keys
2. **Server or hosting platform** (VPS, Vercel, Railway, etc.)
3. **Domain name** (optional but recommended)

## Environment Variables Required

```bash
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

## Deployment Options

### Option 1: VPS/Dedicated Server (Ubuntu/Debian)

**Step 1: Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

**Step 2: Clone and Configure**
```bash
# Clone your repository
git clone <your-repo-url>
cd <project-directory>

# Install dependencies
npm install

# Create environment file
echo "NODE_ENV=production" > .env
echo "OPENAI_API_KEY=your_actual_api_key" >> .env
echo "PORT=5000" >> .env

# Build the application
npm run build
```

**Step 3: Start Application**
```bash
# Start with PM2
pm2 start npm --name "ai-tutor" -- start
pm2 startup
pm2 save

# Check status
pm2 status
```

**Step 4: Configure Nginx**
```nginx
# /etc/nginx/sites-available/ai-tutor
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain
    
    client_max_body_size 10M;  # Allow file uploads up to 10MB
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads {
        alias /path/to/your/project/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ai-tutor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Step 5: SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Vercel (Serverless)

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Deploy**
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add OPENAI_API_KEY production
```

### Option 3: Railway

**Step 1: Create railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

**Step 2: Deploy**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up --detach
```

### Option 4: Docker (Any Cloud Provider)

**Using the provided Dockerfile:**
```bash
# Build image
docker build -t ai-tutor .

# Run container
docker run -d \
  --name ai-tutor \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e OPENAI_API_KEY=your_api_key \
  ai-tutor
```

## Post-Deployment Checklist

### 1. Test Core Functionality
- [ ] Chat interface loads
- [ ] Grade/subject selection works
- [ ] Messages send and receive properly
- [ ] OpenAI responses generate correctly

### 2. Test Multimedia Features
- [ ] Image upload works
- [ ] Video upload works
- [ ] Media displays in chat
- [ ] Image analysis by AI functions

### 3. Test Language Learning Features
- [ ] Afrikaans tutor mode works
- [ ] Quick actions function properly
- [ ] Scaffolded teaching approach active

### 4. Performance & Security
- [ ] SSL certificate installed
- [ ] File upload size limits respected
- [ ] API key environment variable set
- [ ] Uploads directory has correct permissions

## Troubleshooting

### Common Issues:

**1. OpenAI API Errors**
```bash
# Check API key is set
echo $OPENAI_API_KEY

# Check API key permissions at OpenAI dashboard
```

**2. File Upload Issues**
```bash
# Check uploads directory permissions
chmod 755 uploads/
chmod 755 uploads/media/
chmod 755 uploads/curriculum/
```

**3. Build Failures**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Check Node.js version
node --version  # Should be 18+
```

**4. Port Already in Use**
```bash
# Change PORT in .env file
echo "PORT=3001" >> .env

# Or kill process using port 5000
sudo lsof -t -i:5000 | xargs sudo kill -9
```

## Monitoring & Maintenance

### PM2 Commands
```bash
pm2 logs ai-tutor        # View logs
pm2 restart ai-tutor     # Restart app
pm2 stop ai-tutor        # Stop app
pm2 delete ai-tutor      # Delete app
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
npm install

# Rebuild
npm run build

# Restart
pm2 restart ai-tutor
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **File Uploads**: Validate file types and sizes
3. **CORS**: Configure for your domain only
4. **Rate Limiting**: Consider adding rate limits for API calls
5. **SSL**: Always use HTTPS in production

## Support

If you encounter issues:
1. Check application logs
2. Verify environment variables are set
3. Ensure OpenAI API key has sufficient credits
4. Check network connectivity to OpenAI services