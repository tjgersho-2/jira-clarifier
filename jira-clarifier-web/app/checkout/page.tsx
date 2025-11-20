'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, Shield, Zap, Users, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  const preSelectedPlan = searchParams.get('plan') || 'pro';

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: '/month',
      description: 'Try Jira Clarifier',
      features: [
        '5 clarifications per month',
        'Basic acceptance criteria',
        'Edge cases detection',
        'Community support'
      ],
      cta: 'Start Free',
      highlight: false,
      priceId: null,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      period: ' one-time',
      description: 'Perfect for individual developers',
      features: [
        'Unlimited clarifications',
        'Advanced AI analysis',
        'Test scenarios generation',
        'Success metrics tracking',
        'Priority email support',
        '1-year license key'
      ],
      cta: 'Get Pro - $29',
      highlight: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
      popular: true
    },
    {
      id: 'team',
      name: 'Team',
      price: 79,
      period: ' one-time',
      description: 'For growing engineering teams',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        'Team analytics dashboard',
        'Custom AI training',
        'Slack integration',
        '1-year team license'
      ],
      cta: 'Get Team - $79',
      highlight: false,
      priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      period: '',
      description: 'Custom solutions for large orgs',
      features: [
        'Everything in Team',
        'Unlimited team members',
        'SSO & SCIM provisioning',
        'SOC2, GDPR compliance',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      highlight: false,
      priceId: null,
      popular: false
    }
  ];

  const handleCheckout = async (planId: string, priceId: string | null) => {
    if (!priceId) {
      if (planId === 'free') {
        // For free plan, redirect to install Forge app
        window.location.href = 'https://developer.atlassian.com/console/install/bada8dda-801f-4a83-84eb-efd1800033a0?signature=...'; // Your Forge install URL
        return;
      }
      if (planId === 'enterprise') {
        window.location.href = 'mailto:sales@jiraclarifier.com?subject=Enterprise%20Inquiry';
        return;
      }
      return;
    }

    setIsLoading(planId);

    try {
      // Call API to create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          planId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Jira Clarifier
            </a>
            <Button variant="ghost" className="text-slate-300" onClick={() => window.location.href = '/'}>
              ← Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-6 px-4 py-2 bg-indigo-500/10 border-indigo-500/30 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Simple, One-Time Payment
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h1>
          
          <p className="text-xl text-slate-300 leading-relaxed">
            Buy once, use forever. No subscriptions, no recurring charges.
          </p>

          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300">
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              After purchase, you'll receive a license key via email
            </p>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative"
            >
              {plan.popular && (
                <>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-lg opacity-75" />
                  <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 border-0 z-20">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </>
              )}
              
              <Card className={`relative p-8 h-full bg-slate-900/90 backdrop-blur-xl ${
                plan.highlight 
                  ? 'border-indigo-500/50' 
                  : 'border-slate-800'
              }`}>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-slate-400">{plan.period}</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-white">Custom</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleCheckout(plan.id, plan.priceId || null)}
                  disabled={isLoading === plan.id}
                  className={`w-full h-12 ${
                    plan.highlight 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                      : ''
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {isLoading === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-10 h-10 text-indigo-400" />
              <h4 className="font-semibold text-white">Secure Payments</h4>
              <p className="text-sm text-slate-400">Powered by Stripe</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="w-10 h-10 text-purple-400" />
              <h4 className="font-semibold text-white">4,872+ Users</h4>
              <p className="text-sm text-slate-400">Trust Jira Clarifier</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-10 h-10 text-pink-400" />
              <h4 className="font-semibold text-white">Instant Delivery</h4>
              <p className="text-sm text-slate-400">Key sent via email</p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">30-Day Money-Back Guarantee</h3>
            <p className="text-slate-300">
              Not satisfied? Get a full refund within 30 days, no questions asked.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 relative z-10 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 Jira Clarifier. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/terms" className="text-slate-400 hover:text-white transition">Terms</a>
              <a href="/privacy" className="text-slate-400 hover:text-white transition">Privacy</a>
              <a href="mailto:support@jiraclarifier.com" className="text-slate-400 hover:text-white transition">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}