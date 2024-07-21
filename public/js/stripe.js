import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Pc3ZlK4EnO28QBVYBRgSx5MZa7C7nQeYSXYJWvvFuzWkh73f3NE8PIDihlT1yxAg8DTvAK1w7JZC3fOUkgarsht00wDJyupFE'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);
    // NAVU
    if (!session.data || !session.data.session) {
      throw new Error('Session data is missing or invalid');
    }
    // console.log(session);
    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
