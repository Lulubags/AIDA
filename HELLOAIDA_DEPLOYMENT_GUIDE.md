# Aida AI Tutor - WordPress Integration for helloaida.ai

## 🎯 Complete Integration Solution

You now have a fully integrated AI tutor system ready for your WordPress website at helloaida.ai with PayFast payment processing for South African users.

## 📦 What's Been Built

### 1. Core AI Tutor Application
- ✅ **Aida AI Tutor Bot** - Specialized for South African CAPS curriculum
- ✅ **Second Language Learning** - Focused on Afrikaans with English explanations
- ✅ **Multimedia Support** - Image, video upload and analysis
- ✅ **Scaffolded Teaching** - Guides students to discover answers
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop

### 2. PayFast Payment Integration
- ✅ **South African Pricing** - R99, R199, R1999 plans in ZAR
- ✅ **Secure Payment Processing** - PayFast integration with signature verification
- ✅ **Subscription Management** - Monthly and annual plans
- ✅ **Webhook Handling** - Automatic subscription activation

### 3. WordPress Integration Files
- ✅ **WordPress Plugin** - `wordpress-integration/aida-widget.php`
- ✅ **JavaScript Widget** - Responsive iframe with communication
- ✅ **CSS Styling** - Seamless WordPress theme integration
- ✅ **Shortcode Support** - Easy embedding with parameters

## 🚀 Deployment Steps

### Step 1: Deploy Your Aida Application

**Choose your hosting option:**

**Option A: VPS/Server (Recommended)**
```bash
# On your Ubuntu server
git clone <your-repo>
cd <project>
npm install
npm run build

# Environment variables
echo "NODE_ENV=production" > .env
echo "OPENAI_API_KEY=your_openai_key" >> .env
echo "PAYFAST_MERCHANT_ID=your_merchant_id" >> .env
echo "PAYFAST_MERCHANT_KEY=your_merchant_key" >> .env
echo "PAYFAST_PASSPHRASE=your_passphrase" >> .env
echo "BASE_URL=https://tutor.helloaida.ai" >> .env

# Start application
pm2 start npm --name "aida-tutor" -- start
pm2 save
```

**Option B: Railway/Vercel**
- Deploy directly from your GitHub repository
- Set environment variables in platform dashboard

### Step 2: Get PayFast Credentials

1. **Create PayFast Account** at https://payfast.co.za
2. **Get Merchant Details:**
   - Merchant ID (starts with numbers)
   - Merchant Key (long alphanumeric string)
   - Create a Passphrase (your choice)
3. **Configure Webhooks:**
   - Return URL: `https://tutor.helloaida.ai/subscription/success`
   - Cancel URL: `https://tutor.helloaida.ai/subscription/cancelled`
   - Notify URL: `https://tutor.helloaida.ai/api/payfast/notify`

### Step 3: Install WordPress Plugin

1. **Upload Plugin Files**
   - Zip the `wordpress-integration` folder
   - Upload to WordPress: Admin → Plugins → Add New → Upload
   - Activate "Aida AI Tutor Widget"

2. **Configure Plugin**
   - Go to Settings → Aida AI Tutor
   - Set Widget URL: `https://tutor.helloaida.ai`
   - Set PayFast Merchant ID
   - Save settings

### Step 4: Add Aida to Your Website

**Basic Integration:**
```
[aida_tutor]
```

**Advanced Integration:**
```
[aida_tutor grade="8" subject="afrikaans" height="700px"]
```

**Available Parameters:**
- `grade` - Student grade (1-12)
- `subject` - Subject (mathematics, english, afrikaans, etc.)
- `height` - Widget height (default: 600px)
- `width` - Widget width (default: 100%)
- `theme` - Color theme (light/dark)

## 💰 Subscription Plans (ZAR Pricing)

### Basic Plan - R99/month
- Access to Aida AI Tutor
- All CAPS curriculum subjects
- Basic Afrikaans learning
- 5 hours tutoring per month
- Email support

### Premium Plan - R199/month ⭐
- Everything in Basic Plan
- Unlimited tutoring hours
- Advanced language learning
- Personalized learning paths
- Progress tracking & reports
- Priority support
- Multimedia content support

### Annual Plan - R1999/year 🔥
- Everything in Premium Plan
- Save R389 per year (2 months free)
- Family sharing (up to 3 children)
- Offline content downloads
- Phone support

## 🛠 Technical Features

### Widget Features
- **Responsive Design** - Adapts to any container size
- **Auto-resize** - Dynamic height adjustment
- **Theme Integration** - Matches WordPress theme colors
- **Mobile Optimized** - Touch-friendly interface
- **Accessibility** - Keyboard navigation and screen reader support

### Payment Features
- **Secure Processing** - PayFast PCI compliant
- **Signature Verification** - Prevents payment tampering
- **Automatic Activation** - Instant subscription access
- **Cancel Anytime** - User-friendly cancellation
- **Failed Payment Handling** - Graceful error messages

### AI Tutor Features
- **CAPS Curriculum Aligned** - South African education standards
- **Multilingual Support** - English explanations for Afrikaans learning
- **Visual Learning** - Image and video analysis
- **Scaffolded Teaching** - Guides discovery rather than giving answers
- **Progress Tracking** - Monitors learning journey

