import '../../styles/Auth.css';

const Shipping = () => {
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Shipping Information</h1>

                <h3>Processing Time</h3>
                <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>

                <h3>Shipping Rates & Delivery Estimates</h3>
                <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
                <ul>
                    <li><strong>Standard Shipping:</strong> 3-5 business days</li>
                    <li><strong>Free Shipping:</strong> On orders over ₱500</li>
                </ul>

                <h3>Shipment Confirmation & Order Tracking</h3>
                <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).</p>
            </div>
        </div>
    );
};

export default Shipping;
