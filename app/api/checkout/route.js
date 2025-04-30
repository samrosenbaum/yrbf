import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: 'price_1RIwfVLuYP7uKnlpH45aRpkh',
        quantity: 1,
      },
    ],
    mode: 'subscription', 
    success_url: 'http://localhost:3000/chat?success=true',
    cancel_url: 'http://localhost:3000/chat?canceled=true',
  });

  return NextResponse.json({ url: session.url });
}
