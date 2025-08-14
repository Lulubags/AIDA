/**
 * Aida AI Tutor WordPress Widget JavaScript
 * Handles widget initialization, iframe communication, and subscription flow
 */

let aidaWidgets = {};

function initAidaWidget(widgetId) {
    const container = document.getElementById(widgetId);
    if (!container) {
        console.error('Aida Widget container not found:', widgetId);
        return;
    }
    
    const config = {
        height: container.dataset.height || '600px',
        width: container.dataset.width || '100%',
        theme: container.dataset.theme || 'light',
        grade: container.dataset.grade || '7',
        subject: container.dataset.subject || 'mathematics'
    };
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = `${widgetId}-frame`;
    iframe.src = `${aida_ajax.widget_url}?grade=${config.grade}&subject=${config.subject}&theme=${config.theme}&embedded=true`;
    iframe.style.width = config.width;
    iframe.style.height = config.height;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    iframe.allow = 'microphone; camera; clipboard-write';
    iframe.loading = 'lazy';
    
    // Add resize listener for responsive behavior
    iframe.onload = function() {
        // Hide loading state
        const loading = container.querySelector('.aida-loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Show iframe
        iframe.style.opacity = '1';
        
        // Setup post-message communication
        setupPostMessageListener(widgetId, iframe);
        
        // Check if subscription banner should be shown
        setTimeout(() => {
            checkSubscriptionStatus(widgetId);
        }, 5000);
    };
    
    // Initially hide iframe
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.3s ease-in-out';
    
    // Replace loading content with iframe
    container.appendChild(iframe);
    
    // Store widget reference
    aidaWidgets[widgetId] = {
        iframe: iframe,
        config: config,
        container: container
    };
    
    // Make widget responsive
    makeWidgetResponsive(widgetId);
}

function setupPostMessageListener(widgetId, iframe) {
    window.addEventListener('message', function(event) {
        // Security check - ensure message is from our widget
        if (event.origin !== new URL(aida_ajax.widget_url).origin) {
            return;
        }
        
        const data = event.data;
        
        switch (data.type) {
            case 'aida_resize':
                if (data.widgetId === widgetId) {
                    iframe.style.height = data.height + 'px';
                }
                break;
                
            case 'aida_subscription_needed':
                showSubscriptionBanner(widgetId);
                break;
                
            case 'aida_subscription_success':
                hideSubscriptionBanner(widgetId);
                // Optionally reload widget to reflect new subscription status
                setTimeout(() => {
                    iframe.src = iframe.src; // Reload iframe
                }, 2000);
                break;
                
            case 'aida_share_content':
                // Handle content sharing if needed
                handleContentShare(data.content);
                break;
        }
    });
}

function makeWidgetResponsive(widgetId) {
    const widget = aidaWidgets[widgetId];
    if (!widget) return;
    
    function adjustSize() {
        const containerWidth = widget.container.offsetWidth;
        
        if (containerWidth < 480) {
            // Mobile optimization
            widget.iframe.style.height = '500px';
            widget.container.classList.add('aida-mobile');
        } else if (containerWidth < 768) {
            // Tablet optimization  
            widget.iframe.style.height = '550px';
            widget.container.classList.add('aida-tablet');
        } else {
            // Desktop
            widget.iframe.style.height = widget.config.height;
            widget.container.classList.remove('aida-mobile', 'aida-tablet');
        }
    }
    
    // Initial adjustment
    adjustSize();
    
    // Listen for window resize
    window.addEventListener('resize', adjustSize);
}

function checkSubscriptionStatus(widgetId) {
    // Check if user has active subscription
    // This could be done via WordPress user meta or external API call
    const hasActiveSubscription = checkLocalSubscriptionStatus();
    
    if (!hasActiveSubscription) {
        // Show subscription banner after some interaction time
        setTimeout(() => {
            showSubscriptionBanner(widgetId);
        }, 30000); // Show after 30 seconds of use
    }
}

function checkLocalSubscriptionStatus() {
    // Check localStorage for subscription info
    const subscriptionData = localStorage.getItem('aida_subscription');
    if (!subscriptionData) return false;
    
    try {
        const data = JSON.parse(subscriptionData);
        const expiryDate = new Date(data.expiryDate);
        return expiryDate > new Date();
    } catch (e) {
        return false;
    }
}

function showSubscriptionBanner(widgetId) {
    const widget = aidaWidgets[widgetId];
    if (!widget) return;
    
    const banner = widget.container.querySelector('.aida-subscription-banner');
    if (banner) {
        banner.style.display = 'block';
        banner.style.animation = 'slideInFromBottom 0.5s ease-out';
    }
}

function hideSubscriptionBanner(widgetId) {
    const widget = aidaWidgets[widgetId];
    if (!widget) return;
    
    const banner = widget.container.querySelector('.aida-subscription-banner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function openSubscriptionModal(planId) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'aida-subscription-overlay';
    overlay.innerHTML = `
        <div class="aida-subscription-modal">
            <div class="aida-modal-header">
                <h2>🎓 Subscribe to Aida AI Tutor</h2>
                <button class="aida-modal-close">&times;</button>
            </div>
            <div class="aida-modal-body">
                <form id="aida-subscription-form">
                    <div class="aida-form-group">
                        <label for="aida-first-name">First Name *</label>
                        <input type="text" id="aida-first-name" name="first_name" required>
                    </div>
                    <div class="aida-form-group">
                        <label for="aida-last-name">Last Name *</label>
                        <input type="text" id="aida-last-name" name="last_name" required>
                    </div>
                    <div class="aida-form-group">
                        <label for="aida-email">Email Address *</label>
                        <input type="email" id="aida-email" name="email" required>
                    </div>
                    <div class="aida-form-group">
                        <label for="aida-phone">Phone Number</label>
                        <input type="tel" id="aida-phone" name="phone" placeholder="0821234567">
                    </div>
                    <div class="aida-plan-info">
                        <h3>Selected Plan: <span id="selected-plan-name"></span></h3>
                        <p id="selected-plan-price"></p>
                    </div>
                    <button type="submit" class="aida-subscribe-button">
                        <span class="button-text">Continue to Payment</span>
                        <span class="button-loading" style="display: none;">Processing...</span>
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Populate plan information
    populatePlanInfo(planId);
    
    // Event listeners
    overlay.querySelector('.aida-modal-close').addEventListener('click', closeSubscriptionModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeSubscriptionModal();
    });
    
    document.getElementById('aida-subscription-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSubscriptionSubmit(planId);
    });
    
    // Show modal with animation
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
}

function populatePlanInfo(planId) {
    const plans = {
        'basic': { name: 'Basic Plan', price: 'R99/month' },
        'premium': { name: 'Premium Plan', price: 'R199/month' },
        'annual': { name: 'Annual Plan', price: 'R1999/year (Save R389!)' }
    };
    
    const plan = plans[planId] || plans['premium'];
    document.getElementById('selected-plan-name').textContent = plan.name;
    document.getElementById('selected-plan-price').textContent = plan.price;
}

function closeSubscriptionModal() {
    const overlay = document.querySelector('.aida-subscription-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
}

function handleSubscriptionSubmit(planId) {
    const form = document.getElementById('aida-subscription-form');
    const formData = new FormData(form);
    const button = form.querySelector('.aida-subscribe-button');
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');
    
    // Show loading state
    button.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'inline';
    
    // Submit to WordPress AJAX
    jQuery.ajax({
        url: aida_ajax.ajax_url,
        type: 'POST',
        data: {
            action: 'aida_subscription',
            nonce: aida_ajax.nonce,
            plan_id: planId,
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone')
        },
        success: function(response) {
            if (response.success) {
                // Redirect to PayFast
                const paymentData = response.data.paymentData;
                createPaymentForm(paymentData);
            } else {
                alert('Error: ' + (response.data || 'Failed to create payment'));
                resetSubmitButton(button, buttonText, buttonLoading);
            }
        },
        error: function() {
            alert('Network error. Please try again.');
            resetSubmitButton(button, buttonText, buttonLoading);
        }
    });
}

function resetSubmitButton(button, buttonText, buttonLoading) {
    button.disabled = false;
    buttonText.style.display = 'inline';
    buttonLoading.style.display = 'none';
}

function createPaymentForm(paymentData) {
    // Create hidden form for PayFast submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.merchant_id.includes('sandbox') || paymentData.merchant_id === '10000100' 
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';
    form.target = '_blank';
    
    // Add all payment fields
    for (const [key, value] of Object.entries(paymentData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    // Close modal
    closeSubscriptionModal();
    
    // Show success message
    setTimeout(() => {
        alert('Redirecting to PayFast for secure payment...');
    }, 1000);
}

function handleContentShare(content) {
    // Handle sharing of widget content (optional feature)
    if (navigator.share) {
        navigator.share({
            title: 'Check out what I learned with Aida AI Tutor!',
            text: content.text,
            url: window.location.href
        });
    } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(content.text).then(() => {
            alert('Content copied to clipboard!');
        });
    }
}

// Initialize widgets when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Auto-initialize any widgets found on page
    const widgets = document.querySelectorAll('.aida-tutor-widget');
    widgets.forEach(widget => {
        if (widget.id && !aidaWidgets[widget.id]) {
            initAidaWidget(widget.id);
        }
    });
});

// Keyboard shortcuts for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSubscriptionModal();
    }
});