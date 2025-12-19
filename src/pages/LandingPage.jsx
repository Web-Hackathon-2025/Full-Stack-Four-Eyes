import { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Wrench,
  Zap,
  GraduationCap,
  Sparkles,
  Settings,
  Menu,
  X,
  CheckCircle,
  Calendar,
  Smile,
  Shield,
  Star,
  ChevronUp,
  ChevronDown,
  Moon,
  Sun,
  UserPlus,
  Briefcase,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPinned
} from 'lucide-react';
import './index.css';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  // Dark mode effect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: 'General Inquiry',
      message: ''
    });
  };

  const categories = [
    { icon: Wrench, name: 'Plumbers', color: '#3b82f6', bgColor: '#dbeafe' },
    { icon: GraduationCap, name: 'Tutors', color: '#8b5cf6', bgColor: '#ede9fe' },
    { icon: Zap, name: 'Electricians', color: '#f59e0b', bgColor: '#fef3c7' },
    { icon: Sparkles, name: 'Cleaners', color: '#10b981', bgColor: '#d1fae5' },
    { icon: Settings, name: 'Technicians', color: '#ef4444', bgColor: '#fee2e2' },
  ];

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo-container">
            <img src="/logo.png" alt="Karigar" className="navbar-logo-img" />
            <h1 className="navbar-logo">Karigar</h1>
          </div>

          {/* Desktop Navigation */}
          <ul className="navbar-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#how-it-works">How it Works</a></li>
            <li><a href="#why-choose">Why Choose Us</a></li>
            <li><a href="#reviews">Reviews</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>

          {/* Auth Buttons & Dark Mode */}
          <div className="navbar-auth">
            <button
              className="btn-dark-mode"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn-login">Login</button>
            <button className="btn-signup">Sign Up</button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu active">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#why-choose">Why Choose Us</a>
            <a href="#reviews">Reviews</a>
            <a href="#faq">FAQ</a>
            <div className="navbar-auth">
              <button className="btn-login">Login</button>
              <button className="btn-signup">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-new">
        <div className="hero-new-container">
          <div className="hero-new-content">
            <div className="hero-new-text">
              <h1 className="hero-new-title">
                Find the perfect Karigar for you
              </h1>
              <p className="hero-new-subtitle">
                Search trusted service professionals through 12,800 verified Karigars
              </p>

              {/* Search Bar */}
              <div className="hero-search-bar">
                <div className="hero-search-input-group">
                  <Search className="hero-search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Service type or keyword"
                    className="hero-search-input"
                  />
                </div>

                <div className="hero-search-divider"></div>

                <div className="hero-search-input-group">
                  <MapPin className="hero-search-icon" size={20} />
                  <select className="hero-search-select">
                    <option>All Locations</option>
                    <option>Karachi</option>
                    <option>Lahore</option>
                    <option>Islamabad</option>
                    <option>Rawalpindi</option>
                  </select>
                </div>

                <button className="hero-search-button">
                  <Search size={20} />
                </button>
              </div>

              {/* Popular Searches */}
              <div className="popular-searches">
                <span className="popular-label">Popular Searches:</span>
                <div className="popular-tags">
                  <span className="popular-tag">Plumber</span>
                  <span className="popular-tag">Electrician</span>
                  <span className="popular-tag">Tutor</span>
                  <span className="popular-tag">Cleaner</span>
                  <span className="popular-tag">Technician</span>
                  <span className="popular-tag">Carpenter</span>
                  <span className="popular-tag">Painter</span>
                </div>
              </div>
            </div>

            {/* Hero Image Section */}
            <div className="hero-new-image">
              <div className="hero-card-stack">
                {/* Card Stack */}
                <div className="hero-card hero-card-back"></div>
                <div className="hero-card hero-card-middle"></div>
                <div className="hero-card hero-card-front">
                  <div className="hero-card-content">
                    <img
                      src="/worker.jpg"
                      alt="Professional Karigar"
                      className="hero-worker-image"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Stats - Outside card stack */}
              <div className="hero-stat hero-stat-1">
                <div className="hero-stat-number">319</div>
                <div className="hero-stat-label">Available Karigars</div>
                <div className="hero-stat-sublabel">in Business Development</div>
              </div>
              <div className="hero-stat hero-stat-2">
                <div className="hero-stat-number">265</div>
                <div className="hero-stat-label">Completed Services</div>
                <div className="hero-stat-sublabel">in Construction</div>
              </div>
              <div className="hero-stat hero-stat-3">
                <div className="hero-stat-number">324</div>
                <div className="hero-stat-label">Active Customers</div>
                <div className="hero-stat-sublabel">in Customer Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="services" className="categories-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Search by Category</h2>
            <p>Search your career opportunity with our categories</p>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div
                  className="category-icon"
                  style={{ backgroundColor: category.bgColor }}
                >
                  <category.icon size={32} style={{ color: category.color }} />
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">1 open positions</p>
              </div>
            ))}
          </div>

          <div className="categories-footer">
            <a href="#" className="view-all-link">All Categories →</a>
          </div>
        </div>
      </section>

      {/* How It Works - Process Flow */}
      <section id="how-it-works" className="process-section">
        <div className="section-container">
          <div className="process-header">
            <div className="process-badge">3 SIMPLE STEPS</div>
            <h2 className="process-title">Get amazing service in 3 simple steps</h2>
            <p className="process-subtitle">It's quick, easy, and hassle-free</p>
          </div>

          <div className="process-grid-new">
            <div className="process-step-new">
              <div className="process-step-icon-new">
                <Search size={40} />
              </div>
              <h3 className="process-step-title-new">1. Search</h3>
              <p className="process-step-description-new">
                Tell us what you need and where you are. Browse verified professionals in your area.
              </p>
            </div>

            <div className="process-step-new">
              <div className="process-step-icon-new">
                <Calendar size={40} />
              </div>
              <h3 className="process-step-title-new">2. Book</h3>
              <p className="process-step-description-new">
                Choose your preferred time and date. Get instant confirmation from your Karigar.
              </p>
            </div>

            <div className="process-step-new">
              <div className="process-step-icon-new">
                <Smile size={40} />
              </div>
              <h3 className="process-step-title-new">3. Relax</h3>
              <p className="process-step-description-new">
                Sit back while our expert handles your task professionally and efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose" className="why-choose-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why choose Karigar?</h2>
            <p>Trust, quality, and convenience in one platform</p>
          </div>

          <div className="why-choose-grid">
            <div className="why-choose-card green">
              <div className="why-choose-icon">
                <Shield size={40} />
              </div>
              <h3>Verified Professionals</h3>
              <p>
                Every Karigar undergoes thorough background checks and verification for your safety and peace of mind.
              </p>
            </div>

            <div className="why-choose-card blue">
              <div className="why-choose-icon">
                <CheckCircle size={40} />
              </div>
              <h3>Quick & Reliable</h3>
              <p>
                Get instant responses and same-day service from skilled professionals in your neighborhood.
              </p>
            </div>

            <div className="why-choose-card purple">
              <div className="why-choose-icon">
                <Star size={40} />
              </div>
              <h3>Quality Guaranteed</h3>
              <p>
                Transparent pricing, no hidden fees, and satisfaction guarantee on all services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="testimonials-section">
        <div className="section-container">
          <div className="testimonials-header">
            <p className="testimonials-badge">Testimonials</p>
            <h2 className="testimonials-title">Trusted by leaders<br />from various industries</h2>
            <p className="testimonials-subtitle">
              Learn why professionals trust our solutions to complete their customer journeys.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-image-card">
              <div className="testimonial-avatar"></div>
            </div>
            <div className="testimonial-image-card">
              <div className="testimonial-avatar"></div>
            </div>
            <div className="testimonial-image-card">
              <div className="testimonial-avatar"></div>
            </div>
            <div className="testimonial-image-card">
              <div className="testimonial-avatar"></div>
            </div>
            <div className="testimonial-image-card">
              <div className="testimonial-avatar"></div>
            </div>
            <div className="testimonial-image-card">
              <div className="testimonial-avatar"></div>
            </div>
          </div>

          <div className="testimonials-cta">
            <button className="testimonials-button">Read Success Stories →</button>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Section */}
      <section id="faq" className="faq-contact-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-contact-grid">
            {/* FAQ Left Side */}
            <div className="faq-column">
              <div className="faq-list">
                <div className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)}
                  >
                    <span>How do I find a Karigar near me?</span>
                    {activeFaq === 0 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activeFaq === 0 && (
                    <div className="faq-answer active">
                      <p>Simply enter your service type and location in the search bar. Our platform will show you verified Karigars available in your area with ratings and reviews.</p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                  >
                    <span>Are all service providers verified?</span>
                    {activeFaq === 1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activeFaq === 1 && (
                    <div className="faq-answer active">
                      <p>Yes! All Karigars undergo thorough background checks, identity verification, and skill assessment before joining our platform.</p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)}
                  >
                    <span>How do I pay for services?</span>
                    {activeFaq === 2 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activeFaq === 2 && (
                    <div className="faq-answer active">
                      <p>We accept multiple payment methods including cash, mobile wallets (JazzCash, Easypaisa), and bank transfers. Payment is made after service completion.</p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === 3 ? null : 3)}
                  >
                    <span>What if I'm not satisfied with the service?</span>
                    {activeFaq === 3 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activeFaq === 3 && (
                    <div className="faq-answer active">
                      <p>We have a satisfaction guarantee. Contact our support team within 24 hours and we'll work to resolve any issues or arrange a replacement service.</p>
                    </div>
                  )}
                </div>

                <div className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setActiveFaq(activeFaq === 4 ? null : 4)}
                  >
                    <span>Can I book services in advance?</span>
                    {activeFaq === 4 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {activeFaq === 4 && (
                    <div className="faq-answer active">
                      <p>Absolutely! You can schedule services up to 30 days in advance. Choose your preferred date and time during booking.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Form Right Side */}
            <div className="contact-column">
              <div className="contact-form-container">
                <h3>Still have questions?</h3>
                <p className="contact-form-subtitle">Send us a message and we'll get back to you soon</p>

                <form onSubmit={handleFormSubmit} className="contact-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleFormChange}
                    >
                      <option>General Inquiry</option>
                      <option>Service Issue</option>
                      <option>Account Support</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      placeholder="Tell us how we can help..."
                      required
                      rows="4"
                    ></textarea>
                  </div>

                  <button type="submit" className="contact-submit-btn">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="dual-cta-section">
        <div className="section-container">
          <div className="dual-cta-header">
            <h2>Ready to get started?</h2>
            <p>Choose your path and join thousands of satisfied users</p>
          </div>

          <div className="dual-cta-grid">
            {/* Customer CTA */}
            <div className="cta-card-new customer-cta">
              <div className="cta-card-bg"></div>
              <div className="cta-card-content-new">
                <div className="cta-icon-new">
                  <UserPlus size={48} />
                </div>
                <h3>I Need a Service</h3>
                <p>Find verified professionals for all your home and business needs</p>
                <ul className="cta-features">
                  <li><CheckCircle size={18} /> Browse verified Karigars</li>
                  <li><CheckCircle size={18} /> Compare prices & reviews</li>
                  <li><CheckCircle size={18} /> Book instantly</li>
                  <li><CheckCircle size={18} /> Satisfaction guaranteed</li>
                </ul>
                <button className="cta-button-new customer-btn">
                  Find a Karigar
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>

            {/* Provider CTA */}
            <div className="cta-card-new provider-cta">
              <div className="cta-card-bg"></div>
              <div className="cta-card-content-new">
                <div className="cta-icon-new">
                  <Briefcase size={48} />
                </div>
                <h3>I Want to Give a Service</h3>
                <p>Join our platform and grow your business with verified customers</p>
                <ul className="cta-features">
                  <li><CheckCircle size={18} /> Get more customers</li>
                  <li><CheckCircle size={18} /> Flexible schedule</li>
                  <li><CheckCircle size={18} /> Secure payments</li>
                  <li><CheckCircle size={18} /> Build your reputation</li>
                </ul>
                <button className="cta-button-new provider-btn">
                  Become a Karigar
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-column">
              <div className="footer-logo-section">
                <img src="/logo.png" alt="Karigar" className="footer-logo-img" />
                <h3 className="footer-logo-text">Karigar</h3>
              </div>
              <p className="footer-description">
                Your trusted platform for finding verified local service professionals.
                Quality service, every time.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#how-it-works">How it Works</a></li>
                <li><a href="#reviews">Reviews</a></li>
                <li><a href="#about">About Us</a></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-links">
                <li><a href="#plumbers">Plumbers</a></li>
                <li><a href="#electricians">Electricians</a></li>
                <li><a href="#tutors">Tutors</a></li>
                <li><a href="#cleaners">Cleaners</a></li>
                <li><a href="#technicians">Technicians</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-column">
              <h4 className="footer-heading">Contact Us</h4>
              <ul className="footer-contact">
                <li>
                  <Mail size={18} />
                  <span>support@karigar.com</span>
                </li>
                <li>
                  <Phone size={18} />
                  <span>+92 300 1234567</span>
                </li>
                <li>
                  <MapPinned size={18} />
                  <span>Karachi, Pakistan</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2025 Karigar. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <span className="separator">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="separator">•</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
