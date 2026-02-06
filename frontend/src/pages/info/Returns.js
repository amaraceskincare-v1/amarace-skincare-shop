import '../../styles/Auth.css';

const Returns = () => {
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '800px', textAlign: 'left' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Returns Policy</h1>

                <p>Our policy lasts 7 days. If 7 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.</p>

                <h3>Eligibility</h3>
                <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>

                <h3>Refunds</h3>
                <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. If you are approved, then your refund will be processed.</p>

                <h3>Exchanges</h3>
                <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at customer.support@amaracéskincare.store.</p>
            </div>
        </div>
    );
};

export default Returns;
