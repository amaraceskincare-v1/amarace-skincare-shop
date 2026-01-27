import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import '../styles/FAQs.css';

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: 'Shipping & Delivery',
            questions: [
                {
                    q: 'How long does shipping take?',
                    a: 'Standard shipping within Davao Del Norte takes 3-5 business days. Orders are processed within 1-2 business days after payment confirmation.'
                },
                {
                    q: 'Do you offer free shipping?',
                    a: 'Yes! We offer FREE shipping on all orders over ₱500. For orders below ₱500, a flat shipping fee of ₱85 applies within Davao Del Norte.'
                },
                {
                    q: 'How can I track my order?',
                    a: 'Once your order is shipped, you will receive an email/SMS with your tracking number. You can use this to track your package on the J&T Express website.'
                }
            ]
        },
        {
            category: 'Payment',
            questions: [
                {
                    q: 'What payment methods do you accept?',
                    a: 'We currently accept GCash payments only. Simply scan our QR code during checkout and upload your payment screenshot as proof.'
                },
                {
                    q: 'Is my payment information secure?',
                    a: 'Absolutely! We never store your payment details. All transactions are processed securely through GCash\'s official platform.'
                },
                {
                    q: 'When will my payment be confirmed?',
                    a: 'Payments are typically verified within 1-2 hours during business hours. You\'ll receive an email confirmation once verified.'
                }
            ]
        },
        {
            category: 'Returns & Refunds',
            questions: [
                {
                    q: 'What is your return policy?',
                    a: 'We accept returns within 7 days of delivery for unopened and unused products. Items must be in original packaging.'
                },
                {
                    q: 'How do I request a refund?',
                    a: 'Contact us via email at hello@amarace.com with your order number and reason for refund. We\'ll guide you through the process.'
                },
                {
                    q: 'How long do refunds take?',
                    a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item.'
                }
            ]
        },
        {
            category: 'Products',
            questions: [
                {
                    q: 'Are your products authentic?',
                    a: 'Yes, all AmaraCé products are 100% authentic. We source directly from verified manufacturers and suppliers.'
                },
                {
                    q: 'Are your products cruelty-free?',
                    a: 'We are committed to cruelty-free beauty. None of our products are tested on animals.'
                },
                {
                    q: 'What if I receive a damaged product?',
                    a: 'Please contact us within 24 hours of delivery with photos of the damaged item. We\'ll send a replacement at no extra cost.'
                }
            ]
        }
    ];

    const handleToggle = (categoryIndex, questionIndex) => {
        const key = `${categoryIndex}-${questionIndex}`;
        setOpenIndex(openIndex === key ? null : key);
    };

    return (
        <div className="faqs-page">
            {/* Hero */}
            <div className="faqs-hero">
                <h1>Frequently Asked Questions</h1>
                <p>Find answers to common questions about orders, shipping, and more</p>
            </div>

            {/* FAQ Content */}
            <div className="faqs-content">
                {faqs.map((section, categoryIndex) => (
                    <div key={categoryIndex} className="faq-section">
                        <h2>{section.category}</h2>
                        <div className="faq-list">
                            {section.questions.map((item, questionIndex) => {
                                const key = `${categoryIndex}-${questionIndex}`;
                                const isOpen = openIndex === key;
                                return (
                                    <div key={questionIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                        <button
                                            className="faq-question"
                                            onClick={() => handleToggle(categoryIndex, questionIndex)}
                                        >
                                            <span>{item.q}</span>
                                            <FiChevronDown className={`faq-icon ${isOpen ? 'rotate' : ''}`} />
                                        </button>
                                        <div className={`faq-answer ${isOpen ? 'show' : ''}`}>
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact CTA */}
            <div className="faqs-cta">
                <h3>Still have questions?</h3>
                <p>Our support team is here to help</p>
                <a href="mailto:amarace.skincare@gmail.com" className="cta-btn">Contact Us</a>
            </div>
        </div>
    );
};

export default FAQs;
