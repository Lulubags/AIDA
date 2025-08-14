import { z } from "zod";

// PayFast subscription plans
export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string().default("ZAR"),
  interval: z.enum(["monthly", "yearly"]),
  features: z.array(z.string()),
  active: z.boolean().default(true)
});

export const subscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  status: z.enum(["active", "inactive", "cancelled", "pending"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  payfastToken: z.string().optional(),
  payfastSubscriptionId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// PayFast payment schemas
export const payfastPaymentSchema = z.object({
  merchant_id: z.string(),
  merchant_key: z.string(),
  return_url: z.string(),
  cancel_url: z.string(),
  notify_url: z.string(),
  name_first: z.string(),
  name_last: z.string(),
  email_address: z.string().email(),
  cell_number: z.string().optional(),
  amount: z.number(),
  item_name: z.string(),
  item_description: z.string(),
  subscription_type: z.enum(["1", "2"]).optional(), // 1 = subscription, 2 = ad-hoc
  billing_date: z.string().optional(),
  recurring_amount: z.number().optional(),
  frequency: z.enum(["3", "6"]).optional(), // 3 = monthly, 6 = annual
  cycles: z.string().optional()
});

export const payfastNotificationSchema = z.object({
  m_payment_id: z.string(),
  pf_payment_id: z.string(),
  payment_status: z.string(),
  item_name: z.string(),
  amount_gross: z.string(),
  amount_fee: z.string(),
  amount_net: z.string(),
  custom_str1: z.string().optional(),
  custom_str2: z.string().optional(),
  name_first: z.string(),
  name_last: z.string(),
  email_address: z.string(),
  merchant_id: z.string(),
  signature: z.string()
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type PayFastPayment = z.infer<typeof payfastPaymentSchema>;
export type PayFastNotification = z.infer<typeof payfastNotificationSchema>;

// Default subscription plans for South African market
export const defaultPlans: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 99,
    currency: "ZAR",
    interval: "monthly",
    features: [
      "Access to Aida AI Tutor",
      "All CAPS curriculum subjects",
      "Basic language learning (Afrikaans)",
      "5 hours of tutoring per month",
      "Email support"
    ],
    active: true
  },
  {
    id: "premium",
    name: "Premium Plan", 
    price: 199,
    currency: "ZAR",
    interval: "monthly",
    features: [
      "Everything in Basic Plan",
      "Unlimited tutoring hours",
      "Advanced language learning",
      "Personalized learning paths",
      "Progress tracking & reports",
      "Priority support",
      "Multimedia content support"
    ],
    active: true
  },
  {
    id: "annual",
    name: "Annual Plan",
    price: 1999,
    currency: "ZAR", 
    interval: "yearly",
    features: [
      "Everything in Premium Plan",
      "2 months free (R2388 value for R1999)",
      "Family sharing (up to 3 children)",
      "Offline content downloads",
      "Phone support"
    ],
    active: true
  }
];