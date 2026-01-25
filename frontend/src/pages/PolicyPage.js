import { Link } from 'react-router-dom';
import '../styles/PolicyPage.css';

const policyContent = {
    refund: {
        title: 'Refund Policy',
        lastUpdated: 'January 2026',
        sections: [
            {
                heading: 'Returns',
                content: `We accept returns within 7 days of delivery for products that are unopened and unused. To be eligible for a return, your item must be in the same condition that you received it, in the original packaging.

To initiate a return, please contact us at hello@amarace.com with your order number and reason for return.`
            },
            {
                heading: 'Refunds',
                content: `Once we receive your returned item, we will inspect it and notify you of the approval or rejection of your refund.

If approved, your refund will be processed within 5-7 business days. The refund will be credited back to your original payment method (GCash).`
            },
            {
                heading: 'Exchanges',
                content: `We only replace items if they are defective or damaged. If you need to exchange an item, please contact us at hello@amarace.com and we will guide you through the process.`
            },
            {
                heading: 'Non-Returnable Items',
                content: `The following items cannot be returned:
• Opened or used beauty products
• Items not in original packaging
• Products with broken seals
• Items returned after 7 days from delivery`
            }
        ]
    },
    privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'January 2026',
        sections: [
            {
                heading: 'Information We Collect',
                content: `We collect information you provide directly to us, including:
• Name, email address, and phone number
• Shipping address
• Order history and transaction details
• Payment confirmation screenshots

We do not store your actual payment details. All payments are processed through GCash.`
            },
            {
                heading: 'How We Use Your Information',
                content: `We use the information we collect to:
• Process and fulfill your orders
• Send order confirmations and updates
• Respond to your inquiries
• Improve our products and services
• Send promotional communications (with your consent)`
            },
            {
                heading: 'Information Sharing',
                content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only with:
• Shipping partners to deliver your orders
• Payment verification services
• Legal authorities when required by law`
            },
            {
                heading: 'Data Security',
                content: `We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`
            },
            {
                heading: 'Contact Us',
                content: `If you have any questions about this Privacy Policy, please contact us at hello@amarace.com.`
            }
        ]
    },
    terms: {
        title: 'Terms of Service',
        lastUpdated: 'January 2026',
        sections: [
            {
                heading: 'Agreement to Terms',
                content: `By accessing and using the AmaraCé website, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our website or use our services.`
            },
            {
                heading: 'Products and Pricing',
                content: `We strive to provide accurate product descriptions and pricing. However, we reserve the right to:
• Correct any errors in pricing or product information
• Cancel orders affected by pricing errors
• Limit quantities of any products
• Discontinue any product at any time`
            },
            {
                heading: 'Orders and Payment',
                content: `By placing an order, you warrant that:
• You are legally capable of entering into binding contracts
• All information you provide is true and accurate
• You will pay the full amount due for your order

We currently accept GCash payments only. Orders are processed after payment verification.`
            },
            {
                heading: 'Shipping and Delivery',
                content: `We ship to addresses within Davao Del Norte. Estimated delivery times are 3-5 business days. AmaraCé is not responsible for delays caused by shipping carriers, weather, or other circumstances beyond our control.`
            },
            {
                heading: 'Intellectual Property',
                content: `All content on this website, including text, images, logos, and graphics, is the property of AmaraCé and is protected by copyright laws. You may not reproduce, distribute, or use any content without our written permission.`
            },
            {
                heading: 'Limitation of Liability',
                content: `AmaraCé shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products.`
            },
            {
                heading: 'Changes to Terms',
                content: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Continued use of the website constitutes acceptance of the modified terms.`
            }
        ]
    },
    shipping: {
        title: 'Shipping & Delivery',
        lastUpdated: 'January 2026',
        sections: [
            {
                heading: 'Shipping Coverage',
                content: `We currently ship to all areas within Davao Del Norte, Philippines. This includes:
• Panabo City
• Tagum City
• Island Garden City of Samal
• Carmen, Sto. Tomas, Kapalong
• Talaingod, Asuncion, Braulio E. Dujali
• San Isidro, New Corella`
            },
            {
                heading: 'Shipping Rates',
                content: `FREE SHIPPING on all orders ₱500 and above!

For orders below ₱500:
• Davao Del Norte areas: ₱85 flat rate

Shipping is calculated at checkout.`
            },
            {
                heading: 'Processing Time',
                content: `Orders are processed within 1-2 business days after payment verification.

Business days are Monday to Saturday, 9:00 AM - 6:00 PM.
Orders placed on Sundays or holidays will be processed the next business day.`
            },
            {
                heading: 'Delivery Time',
                content: `Estimated delivery times after processing:
• Metro areas (Panabo, Tagum): 2-3 business days
• Other Davao Del Norte areas: 3-5 business days

Delivery times may vary during peak seasons or unforeseen circumstances.`
            },
            {
                heading: 'Shipping Partner',
                content: `We ship via J&T Express for reliable and trackable delivery. Once your order is shipped, you will receive a tracking number via email/SMS.`
            },
            {
                heading: 'Order Tracking',
                content: `Track your order on the J&T Express website using your tracking number. You can also check your order status in your account dashboard.`
            }
        ]
    },
    returns: {
        title: 'Returns & Exchanges',
        lastUpdated: 'January 2026',
        sections: [
            {
                heading: 'Return Policy',
                content: `We accept returns within 7 days of delivery for products that meet the following conditions:
• Unopened and unused
• In original packaging
• With seals intact
• Accompanied by proof of purchase`
            },
            {
                heading: 'How to Return',
                content: `To initiate a return:
1. Contact us at amarace.skincare@gmail.com within 7 days of delivery
2. Provide your order number and reason for return
3. Wait for our return authorization and instructions
4. Ship the item back to our address (customer pays return shipping)
5. Once received and inspected, we will process your refund`
            },
            {
                heading: 'Exchanges',
                content: `We offer exchanges for:
• Damaged or defective items (replacement sent at no cost)
• Wrong items received (replacement sent at no cost)

For size/variant exchanges on non-defective items, please return the original item and place a new order.`
            },
            {
                heading: 'Refund Process',
                content: `Once your return is approved:
• Refunds are processed within 5-7 business days
• Refunds are credited back to your GCash account
• You will receive email confirmation once refund is processed`
            },
            {
                heading: 'Non-Returnable Items',
                content: `The following cannot be returned or exchanged:
• Opened or used beauty products (for hygiene reasons)
• Products without original packaging
• Items with broken seals
• Products marked as "Final Sale"
• Items returned after 7 days`
            },
            {
                heading: 'Damaged in Transit',
                content: `If your order arrives damaged:
1. Take photos of the damaged package and product
2. Contact us within 24 hours of delivery
3. We will arrange a replacement at no additional cost

Please inspect your package upon delivery and note any damage with the courier.`
            }
        ]
    }
};

const PolicyPage = ({ type }) => {
    const policy = policyContent[type];

    if (!policy) {
        return (
            <div className="policy-page">
                <div className="policy-container">
                    <h1>Page Not Found</h1>
                    <Link to="/">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="policy-page">
            <div className="policy-hero">
                <h1>{policy.title}</h1>
                <p>Last updated: {policy.lastUpdated}</p>
            </div>

            <div className="policy-container">
                <div className="policy-content">
                    {policy.sections.map((section, index) => (
                        <section key={index} className="policy-section">
                            <h2>{section.heading}</h2>
                            <div className="section-content">
                                {section.content.split('\n').map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="policy-footer">
                    <p>If you have any questions, please contact us at <a href="mailto:hello@amarace.com">hello@amarace.com</a></p>
                    <Link to="/" className="back-link">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