## 📱 Example Usage Scenarios

### 1. Mathematics Help Page
```html
<h2>Grade 8 Mathematics Tutor</h2>
<p>Get personalized help with algebra, geometry, and more!</p>
[aida_tutor grade="8" subject="mathematics" height="600px"]
```

### 2. Afrikaans Learning Section
```html
<h2>Learn Afrikaans with Aida</h2>
<p>Master Afrikaans with English explanations and cultural context.</p>
[aida_tutor grade="7" subject="afrikaans" height="700px"]
```

### 3. Multi-Grade Support Page
```html
<h2>Choose Your Grade</h2>
<div class="tutor-options">
  <div class="grade-option">
    <h3>Primary School (Grades 1-7)</h3>
    [aida_tutor grade="4" subject="english" height="500px"]
  </div>
  <div class="grade-option">
    <h3>High School (Grades 8-12)</h3>
    [aida_tutor grade="10" subject="mathematics" height="600px"]
  </div>
</div>
```

## 🔧 Customization Options

### CSS Customization
```css
/* Match your brand colors */
.aida-tutor-container {
  --primary-color: #your-brand-color;
  --border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

/* Custom subscription button */
.aida-subscribe-btn {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

### JavaScript Hooks
```javascript
// Listen for widget events
window.addEventListener('message', function(event) {
  if (event.data.type === 'aida_subscription_success') {
    // Track conversion
    gtag('event', 'purchase', {
      transaction_id: event.data.subscriptionId,
      value: event.data.amount,
      currency: 'ZAR'
    });
  }
});
```

## 📊 Analytics & Tracking

### Recommended Tracking Events
- Widget loads
- Subscription starts
- Payment completions
- User engagement time
- Subject preferences

### Google Analytics Setup
```javascript
// Track widget interactions
gtag('event', 'aida_widget_interaction', {
  'event_category': 'Education',
  'event_label': 'AI Tutor',
  'grade': grade,
  'subject': subject
});
```

## 🚨 Troubleshooting

### Common Issues

**Widget Not Loading**
- Check widget URL in WordPress settings
- Verify SSL certificate is valid
- Test CORS configuration

**Payment Failures**
- Confirm PayFast credentials are correct
- Check minimum amount (R5.00)
- Verify webhook URLs are accessible

**Subscription Not Activating**
- Check PayFast webhook logs
- Verify signature validation
- Test notification endpoint manually

### Support Checklist
- [ ] Widget URL accessible
- [ ] PayFast credentials correct
- [ ] Webhook URLs working
- [ ] SSL certificate valid
- [ ] Environment variables set
- [ ] WordPress plugin activated

## 🔒 Security Best Practices

1. **Environment Variables** - Never expose API keys in frontend
2. **HTTPS Only** - All communication encrypted
3. **Webhook Verification** - PayFast signatures validated
4. **Input Sanitization** - All user inputs cleaned
5. **CORS Configuration** - Restricted to your domain
6. **Regular Updates** - Keep dependencies current

## 📈 Marketing Integration

### Pricing Page Example
```html
<div class="pricing-section">
  <h2>Choose Your Learning Plan</h2>
  <div class="pricing-grid">
    <div class="pricing-card">
      <h3>Basic Plan</h3>
      <p class="price">R99<span>/month</span></p>
      <ul>
        <li>5 hours tutoring</li>
        <li>All CAPS subjects</li>
        <li>Email support</li>
      </ul>
      <button onclick="openSubscription('basic')">Start Learning</button>
    </div>
    <!-- More pricing cards -->
  </div>
  <div class="try-demo">
    <h3>Try Before You Buy</h3>
    [aida_tutor grade="7" subject="mathematics" height="400px"]
  </div>
</div>
```

## 🎉 Launch Checklist

### Pre-Launch
- [ ] Domain configured (tutor.helloaida.ai)
- [ ] SSL certificate installed
- [ ] PayFast account verified
- [ ] WordPress plugin installed and configured
- [ ] Test payments in sandbox
- [ ] Widget responsive on mobile

### Launch Day
- [ ] Switch PayFast to live mode
- [ ] Update environment variables
- [ ] Test live payments
- [ ] Monitor error logs
- [ ] Set up analytics tracking

### Post-Launch
- [ ] Monitor subscription conversions
- [ ] Collect user feedback
- [ ] Optimize widget placement
- [ ] A/B test subscription flow
- [ ] Scale infrastructure as needed

## 📞 Next Steps

1. **Deploy the application** to your preferred hosting platform
2. **Configure PayFast** with your merchant credentials  
3. **Install WordPress plugin** on helloaida.ai
4. **Test the integration** with sandbox payments
5. **Launch with live payments** once everything works

Your Aida AI Tutor is now ready to help South African students learn with personalized, curriculum-aligned education powered by AI and secured by local payment processing!

---

**Need Help?** 
- Test all features in sandbox mode first
- Keep environment variables secure
- Monitor webhook logs for payment issues
- Start with a simple shortcode and expand from there