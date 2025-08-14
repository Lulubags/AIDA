import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Zap, Star, Users } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  active: boolean;
}

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userId?: string;
}

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  const { toast } = useToast();

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription/plans"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/subscription/plans");
      return response.json();
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: { planId: string; userDetails: UserDetails }) => {
      const response = await apiRequest("POST", "/api/subscription/create-payment", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Create and submit PayFast form
      const form = document.createElement('div');
      form.innerHTML = data.paymentForm;
      document.body.appendChild(form);
      const formElement = form.querySelector('form') as HTMLFormElement;
      if (formElement) {
        formElement.submit();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create payment",
        variant: "destructive"
      });
    }
  });

  const handleSubscribe = (planId: string) => {
    if (!userDetails.firstName || !userDetails.lastName || !userDetails.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlan(planId);
    createPaymentMutation.mutate({ planId, userDetails });
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="w-6 h-6 text-blue-500" />;
      case 'premium': return <Star className="w-6 h-6 text-purple-500" />;
      case 'annual': return <Users className="w-6 h-6 text-green-500" />;
      default: return <Zap className="w-6 h-6 text-gray-500" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'border-blue-200 hover:border-blue-300';
      case 'premium': return 'border-purple-200 hover:border-purple-300 ring-2 ring-purple-100';
      case 'annual': return 'border-green-200 hover:border-green-300';
      default: return 'border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Aida AI Tutor Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock personalized learning with South Africa's premier AI tutor, 
            designed for CAPS curriculum and specialized in second-language learning.
          </p>
        </div>

        {/* User Details Form */}
        <Card className="max-w-md mx-auto mb-12">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Enter your details to continue with subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={userDetails.firstName}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={userDetails.lastName}
                  onChange={(e) => setUserDetails(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={userDetails.email}
                onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                value={userDetails.phone || ""}
                onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. 0821234567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan) => (
            <Card key={plan.id} className={`relative ${getPlanColor(plan.id)} transition-all duration-200`}>
              {plan.id === 'premium' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    R{plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.interval}
                  </span>
                </CardDescription>
                {plan.id === 'annual' && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Save R389/year
                  </Badge>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={createPaymentMutation.isPending || selectedPlan === plan.id}
                  className={`w-full ${plan.id === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                >
                  {createPaymentMutation.isPending && selectedPlan === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing...
                    </div>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Why Choose Aida AI Tutor?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🇿🇦</span>
              </div>
              <h3 className="font-semibold mb-2">CAPS Curriculum Aligned</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Specifically designed for South African education standards
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗣️</span>
              </div>
              <h3 className="font-semibold mb-2">Language Learning Expert</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Specialized in Afrikaans and second-language acquisition
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Personalized Learning</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Adaptive teaching methodology tailored to each student
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Secure payments powered by PayFast • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}