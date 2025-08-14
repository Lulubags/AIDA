<?php
/**
 * Plugin Name: Aida AI Tutor Widget
 * Plugin URI: https://helloaida.ai
 * Description: Embeddable AI tutor widget for WordPress integration
 * Version: 1.0.0
 * Author: Aida AI
 * License: GPL v2 or later
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class AidaAITutorWidget {
    
    private $widget_url = 'https://your-aida-app-url.com'; // Replace with your actual URL
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('aida_tutor', array($this, 'render_widget'));
        add_action('wp_ajax_aida_subscription', array($this, 'handle_subscription_ajax'));
        add_action('wp_ajax_nopriv_aida_subscription', array($this, 'handle_subscription_ajax'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script(
            'aida-widget-js',
            plugin_dir_url(__FILE__) . 'aida-widget.js',
            array('jquery'),
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'aida-widget-css',
            plugin_dir_url(__FILE__) . 'aida-widget.css',
            array(),
            '1.0.0'
        );
        
        wp_localize_script('aida-widget-js', 'aida_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('aida_nonce'),
            'widget_url' => $this->widget_url
        ));
    }
    
    public function render_widget($atts) {
        $atts = shortcode_atts(array(
            'height' => '600px',
            'width' => '100%',
            'theme' => 'light',
            'grade' => '7',
            'subject' => 'mathematics'
        ), $atts);
        
        $widget_id = 'aida-widget-' . uniqid();
        
        ob_start();
        ?>
        <div class="aida-tutor-container">
            <div id="<?php echo esc_attr($widget_id); ?>" 
                 class="aida-tutor-widget" 
                 data-height="<?php echo esc_attr($atts['height']); ?>"
                 data-width="<?php echo esc_attr($atts['width']); ?>"
                 data-theme="<?php echo esc_attr($atts['theme']); ?>"
                 data-grade="<?php echo esc_attr($atts['grade']); ?>"
                 data-subject="<?php echo esc_attr($atts['subject']); ?>">
                
                <!-- Loading State -->
                <div class="aida-loading">
                    <div class="aida-spinner"></div>
                    <p>Loading Aida AI Tutor...</p>
                </div>
                
                <!-- Fallback for no-js -->
                <noscript>
                    <div class="aida-no-js">
                        <p>This widget requires JavaScript to function properly.</p>
                        <a href="<?php echo esc_url($this->widget_url); ?>" target="_blank" class="aida-fallback-link">
                            Open Aida AI Tutor in new window
                        </a>
                    </div>
                </noscript>
            </div>
            
            <!-- Subscription CTA -->
            <div class="aida-subscription-banner" style="display: none;">
                <div class="aida-banner-content">
                    <h3>🎓 Unlock Full Access to Aida AI Tutor</h3>
                    <p>Get unlimited tutoring, personalized learning paths, and premium features!</p>
                    <button class="aida-subscribe-btn" data-plan="premium">
                        Subscribe Now - From R99/month
                    </button>
                </div>
            </div>
        </div>
        
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Initialize Aida Widget
            initAidaWidget('<?php echo esc_js($widget_id); ?>');
            
            // Handle subscription
            $('.aida-subscribe-btn').on('click', function() {
                var plan = $(this).data('plan');
                openSubscriptionModal(plan);
            });
        });
        </script>
        <?php
        return ob_get_clean();
    }
    
    public function handle_subscription_ajax() {
        check_ajax_referer('aida_nonce', 'nonce');
        
        $plan_id = sanitize_text_field($_POST['plan_id']);
        $user_details = array(
            'firstName' => sanitize_text_field($_POST['first_name']),
            'lastName' => sanitize_text_field($_POST['last_name']),
            'email' => sanitize_email($_POST['email']),
            'phone' => sanitize_text_field($_POST['phone'])
        );
        
        // Forward to your Aida backend
        $response = wp_remote_post($this->widget_url . '/api/subscription/create-payment', array(
            'body' => json_encode(array(
                'planId' => $plan_id,
                'userDetails' => $user_details
            )),
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('Failed to create payment');
        } else {
            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);
            wp_send_json_success($data);
        }
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Aida AI Tutor Settings',
            'Aida AI Tutor',
            'manage_options',
            'aida-settings',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('aida_widget_url', sanitize_url($_POST['widget_url']));
            update_option('aida_payfast_merchant_id', sanitize_text_field($_POST['payfast_merchant_id']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $widget_url = get_option('aida_widget_url', $this->widget_url);
        $merchant_id = get_option('aida_payfast_merchant_id', '');
        ?>
        <div class="wrap">
            <h1>Aida AI Tutor Settings</h1>
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">Widget URL</th>
                        <td>
                            <input type="url" name="widget_url" value="<?php echo esc_attr($widget_url); ?>" class="regular-text" />
                            <p class="description">URL where your Aida AI Tutor is hosted</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">PayFast Merchant ID</th>
                        <td>
                            <input type="text" name="payfast_merchant_id" value="<?php echo esc_attr($merchant_id); ?>" class="regular-text" />
                            <p class="description">Your PayFast merchant ID for payments</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <h2>Usage</h2>
            <p>Add the Aida AI Tutor to any post or page using the shortcode:</p>
            <code>[aida_tutor grade="7" subject="mathematics" height="600px"]</code>
            
            <h3>Shortcode Parameters:</h3>
            <ul>
                <li><strong>grade</strong> - Student grade (1-12), default: 7</li>
                <li><strong>subject</strong> - Subject area, default: mathematics</li>
                <li><strong>height</strong> - Widget height, default: 600px</li>
                <li><strong>width</strong> - Widget width, default: 100%</li>
                <li><strong>theme</strong> - light or dark, default: light</li>
            </ul>
        </div>
        <?php
    }
}

// Initialize the plugin
new AidaAITutorWidget();

// Activation hook
register_activation_hook(__FILE__, function() {
    // Set default options
    add_option('aida_widget_url', 'https://your-aida-app-url.com');
    add_option('aida_payfast_merchant_id', '');
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    // Clean up if needed
});
?>