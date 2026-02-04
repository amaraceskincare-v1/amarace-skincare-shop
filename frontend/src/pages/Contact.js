import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../styles/Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
    };

    const contactInfo = [
        {
            icon: FiMapPin,
            title: 'Address',
            content: 'Metro Manila, Philippines',
        },
        {
            icon: FiMail,
            title: 'Email',
            content: 'amarace.skincare@gmail.com',
            link: 'mailto:amarace.skincare@gmail.com',
        },
        {
            icon: FiPhone,
            title: 'Phone',
            content: '+63 915 266 2648',
            link: 'tel:+639152662648',
        },
        {
            icon: FiClock,
            title: 'Business Hours',
            content: 'Mon - Fri: 9AM - 6PM',
        },
    ];

    return (
        <div className="contact-page">
            {/* Page Header */}
            <div className="page-header">
                <h1>Talk to Our Concierge</h1>
                <p>Personalized skincare guidance, product recommendations, and custom requests just for you.</p>
            </div>

            <div className="contact-container">
                {/* Contact Info Cards */}
                <div className="contact-info">
                    {contactInfo.map((info, index) => {
                        const Icon = info.icon;
                        return (
                            <div key={index} className="info-card">
                                <div className="info-icon">
                                    <Icon />
                                </div>
                                <div className="info-content">
                                    <h3>{info.title}</h3>
                                    {info.link ? (
                                        <a href={info.link}>{info.content}</a>
                                    ) : (
                                        <p>{info.content}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Contact Form */}
                <div className="contact-form-wrapper">
                    <h2>Send us a message</h2>
                    <p>Fill out the form below and we'll get back to you as soon as possible.</p>

                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="How can we help you?"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Write your message here..."
                                rows="5"
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                'Sending...'
                            ) : (
                                <>
                                    Send Message <FiSend />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
