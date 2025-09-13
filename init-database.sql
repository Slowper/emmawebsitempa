-- Emma CMS Database Initialization Script
-- Run this script to set up the database for the Emma CMS

CREATE DATABASE IF NOT EXISTS emma_cms;
USE emma_cms;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor') DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Content sections table for storing website content
CREATE TABLE IF NOT EXISTS content_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_key VARCHAR(100) UNIQUE NOT NULL,
    section_name VARCHAR(200) NOT NULL,
    content_type ENUM('text', 'html', 'image', 'json') DEFAULT 'text',
    content LONGTEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Website settings table for configuration
CREATE TABLE IF NOT EXISTS website_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blogs table for blog posts
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    author VARCHAR(200) NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    image VARCHAR(500),
    authorImage VARCHAR(500),
    gallery JSON,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Use cases table
CREATE TABLE IF NOT EXISTS use_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    stats JSON,
    gallery JSON,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Case studies table
CREATE TABLE IF NOT EXISTS case_studies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    client VARCHAR(200),
    industry VARCHAR(100),
    summary TEXT,
    results JSON,
    tags JSON,
    status ENUM('draft', 'published', 'archived') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, role) VALUES 
('admin', 'admin@emma.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert default content sections
INSERT IGNORE INTO content_sections (section_key, section_name, content_type, content) VALUES 
('hero_title', 'Hero Title', 'text', 'Meet Emma'),
('hero_subtitle', 'Hero Subtitle', 'text', 'Your Intelligent AI Assistant'),
('hero_description', 'Hero Description', 'text', 'Built to Power the Future of Operations'),
('capabilities_title', 'Capabilities Section Title', 'text', 'Emma\'s Core Capabilities'),
('capabilities_subtitle', 'Capabilities Section Subtitle', 'text', 'Intelligent automation that adapts, learns, and takes initiative'),
('industries_title', 'Industries Section Title', 'text', 'Industry Solutions'),
('industries_subtitle', 'Industries Section Subtitle', 'text', 'Tailored AI agents for your specific industry needs'),
('labs_title', 'Labs Section Title', 'text', 'AI Labs'),
('labs_subtitle', 'Labs Section Subtitle', 'text', 'Exploring the future of autonomous AI'),
('footer_company_description', 'Footer Company Description', 'text', 'Building the future of autonomous AI agents.');

-- Insert default website settings
INSERT IGNORE INTO website_settings (setting_key, setting_value, setting_type, description) VALUES 
('site_title', 'Emma - By KodeFast', 'text', 'Main website title'),
('site_description', 'Emma - Cutting-edge AI platform delivering smart, autonomous AI agents across Healthcare, Banking, and Education industries.', 'text', 'Website meta description'),
('contact_email', 'contact@emma.com', 'text', 'Contact email address'),
('social_facebook', '', 'text', 'Facebook page URL'),
('social_twitter', '', 'text', 'Twitter profile URL'),
('social_linkedin', '', 'text', 'LinkedIn profile URL'),
('analytics_id', '', 'text', 'Google Analytics tracking ID'),
('logo_url', 'Logo And Recording/cropped_circle_image.png', 'text', 'Website logo URL'),
('logo_alt_text', 'Emma Logo', 'text', 'Logo alt text for accessibility');

-- Insert sample blog posts
INSERT IGNORE INTO blogs (title, category, author, excerpt, content, image, authorImage, gallery, status) VALUES 
('The Future of AI in Healthcare', 'Healthcare', 'Dr. Sarah Johnson', 'Exploring how AI is revolutionizing patient care and medical diagnosis.', '<h2>Introduction</h2><p>Artificial Intelligence is transforming healthcare in unprecedented ways. From diagnostic imaging to personalized treatment plans, AI is enabling healthcare professionals to provide better care to patients.</p><h3>Key Benefits</h3><ul><li>Improved diagnostic accuracy</li><li>Faster treatment decisions</li><li>Personalized medicine</li><li>Reduced medical errors</li></ul><p>As we look to the future, the integration of AI in healthcare will continue to evolve, bringing new possibilities for patient care and medical research.</p>', '/uploads/blogs/healthcare-ai.jpg', '/uploads/blogs/author-sarah.jpg', '["/uploads/blogs/healthcare-1.jpg", "/uploads/blogs/healthcare-2.jpg"]', 'published'),
('Banking Automation with AI', 'Banking', 'Michael Chen', 'How AI is streamlining banking operations and improving customer experience.', '<h2>Banking Revolution</h2><p>The banking industry is experiencing a digital transformation powered by artificial intelligence. From fraud detection to customer service, AI is reshaping how banks operate.</p><h3>Automation Benefits</h3><ul><li>24/7 customer service</li><li>Real-time fraud detection</li><li>Automated loan processing</li><li>Personalized financial advice</li></ul><p>These innovations are not just improving efficiency but also enhancing the customer experience in ways never before possible.</p>', '/uploads/blogs/banking-ai.jpg', '/uploads/blogs/author-michael.jpg', '["/uploads/blogs/banking-1.jpg", "/uploads/blogs/banking-2.jpg"]', 'published'),
('AI in Education: Personalized Learning', 'Education', 'Dr. Emily Rodriguez', 'How AI is creating personalized learning experiences for students worldwide.', '<h2>Personalized Learning Revolution</h2><p>Education is being transformed by AI-powered personalized learning systems that adapt to each student\'s unique needs and learning style.</p><h3>Key Features</h3><ul><li>Adaptive learning paths</li><li>Real-time progress tracking</li><li>Personalized content delivery</li><li>Intelligent tutoring systems</li></ul><p>This approach ensures that every student receives the support they need to succeed, regardless of their starting point or learning pace.</p>', '/uploads/blogs/education-ai.jpg', '/uploads/blogs/author-emily.jpg', '["/uploads/blogs/education-1.jpg", "/uploads/blogs/education-2.jpg"]', 'published');

-- Create indexes for better performance
CREATE INDEX idx_content_sections_key ON content_sections(section_key);
CREATE INDEX idx_content_sections_active ON content_sections(is_active);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_website_settings_key ON website_settings(setting_key);

-- Show success message
SELECT 'Database initialized successfully!' as message;
