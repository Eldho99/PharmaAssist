import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import { Loader2 } from 'lucide-react';

// Stripe publishable API key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    // In a real app, amount comes from order details passed via location state or fetch from API
    const amount = location.state?.amount || 50;

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        const createPaymentIntent = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post("/api/payments/create-payment-intent",
                    { amount: amount, currency: "usd" },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setClientSecret(res.data.clientSecret);
                setLoading(false);
            } catch (error) {
                console.error("Error creating payment intent:", error);
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [amount]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#6366f1',
            borderRadius: '12px',
        },
    };
    const options = {
        clientSecret,
        appearance,
    };

    if (!clientSecret && loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Secure Payment</h1>
                    <p className="text-slate-500">Completing your order of ${amount}</p>
                </div>

                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm amount={amount} />
                    </Elements>
                )}

                {!clientSecret && !loading && (
                    <div className="text-center text-red-500">
                        Failed to initialize payment. Please try again later.
                        <button onClick={() => navigate(-1)} className="block mt-4 text-primary underline w-full text-center">Go Back</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
