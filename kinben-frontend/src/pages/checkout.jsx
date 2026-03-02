import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import axios from 'axios';
import StepIndicator from './StepIndicator';
import ShippingForm from './ShippingForm';
import BillingForm from './BillingForm';
import PaymentForm from './PaymentForm';
import OrderReview from './OrderReview';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, tax, total, discount, promoCode, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    shipping: {
      label: 'Home',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      streetAddress: '',
      apartmentSuite: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'Bangladesh',
      addressId: null
    },
    billing: {
      isSameAsShipping: true,
      label: 'Home',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      streetAddress: '',
      apartmentSuite: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'Bangladesh',
      addressId: null
    },
    payment: {
      method: 'card',
      cardNumber: '4242424242424242',
      expiryDate: '12/25',
      cvv: '123',
      cardName: user?.first_name + ' ' + user?.last_name || ''
    },
    customerNotes: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [shippingAddressId, setShippingAddressId] = useState(null);
  const [billingAddressId, setBillingAddressId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('accessToken');

  // Fetch user addresses
  React.useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${apiUrl}/users/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    };

    if (token) {
      fetchAddresses();
    }
  }, [token, apiUrl]);

  // Validate current step
  const validateStep = useCallback(() => {
    if (currentStep === 1) {
      // Validate shipping
      if (!formData.shipping.firstName || !formData.shipping.lastName ||
          !formData.shipping.phoneNumber || !formData.shipping.streetAddress ||
          !formData.shipping.city || !formData.shipping.postalCode) {
        setError('Please fill in all required shipping fields');
        return false;
      }
    } else if (currentStep === 2) {
      // Validate billing if not same as shipping
      if (!formData.billing.isSameAsShipping) {
        if (!formData.billing.firstName || !formData.billing.lastName ||
            !formData.billing.phoneNumber || !formData.billing.streetAddress ||
            !formData.billing.city || !formData.billing.postalCode) {
          setError('Please fill in all required billing fields');
          return false;
        }
      }
    } else if (currentStep === 3) {
      // Validate payment
      if (!formData.payment.method) {
        setError('Please select a payment method');
        return false;
      }
    }
    setError(null);
    return true;
  }, [currentStep, formData]);

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        items,
        shippingAddressId: shippingAddressId || null,
        billingAddressId: formData.billing.isSameAsShipping ? shippingAddressId : billingAddressId,
        shippingMethod: 'standard',
        paymentMethod: formData.payment.method,
        promoCode: promoCode || null,
        customerNotes: formData.customerNotes
      };

      const response = await axios.post(`${apiUrl}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { order } = response.data.data;

      // Clear cart and navigate to success page
      await clearCart();
      navigate('/checkout/success', {
        state: { order, orderNumber: order.orderNumber }
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-layout py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items before checking out</p>
          <a href="/catalog" className="btn-primary">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container-layout py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Indicator */}
      <StepIndicator currentStep={currentStep} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="card">
            {currentStep === 1 && (
              <ShippingForm
                data={formData.shipping}
                addresses={addresses}
                onDataChange={(newData) => {
                  setFormData(prev => ({ ...prev, shipping: newData }));
                  setShippingAddressId(null);
                }}
                selectedAddressId={shippingAddressId}
                onSelectAddress={(addressId) => setShippingAddressId(addressId)}
              />
            )}

            {currentStep === 2 && (
              <BillingForm
                data={formData.billing}
                addresses={addresses}
                shippingData={formData.shipping}
                onDataChange={(newData) => {
                  setFormData(prev => ({ ...prev, billing: newData }));
                  setBillingAddressId(null);
                }}
                selectedAddressId={billingAddressId}
                onSelectAddress={(addressId) => setBillingAddressId(addressId)}
              />
            )}

            {currentStep === 3 && (
              <PaymentForm
                data={formData.payment}
                onDataChange={(newData) => {
                  setFormData(prev => ({ ...prev, payment: newData }));
                }}
              />
            )}

            {currentStep === 4 && (
              <OrderReview
                items={items}
                shippingData={formData.shipping}
                billingData={formData.billing}
                paymentMethod={formData.payment.method}
                subtotal={subtotal}
                tax={tax}
                total={total}
                discount={discount}
              />
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4 justify-between border-t pt-6">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="btn-outline"
                >
                  ← Back
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="btn-primary ml-auto"
                >
                  Continue → {isLoading && 'Processing...'}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="btn-primary ml-auto"
                >
                  {isLoading ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="card bg-gray-50 h-fit">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4 pb-4 border-b">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.products.name} x{item.quantity}</span>
                <span>৳{(((item.product_variants?.price || item.products.price) * item.quantity).toFixed(2))}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-৳{((subtotal * discount / 100).toFixed(2))}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax (15%)</span>
              <span>৳{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-base">
              <span>Total</span>
              <span className="text-blue-600">৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
