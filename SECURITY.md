# Security Guide - Kartavya

## 🔒 API Key Security

### Current Status
✅ **Secured**: Your API keys are properly protected
- `.env` file is in `.gitignore`
- No actual API keys committed to repository
- Example files use placeholder values only

### ⚠️ Important Security Practices

#### 1. Never Commit API Keys
```bash
# ❌ WRONG - Never do this
git add .env
git commit -m "Add config"

# ✅ CORRECT - Only commit example files
git add .env.example
git commit -m "Add environment template"
```

#### 2. Use Environment Variables
```javascript
// ✅ CORRECT - Use environment variables
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// ❌ WRONG - Never hardcode API keys
const apiKey = "AIzaSyBvOkBwgGlbUiuS-mLlH_IuGa7TBwwBBgU";
```

#### 3. Restrict API Key Usage
In Google Cloud Console, restrict your API key:
- **Application restrictions**: HTTP referrers (websites)
  - Add your domains: `https://yourdomain.com/*`
  - For development: `http://localhost:3000/*`
- **API restrictions**: Only enable required APIs
  - Maps JavaScript API
  - Places API
  - Geocoding API
  - Geolocation API

#### 4. Set Usage Quotas
- Set daily quotas to prevent unexpected charges
- Enable billing alerts
- Monitor usage regularly

## 🛡️ Security Checklist

### Before Deploying

- [ ] Remove all hardcoded API keys
- [ ] Verify `.env` is in `.gitignore`
- [ ] Check git history for accidentally committed keys
- [ ] Restrict API keys in Google Cloud Console
- [ ] Set up billing alerts
- [ ] Enable HTTPS for production
- [ ] Configure CORS properly
- [ ] Set up rate limiting

### If API Key is Exposed

1. **Immediately revoke the key** in Google Cloud Console
2. **Generate a new key** with proper restrictions
3. **Update your `.env` file** with the new key
4. **Check billing** for unauthorized usage
5. **Review git history**:
   ```bash
   # Search for exposed keys in git history
   git log -S "AIza" --all
   
   # If found, use git-filter-repo to remove
   # (This rewrites history - use with caution!)
   ```

## 🔐 Environment Setup

### Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your actual API key to `.env`:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Never commit `.env`** - it's already in `.gitignore`

### Production (Deployment)

#### Vercel/Netlify
Add environment variables in the dashboard:
- Go to Project Settings → Environment Variables
- Add `REACT_APP_GOOGLE_MAPS_API_KEY`
- Value: Your production API key (with domain restrictions)

#### Heroku
```bash
heroku config:set REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key
```

#### AWS/Azure
Use their respective secret management services:
- AWS: Secrets Manager or Parameter Store
- Azure: Key Vault

## 🔍 Security Scanning

### Check for Exposed Secrets
```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Scan repository
git secrets --scan

# Scan history
git secrets --scan-history
```

### GitHub Secret Scanning
- GitHub automatically scans for exposed secrets
- Enable "Secret scanning" in repository settings
- Review and revoke any detected secrets immediately

## 📋 Additional Security Measures

### 1. Content Security Policy (CSP)
Add to `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://maps.googleapis.com; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">
```

### 2. HTTPS Only
```javascript
// In production, redirect HTTP to HTTPS
if (window.location.protocol !== 'https:' && 
    window.location.hostname !== 'localhost') {
  window.location.href = 'https:' + 
    window.location.href.substring(window.location.protocol.length);
}
```

### 3. Rate Limiting
Implement client-side rate limiting for API calls:
```javascript
// Example: Limit geocoding requests
const rateLimiter = {
  calls: [],
  maxCalls: 10,
  timeWindow: 60000, // 1 minute
  
  canMakeRequest() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.timeWindow);
    return this.calls.length < this.maxCalls;
  },
  
  recordRequest() {
    this.calls.push(Date.now());
  }
};
```

## 🚨 Incident Response

If you suspect a security breach:

1. **Revoke compromised credentials immediately**
2. **Generate new API keys**
3. **Review access logs** in Google Cloud Console
4. **Check for unauthorized charges**
5. **Update all deployment environments**
6. **Notify users if data was compromised**

## 📞 Support

For security concerns:
- Email: security@kartavya.com
- Report vulnerabilities responsibly
- Do not disclose security issues publicly

---

**Last Updated**: December 2024
**Next Review**: March 2025
