-- Emma Resources CMS Database Schema
-- This is a completely new CMS focused on resources (blogs, case studies, use cases)

CREATE DATABASE IF NOT EXISTS emma_resources_cms;
USE emma_resources_cms;

-- Users table for CMS authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar VARCHAR(500),
    role ENUM('admin', 'editor', 'author') DEFAULT 'author',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Industries table for categorization
CREATE TABLE IF NOT EXISTS industries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tags table for flexible tagging
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#64748b',
    description TEXT,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resources table (unified table for blogs, case studies, use cases)
CREATE TABLE IF NOT EXISTS resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    type ENUM('blog', 'case-study', 'use-case') NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    
    -- Content
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    content_plain TEXT, -- Plain text version for search
    
    -- Media
    featured_image VARCHAR(500),
    featured_image_alt VARCHAR(200),
    gallery JSON, -- Array of image URLs
    
    -- Author information
    author_id INT,
    author_name VARCHAR(200), -- Denormalized for performance
    author_image VARCHAR(500),
    author_bio TEXT,
    
    -- Categorization
    industry_id INT,
    tags JSON, -- Array of tag IDs
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords TEXT,
    
    -- Reading experience
    read_time INT DEFAULT 5, -- Estimated reading time in minutes
    word_count INT DEFAULT 0,
    
    -- Engagement
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    
    -- Publishing
    published_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_type_status (type, status),
    INDEX idx_industry (industry_id),
    INDEX idx_author (author_id),
    INDEX idx_published (published_at),
    INDEX idx_slug (slug),
    FULLTEXT idx_content_search (title, content_plain, excerpt),
    
    -- Foreign keys
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE SET NULL
);

-- Resource views tracking
CREATE TABLE IF NOT EXISTS resource_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(500),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_resource (resource_id),
    INDEX idx_viewed_at (viewed_at),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Resource likes tracking
CREATE TABLE IF NOT EXISTS resource_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resource_id INT NOT NULL,
    ip_address VARCHAR(45),
    liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_like (resource_id, ip_address),
    INDEX idx_resource (resource_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- CMS Settings
CREATE TABLE IF NOT EXISTS cms_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value LONGTEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json', 'image') DEFAULT 'text',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- File uploads tracking
CREATE TABLE IF NOT EXISTS file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type ENUM('image', 'document', 'video', 'audio', 'other') NOT NULL,
    uploaded_by INT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_file_type (file_type),
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, first_name, last_name, role) VALUES 
('admin', 'admin@emma.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Insert default industries
INSERT IGNORE INTO industries (name, slug, description, color, icon) VALUES 
('Healthcare', 'healthcare', 'Healthcare and medical industry solutions', '#10b981', '🏥'),
('Banking & Finance', 'banking-finance', 'Banking, finance, and fintech solutions', '#3b82f6', '🏦'),
('Education', 'education', 'Educational technology and learning solutions', '#8b5cf6', '🎓'),
('Manufacturing', 'manufacturing', 'Manufacturing and industrial automation', '#f59e0b', '🏭'),
('Retail', 'retail', 'Retail and e-commerce solutions', '#ef4444', '🛍️'),
('Technology', 'technology', 'Technology and software development', '#06b6d4', '💻'),
('Government', 'government', 'Government and public sector solutions', '#6b7280', '🏛️'),
('Non-Profit', 'non-profit', 'Non-profit and social impact organizations', '#84cc16', '🤝');

-- Insert default tags
INSERT IGNORE INTO tags (name, slug, description, color) VALUES 
('AI Automation', 'ai-automation', 'Artificial Intelligence and automation topics', '#3b82f6'),
('Machine Learning', 'machine-learning', 'Machine learning and data science', '#8b5cf6'),
('Digital Transformation', 'digital-transformation', 'Digital transformation initiatives', '#10b981'),
('Process Optimization', 'process-optimization', 'Business process optimization', '#f59e0b'),
('Customer Experience', 'customer-experience', 'Customer experience and satisfaction', '#ef4444'),
('Data Analytics', 'data-analytics', 'Data analytics and insights', '#06b6d4'),
('Cloud Computing', 'cloud-computing', 'Cloud computing and infrastructure', '#84cc16'),
('Security', 'security', 'Cybersecurity and data protection', '#f97316');

-- Insert default CMS settings
INSERT IGNORE INTO cms_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES 
('site_name', 'Emma Resources CMS', 'text', 'Name of the CMS system', 'general', false),
('posts_per_page', '12', 'number', 'Number of posts to display per page', 'display', true),
('enable_comments', 'true', 'boolean', 'Enable comments on resources', 'features', true),
('enable_likes', 'true', 'boolean', 'Enable likes on resources', 'features', true),
('enable_sharing', 'true', 'boolean', 'Enable social sharing', 'features', true),
('default_author', '1', 'number', 'Default author ID for new resources', 'content', false),
('auto_save_interval', '30', 'number', 'Auto-save interval in seconds', 'editor', false),
('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', 'uploads', false),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx"]', 'json', 'Allowed file types for uploads', 'uploads', false);

-- Create additional indexes for performance
CREATE INDEX idx_resources_type_status_published ON resources(type, status, published_at);
CREATE INDEX idx_resources_industry_status ON resources(industry_id, status);
CREATE INDEX idx_resources_author_status ON resources(author_id, status);
CREATE INDEX idx_resources_created_at ON resources(created_at);
CREATE INDEX idx_resources_updated_at ON resources(updated_at);

-- Show success message
SELECT 'Emma Resources CMS Database initialized successfully!' as message;
