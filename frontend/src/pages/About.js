import { useState, useEffect } from 'react';
import { FiAward, FiHeart, FiShield, FiUsers } from 'react-icons/fi';
import api from '../utils/api';
import '../styles/About.css';

const About = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const values = [
        {
            icon: FiAward,
            title: 'Premium Quality',
            description: 'We source only the finest ingredients and partner with trusted manufacturers.'
        },
        {
            icon: FiShield,
            title: 'Trusted Brand',
            description: 'Thousands of satisfied customers trust AmaraCé for their beauty needs.'
        },
        {
            icon: FiUsers,
            title: 'Community First',
            description: 'We value our community and always put their needs first.'
        }
    ];

    return (
        <div className="about-page">
            {/* Page Header */}
            <div className="page-header">
                <h1>About Us</h1>
                <p>Discover the story behind AmaraCé</p>
            </div>

            {/* Story Section */}
            <section className="story-section">
                <div className="story-content">
                    <div className="story-image">
                        <img
                            src={settings?.ourStoryImage || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"}
                            alt="AmaraCé Story"
                        />
                    </div>
                    <div className="story-text">
                        <h2>Our Story</h2>
                        <p>
                            Founded in 2025, AmaraCé was born from a passion for beauty and self-care.
                            We believe that everyone deserves access to premium quality beauty products
                            that help them look and feel their absolute best.
                        </p>
                        <p>
                            Our journey started with a simple mission: to curate the finest skincare,
                            cosmetics, and beauty essentials from around the world and bring them to
                            beauty enthusiasts in the Philippines.
                        </p>
                        <p>
                            Today, we're proud to serve thousands of customers who trust us for their
                            daily beauty routines. From our best-selling lip tints to our luxurious
                            perfumes and nourishing beauty soaps, every product is carefully selected
                            to meet our high standards of quality and effectiveness.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="mission-section">
                <div className="mission-content">
                    <h2>Our Mission</h2>
                    <p>
                        To empower individuals to embrace their natural beauty through premium,
                        ethically-sourced products that deliver real results. We're committed to
                        making high-quality beauty accessible to everyone while maintaining our
                        values of sustainability and cruelty-free practices.
                    </p>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section">
                <h2>Our Values</h2>
                <div className="values-grid">
                    {values.map((value, index) => {
                        const Icon = value.icon;
                        return (
                            <div key={index} className="value-card">
                                <div className="value-icon">
                                    <Icon />
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <h2>Meet Our Team</h2>
                <p className="team-intro">
                    Behind AmaraCé is a dedicated team of beauty enthusiasts committed to
                    bringing you the best products and shopping experience.
                </p>
                <div className="team-grid">
                    {settings?.teamImages && settings.teamImages.length > 0 ? (
                        settings.teamImages.map((img, i) => (
                            <div key={i} className="team-member-card">
                                <div className="team-image-container">
                                    <img
                                        src={img}
                                        alt={`Team Member ${i + 1}`}
                                        className="team-member-image"
                                    />
                                </div>
                                <h3 className="team-member-name">Team Member</h3>
                                <p className="team-member-role">AmaraCé Specialist</p>
                                <p className="team-member-bio">Dedicated to providing the best beauty experience for our valued community.</p>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="team-member-card">
                                <div className="team-image-container">
                                    <img
                                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80"
                                        alt="Founder & CEO"
                                        className="team-member-image"
                                    />
                                </div>
                                <h3 className="team-member-name">Founder & CEO</h3>
                                <p className="team-member-role">Leading our vision</p>
                                <p className="team-member-bio">Leading our vision for accessible beauty with a passion for natural radiance.</p>
                            </div>
                            <div className="team-member-card">
                                <div className="team-image-container">
                                    <img
                                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
                                        alt="Beauty Director"
                                        className="team-member-image"
                                    />
                                </div>
                                <h3 className="team-member-name">Beauty Director</h3>
                                <p className="team-member-role">Curating collections</p>
                                <p className="team-member-bio">Curating our product collection to bring you the best in skincare and cosmetics.</p>
                            </div>
                            <div className="team-member-card">
                                <div className="team-image-container">
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                                        alt="Customer Experience"
                                        className="team-member-image"
                                    />
                                </div>
                                <h3 className="team-member-name">Customer Experience</h3>
                                <p className="team-member-role">Ensuring satisfaction</p>
                                <p className="team-member-bio">Ensuring your satisfaction with every AmaraCé purchase and interaction.</p>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default About;
