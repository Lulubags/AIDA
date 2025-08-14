# Aida AI Tutor - WordPress Integration Guide

## Overview
This package provides complete WordPress integration for the Aida AI Tutor bot, including PayFast payment gateway integration for South African users.

## Package Contents
- `aida-widget.php` - Main WordPress plugin file
- `aida-widget.js` - Frontend JavaScript for widget functionality
- `aida-widget.css` - Responsive CSS styling
- `README.md` - This integration guide

## Prerequisites
- WordPress 5.0 or higher
- PHP 7.4 or higher
- Active PayFast merchant account
- Hosted Aida AI Tutor application

## Installation Steps

### 1. Deploy Your Aida AI Tutor Application
First, deploy your Aida tutor application using one of these methods:

**Option A: VPS Deployment (Recommended)**
```bash
# On your Ubuntu/Debian server
git clone <your-aida-repo>
cd <your-project>
npm install
npm run build

# Set environment variables
echo "NODE_ENV=production" > .env
echo "OPENAI_API_KEY=your_openai_key" >> .env
echo "PAYFAST_MERCHANT_ID=your_merchant_id" >> .env
echo "PAYFAST_MERCHANT_KEY=your_merchant_key" >> .env
echo "PAYFAST_PASSPHRASE=your_passphrase" >> .env
echo "BASE_URL=https://yourdomain.com" >> .env

# Start with PM2
pm2 start npm --name "aida-tutor" -- start
pm2 save
```

**Option B: Railway/Vercel Deployment**
- Connect your GitHub repository
- Set the required environment variables
- Deploy automatically

### 2. Install WordPress Plugin

**Method 1: Direct Upload**
1. Zip the `wordpress-integration` folder
2. Go to WordPress Admin → Plugins → Add New → Upload Plugin
3. Upload the zip file and activate

**Method 2: Manual Installation**
1. Copy files to `/wp-content/plugins/aida-tutor/`
2. Go to WordPress Admin → Plugins
3. Activate "Aida AI Tutor Widget"

### 3. Configure Plugin Settings
1. Go to WordPress Admin → Settings → Aida AI Tutor
2. Set your widget URL (where your Aida app is hosted)
3. Enter your PayFast Merchant ID
4. Save settings

### 4. PayFast Configuration
1. Login to your PayFast dashboard
2. Go to Settings → Integration
3. Add your return URLs:
   - Return URL: `https://yourdomain.com/subscription/success`
   - Cancel URL: `https://yourdomain.com/subscription/cancelled`
   - Notify URL: `https://yourdomain.com/api/payfast/notify`
4. Set your passphrase (same as in your environment variables)

## Usage

### Basic Shortcode
Add Aida to any post or page:
```
[aida_tutor]
```

### Advanced Shortcode Options
```
[aida_tutor grade="8" subject="afrikaans" height="700px" theme="light"]
```

### Available Parameters
- `grade` - Student grade (1-12), default: 7
- `subject` - Subject (mathematics, english, afrikaans, etc.), default: mathematics
- `height` - Widget height, default: 600px
- `width` - Widget width, default: 100%
- `theme` - Color theme (light/dark), default: light

### PHP Template Integration
For theme developers:
```php
// In your theme template
echo do_shortcode('[aida_tutor grade="9" subject="mathematics"]');
```

### Block Editor
The shortcode works in the WordPress Block Editor - just add a Shortcode block and enter your shortcode.

## Customization

### Styling
Modify `aida-widget.css` to match your website theme:
```css
.aida-tutor-container {
    /* Your custom styles */
}
```

### JavaScript Hooks
Add custom functionality:
```javascript
// Listen for Aida events
window.addEventListener('message', function(event) {
    if (event.data.type === 'aida_subscription_success') {
        // Handle subscription success
        console.log('User subscribed!');
    }
});
```

## Security Considerations

### Environment Variables
Never expose these in your frontend:
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `OPENAI_API_KEY`

### PayFast Webhook Security
The plugin automatically verifies PayFast signatures to prevent tampering.

### CORS Configuration
Ensure your Aida app allows iframe embedding from your WordPress site.

## Subscription Plans

### Default Plans (South African Pricing)
- **Basic Plan**: R99/month - 5 hours tutoring, email support
- **Premium Plan**: R199/month - Unlimited tutoring, advanced features
- **Annual Plan**: R1999/year - Premium features + family sharing

### Customizing Plans
Modify `shared/payfast-schema.ts` in your Aida application:
```typescript
export const defaultPlans: SubscriptionPlan[] = [
  {
    id: "custom",
    name: "Custom Plan", 
    price: 149,
    currency: "ZAR",
    interval: "monthly",
    features: ["Custom feature 1", "Custom feature 2"],
    active: true
  }
];
```

## Troubleshooting

### Widget Not Loading
1. Check if the widget URL is correct in WordPress settings
2. Verify your Aida app is running and accessible
3. Check browser console for JavaScript errors
4. Ensure CORS is configured properly

### Payment Issues
1. Verify PayFast merchant credentials
2. Check that notify URL is accessible
3. Confirm webhook endpoint is receiving notifications
4. Test in PayFast sandbox first

### Subscription Not Activating
1. Check PayFast webhook logs
2. Verify signature validation is working
3. Ensure your notification endpoint is processing payments correctly

### Common Error Messages

**"Widget failed to load"**
- Check network connectivity
- Verify the widget URL is accessible
- Check for JavaScript errors

**"Payment processing failed"**
- Verify PayFast credentials
- Check minimum payment amount (R5.00)
- Ensure all required fields are filled

**"Invalid signature"**
- Check PayFast passphrase matches your environment variable
- Verify webhook URL is correct

## Support and Maintenance

### Updates
Update the plugin by:
1. Replace the plugin files with new versions
2. Reactivate the plugin if needed
3. Clear any caching

### Monitoring
Monitor these metrics:
- Widget load times
- Subscription conversion rates
- Payment success rates
- User engagement

### Backup
Always backup before updates:
- WordPress database
- Plugin files
- Environment variables

## Advanced Features

### Multiple Widgets
You can embed multiple widgets on the same page:
```
[aida_tutor grade="7" subject="mathematics"]
[aida_tutor grade="8" subject="afrikaans"]
```

### Custom Branding
Customize the widget appearance by modifying the CSS:
```css
.aida-tutor-container {
    --primary-color: #your-brand-color;
    --border-radius: 8px;
}
```

### Analytics Integration
Track widget usage with Google Analytics:
```javascript
// Add to your theme
gtag('event', 'aida_widget_loaded', {
    'event_category': 'Education',
    'event_label': 'AI Tutor'
});
```

## API Reference

### WordPress Hooks
```php
// Customize widget before rendering
add_filter('aida_widget_config', function($config) {
    $config['custom_param'] = 'value';
    return $config;
});

// Handle subscription events
add_action('aida_subscription_complete', function($subscription_data) {
    // Custom handling
});
```

### JavaScript Events
```javascript
// Widget loaded
document.addEventListener('aidaWidgetLoaded', function(e) {
    console.log('Widget loaded:', e.detail.widgetId);
});

// Subscription started
document.addEventListener('aidaSubscriptionStarted', function(e) {
    console.log('Subscription:', e.detail.planId);
});
```

## License
GPL v2 or later - Compatible with WordPress licensing

## Support
For technical support:
1. Check this documentation
2. Review error logs
3. Test in staging environment
4. Contact Aida support team

---

**Note**: This integration is specifically designed for South African users with PayFast payment processing. For other regions, you may need to modify the payment gateway integration.