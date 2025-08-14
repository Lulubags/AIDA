import crypto from 'crypto';
import { PayFastPayment, PayFastNotification } from '../shared/payfast-schema.js';

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passPhrase: string;
  sandbox: boolean;
}

export class PayFastService {
  private config: PayFastConfig;
  private baseUrl: string;

  constructor(config: PayFastConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  // Generate payment form data for PayFast
  generatePaymentData(paymentData: Partial<PayFastPayment>): PayFastPayment & { signature: string } {
    const data: PayFastPayment = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: paymentData.return_url || `${process.env.BASE_URL}/payment/success`,
      cancel_url: paymentData.cancel_url || `${process.env.BASE_URL}/payment/cancelled`,
      notify_url: paymentData.notify_url || `${process.env.BASE_URL}/api/payfast/notify`,
      name_first: paymentData.name_first || '',
      name_last: paymentData.name_last || '',
      email_address: paymentData.email_address || '',
      cell_number: paymentData.cell_number,
      amount: paymentData.amount || 0,
      item_name: paymentData.item_name || '',
      item_description: paymentData.item_description || '',
      subscription_type: paymentData.subscription_type,
      billing_date: paymentData.billing_date,
      recurring_amount: paymentData.recurring_amount,
      frequency: paymentData.frequency,
      cycles: paymentData.cycles
    };

    const signature = this.generateSignature(data);
    
    return {
      ...data,
      signature
    };
  }

  // Generate MD5 signature for PayFast
  private generateSignature(data: Record<string, any>): string {
    // Remove empty values and signature field
    const filteredData = Object.entries(data)
      .filter(([key, value]) => value !== '' && value !== undefined && key !== 'signature')
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    // Sort by key
    const sortedData = Object.keys(filteredData)
      .sort()
      .reduce((obj, key) => ({ ...obj, [key]: (filteredData as any)[key] }), {} as Record<string, any>);

    // Create query string
    const queryString = new URLSearchParams(sortedData as Record<string, string>).toString();
    
    // Add passphrase if provided
    const stringToSign = this.config.passPhrase 
      ? `${queryString}&passphrase=${encodeURIComponent(this.config.passPhrase)}`
      : queryString;

    // Generate MD5 hash
    return crypto.createHash('md5').update(stringToSign).digest('hex');
  }

  // Verify PayFast notification signature
  verifySignature(notification: PayFastNotification): boolean {
    const receivedSignature = notification.signature;
    const calculatedSignature = this.generateSignature(notification);
    
    return receivedSignature === calculatedSignature;
  }

  // Generate subscription payment data
  generateSubscriptionPayment(
    userDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    },
    plan: {
      name: string;
      description: string;
      amount: number;
      frequency: 'monthly' | 'yearly';
    },
    customData?: {
      userId?: string;
      planId?: string;
    }
  ) {
    const billingDate = new Date();
    billingDate.setDate(billingDate.getDate() + 1); // Start tomorrow

    return this.generatePaymentData({
      name_first: userDetails.firstName,
      name_last: userDetails.lastName,
      email_address: userDetails.email,
      cell_number: userDetails.phone,
      amount: plan.amount,
      item_name: plan.name,
      item_description: plan.description,
      subscription_type: "1", // Subscription
      billing_date: billingDate.toISOString().split('T')[0],
      recurring_amount: plan.amount,
      frequency: plan.frequency === 'monthly' ? "3" : "6", // 3 = monthly, 6 = annual
      cycles: "0", // 0 = indefinite
      return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/subscription/success`,
      cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/subscription/cancelled`,
      notify_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payfast/notify`
    });
  }

  // Generate payment form HTML
  generatePaymentForm(paymentData: PayFastPayment & { signature: string }): string {
    const formFields = Object.entries(paymentData)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    return `
      <form id="payfast-form" action="${this.baseUrl}" method="post">
        ${formFields}
        <input type="submit" value="Pay with PayFast" class="btn btn-primary" />
      </form>
      <script>
        // Auto-submit form after 3 seconds
        setTimeout(function() {
          document.getElementById('payfast-form').submit();
        }, 3000);
      </script>
    `;
  }

  // Validate payment amounts (PayFast requirements)
  validateAmount(amount: number): boolean {
    return amount >= 5.00; // Minimum R5.00
  }

  // Get payment status from PayFast API (for reconciliation)
  async getPaymentStatus(paymentId: string): Promise<any> {
    // This would typically make an API call to PayFast
    // For now, return a placeholder implementation
    return {
      status: 'pending',
      message: 'Payment status checking not implemented yet'
    };
  }
}