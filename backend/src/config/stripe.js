import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
    throw new Error(
        'Stripe secret key not found in environment variables. Please check your .env file.'
    )
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-07-30.basil',
})

export default stripe
