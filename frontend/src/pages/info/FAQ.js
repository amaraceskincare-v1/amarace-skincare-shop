import '../../styles/Auth.css';

const FAQ = () => {
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Frequently Asked Questions</h1>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3>How do I place an order?</h3>
                    <p>Simply browse our products, add items to your cart, and proceed to checkout. We accept secure payments via Stripe.</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Do you ship nationwide?</h3>
                    <p>Yes! We ship all over the Philippines. Shipping rates may vary depending on your location.</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3>How long will shipping take?</h3>
                    <p>Usually 3-5 business days for Metro Manila and 5-7 business days for provincial areas.</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3>Can I return a product?</h3>
                    <p>Yes, we accept returns within 7 days of delivery if the item is damaged or incorrect. Please see our Returns Policy for more details.</p>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
