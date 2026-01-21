import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("❌ STRIPE_SECRET_KEY não configurada no .env");
}

// ✅ Não definir apiVersion aqui pra evitar erro de tipagem
export const stripe = new Stripe(stripeSecretKey);
