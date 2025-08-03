import { loadStripe } from '@stripe/stripe-js';
import { apiCall } from './auth';

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

export async function createPaymentSession() {
  try {
    const response = await apiCall('/payment/create-session', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create payment session');
    }

    const { clientSecret } = await response.json();
    return clientSecret;
  } catch (error) {
    console.error('Payment session error:', error);
    throw error;
  }
}

export async function processPayment(clientSecret: string) {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe not loaded');

  const { error } = await stripe.confirmPayment({
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/payment/success`,
    },
  });

  if (error) {
    throw error;
  }
}