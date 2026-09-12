import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const LegalPolicies: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Policy & Guidelines';
  let subtitle = 'Transparent standards for NEXORA customers';

  if (path.includes('shipping')) {
    title = 'SHIPPING & DISPATCH POLICY';
    subtitle = 'Complimentary express delivery across all serviceable Indian pincodes';
  } else if (path.includes('refund')) {
    title = 'RETURNS & REPLACEMENTS';
    subtitle = '7-day replacement guarantee on all damaged or defective items';
  } else if (path.includes('privacy')) {
    title = 'PRIVACY POLICY';
    subtitle = 'How we respect and safeguard your personal information';
  } else if (path.includes('terms')) {
    title = 'TERMS OF SERVICE';
    subtitle = 'Terms and conditions governing use of the NEXORA website';
  } else if (path.includes('faq')) {
    title = 'FREQUENTLY ASKED QUESTIONS';
    subtitle = 'Quick answers about ordering, payments, materials, and dispatch';
  }

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3 pb-8 border-b border-stone/30">
        <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
          Customer Assurance
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-sans">{subtitle}</p>
      </div>

      <div className="prose prose-stone max-w-none text-xs sm:text-sm text-charcoal-700 leading-relaxed font-sans space-y-6">
        {path.includes('shipping') && (
          <>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">1. Dispatch Timelines</h3>
            <p>
              All orders are processed and packed within 24 business hours at our primary fulfillment center. Once dispatched, you will receive an automated tracking link via SMS and email.
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">2. Delivery Timeframes</h3>
            <p>
              • Metro Cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Kolkata): 2 to 4 business days.
              <br />
              • Tier 2 & Tier 3 Cities / Rest of India: 3 to 6 business days.
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">3. Shipping Rates</h3>
            <p>
              We offer <strong>Free Express Delivery on every single order</strong> across all serviceable Indian pincodes. There are zero delivery or handling charges applied at checkout.
            </p>
          </>
        )}

        {path.includes('refund') && (
          <>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">1. Strict 7-Day Return & Replacement Window</h3>
            <p>
              Nexora offers an automated <strong>7-Day Return & Replacement Guarantee</strong> on all orders. The return window starts on the day your order is marked as <code>DELIVERED</code> (Day 1) and remains valid for exactly 7 consecutive days (through Day 7). Once this 7-day window concludes, return and replacement requests are automatically closed and cannot be accepted.
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">2. Resolution Options: Free Replacement or Direct Refund</h3>
            <p>
              When requesting a return within the eligible 7-day window from your <Link to="/orders" className="underline text-sage-800">My Orders</Link> dashboard, you may select:
              <br />
              • <strong>Free Replacement:</strong> A brand-new replacement unit will be prepared and dispatched with expedited delivery after reverse inspection.
              <br />
              • <strong>Direct Refund:</strong> Settle the refunded amount directly to your chosen UPI Virtual Payment Address (VPA) or Indian Bank Account (NEFT/IMPS).
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">3. Doorstep Reverse Pickup & Inspection</h3>
            <p>
              Once your return request is approved by our concierge, our courier partner will coordinate a convenient doorstep pickup from your registered address. Items must include original packaging, protective covers, and all included accessories.
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">4. Order Cancellation Policy</h3>
            <p>
              Orders may be cancelled free of charge prior to fulfillment. Once an order has been handed over to courier logistics and dispatched, it cannot be cancelled mid-transit.
            </p>
          </>
        )}

        {path.includes('privacy') && (
          <>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">1. Information We Collect</h3>
            <p>
              We collect your name, delivery address, email, and phone number solely to fulfill orders and provide live tracking status. We do not sell, rent, or trade customer information to third parties.
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">2. Payment Security</h3>
            <p>
              NEXORA processes manual UPI reference verifications and Cash on Delivery. We never store bank PINs, passwords, or credit card CVV information.
            </p>
          </>
        )}

        {path.includes('terms') && (
          <>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">1. General Terms</h3>
            <p>
              By accessing and placing an order with NEXORA, you agree to provide truthful customer contact details and valid payment references.
            </p>
            <h3 className="font-serif text-xl text-charcoal-900 font-normal">2. Product Descriptions</h3>
            <p>
              We strive to depict every item with precise dimensions, honest photography, and material specifications. Handcrafted items like diatomite stone and ceramic cruets may show natural minor variations in texture.
            </p>
          </>
        )}

        {path.includes('faq') && (
          <div className="space-y-6">
            <div>
              <h3 className="font-serif text-xl text-charcoal-900 font-normal">How do I track my order?</h3>
              <p>
                Visit our <Link to="/track-order" className="underline text-sage-800">Track Order</Link> page and enter your order number (e.g. NX-89210) to view live courier status.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-charcoal-900 font-normal">How does UPI payment verification work?</h3>
              <p>
                When selecting UPI, you transfer the amount to our official ID <code>nexora@upi</code> and paste the 12-digit UTR reference ID. Our concierge verifies this before marking the order as confirmed and preparing dispatch.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-charcoal-900 font-normal">Can I order via Cash on Delivery?</h3>
              <p>
                Yes, Cash on Delivery is supported across all major postal codes across India.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
