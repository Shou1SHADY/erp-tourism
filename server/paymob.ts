import axios from "axios";

const API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID_CARD;
const IFRAME_ID = process.env.PAYMOB_IFRAME_ID_CARD;
const HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;

const PAYMOB_BASE_URL = "https://egypt.paymob.com/api";

export async function getPaymobAuthToken() {
  if (!API_KEY) {
    console.warn("PAYMOB_API_KEY is missing");
    return "mock_auth_token";
  }
  const response = await axios.post(`${PAYMOB_BASE_URL}/auth/tokens`, {
    api_key: API_KEY,
  });
  return response.data.token;
}

export async function createPaymobOrder(authToken: string, amountCents: number, currency: string) {
  if (!API_KEY) {
    return { id: Math.floor(Math.random() * 1000000) };
  }
  const response = await axios.post(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    auth_token: authToken,
    delivery_needed: "false",
    amount_cents: amountCents,
    currency: currency,
    items: [],
  });
  return response.data;
}

export async function getPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  currency: string,
  customerData: { email: string; first_name: string; last_name: string; phone_number: string }
) {
  if (!API_KEY || !INTEGRATION_ID) {
    return "mock_payment_key";
  }
  const response = await axios.post(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    auth_token: authToken,
    amount_cents: amountCents,
    expiration: 3600,
    order_id: orderId,
    billing_data: {
      apartment: "NA",
      email: customerData.email,
      floor: "NA",
      first_name: customerData.first_name,
      street: "NA",
      building: "NA",
      phone_number: customerData.phone_number,
      shipping_method: "NA",
      postal_code: "NA",
      city: "NA",
      country: "NA",
      last_name: customerData.last_name,
      state: "NA",
    },
    currency: currency,
    integration_id: INTEGRATION_ID,
  });
  return response.data.token;
}

export function getPaymobIframeUrl(paymentKey: string) {
  if (!IFRAME_ID) {
    return `https://egypt.paymob.com/api/acceptance/iframes/MOCK_IFRAME?payment_token=${paymentKey}`;
  }
  return `https://egypt.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentKey}`;
}
