import { FiAward, FiHeart, FiShield, FiUsers } from 'react-icons/fi';
import '../styles/About.css';

const About = () => {
    const values = [
        {
            icon: FiAward,
            title: 'Premium Quality',
            description: 'We source only the finest ingredients and partner with trusted manufacturers.'
        },
        {
            icon: FiHeart,
            title: 'Cruelty Free',
            description: 'All our products are never tested on animals. Beauty without harm.'
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
                            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"
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
                    <div className="team-member">
                        <div className="member-image">
                            <img
                                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80"
                                alt="Team Member"
                            />
                        </div>
                        <h3>Founder & CEO</h3>
                        <p>Leading our vision for accessible beauty</p>
                    </div>
                    <div className="team-member">
                        <div className="member-image">
                            <img
                                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
                                alt="Team Member"
                            />
                        </div>
                        <h3>Beauty Director</h3>
                        <p>Curating our product collection</p>
                    </div>
                    <div className="team-member">
                        <div className="member-image">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                                alt="Team Member"
                            />
                        </div>
                        <h3>Customer Experience</h3>
                        <p>Ensuring your satisfaction</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
