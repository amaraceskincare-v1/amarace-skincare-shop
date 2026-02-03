import { Link } from 'react-router-dom';
import '../styles/PolicyPage.css';

const policyContent = {
    'shipping-returns': {
        title: 'Shipping & Returns',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'Shipping Information',
                content: `We currently ship locally within Panabo City and nearby areas in Davao del Norte.
                
                • Processing Time: Orders are processed within 1-2 business days.
                • Delivery Time: Estimated 3-5 business days after processing.
                • Shipping Rates: Free shipping on orders over ₱500!`
            },
            {
                heading: 'Return Policy',
                content: `We accept returns within 7 days of delivery for unopened and unused products in their original packaging.
                
                To initiate a return, please contact us at amarace.skincare@gmail.com with your order number and proof of purchase.`
            },
            {
                heading: 'Exchanges',
                content: `Items can be exchanged if they are defective or damaged upon arrival. Please notify us within 24 hours of receipt with photo evidence.`
            }
        ]
    },
    payment: {
        title: 'Payment Methods',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'GCash Payments',
                content: `We primarily accept payments via GCash. It's fast, secure, and convenient.
                
                1. Scan the QR code provided at checkout or in your order confirmation.
                2. Input the total amount of your order.
                3. Save the transaction screenshot.
                4. Upload the screenshot as proof of payment to finalize your order.`
            },
            {
                heading: 'Bank Transfers',
                content: `We are currently working on integrating more payment methods. For bulk orders or special requests, please contact us directly via our Facebook page or email.`
            },
            {
                heading: 'Secured Transactions',
                content: `Your privacy and security are our top priorities. We do not store any personal banking information on our servers.`
            }
        ]
    },
    privacy: {
        title: 'Privacy Policy',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'Information We Collect',
                content: `We collect information that you provide directly to us when you create an account, make a purchase, or contact us. This may include:
                
                • Name and Contact Information
                • Shipping and Billing addresses
                • Transaction history and payment proof screenshots`
            },
            {
                heading: 'How We Use Your Data',
                content: `Your data is used to:
                • Process and fulfill your orders
                • Communicate with you about your account or purchases
                • Improve our products and services
                • Comply with legal obligations`
            },
            {
                heading: 'Data Security',
                content: `We implement industry-standard security measures to protect your personal information. We do not store full payment details on our servers; payments are verified through the secure GCash platform.`
            }
        ]
    },
    terms: {
        title: 'Terms of Service',
        lastUpdated: 'February 2026',
        sections: [
            {
                heading: 'Agreement to Terms',
                content: `By accessing or using the AmaraCé website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our site.`
            },
            {
                heading: 'Product Information',
                content: `We strive for accuracy in product descriptions and pricing. However, we do not warrant that product descriptions or other content are error-free. We reserve the right to correct any errors and to change or update information at any time.`
            },
            {
                heading: 'User Accounts',
                content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.`
            },
            {
                heading: 'Limitation of Liability',
                content: `AmaraCé shall not be liable for any indirect, incidental, or consequential damages arising from your use of our products or website.`
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
                    <p>If you have any questions, please contact us at <a href="mailto:amarace.skincare@gmail.com">amarace.skincare@gmail.com</a></p>
                    <Link to="/" className="back-link">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
