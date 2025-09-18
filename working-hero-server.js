const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));
app.use('/admin', express.static('./admin'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        if (file.fieldname === 'logo') {
            uploadPath += 'logo';
        } else if (file.fieldname.includes('blog')) {
            uploadPath += 'blogs';
        } else if (file.fieldname.includes('useCase')) {
            uploadPath += 'usecases';
        } else if (file.fieldname.includes('caseStudy')) {
            uploadPath += 'casestudies';
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// In-memory storage for demo
let heroContent = {
  title: 'Meet Emma',
  subtitle: 'Your Intelligent AI Assistant',
  description: 'Built to Power the Future of Operations',
  primaryButton: { text: 'See Emma in Action', href: '#demo' }
};

// Case Studies Content
let caseStudiesContent = [
  {
    id: 1,
    title: 'TechCorp Digital Transformation',
    client: 'TechCorp Inc.',
    industry: 'Technology',
        date: '2024-12-22',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
    summary: 'How Emma helped TechCorp streamline their customer support operations and reduce response times by 70%.',
    results: [
      { number: '70%', label: 'Faster Response' },
      { number: '85%', label: 'Customer Satisfaction' },
      { number: '50%', label: 'Cost Reduction' }
    ],
    tags: ['Digital Transformation', 'Customer Support', 'AI Automation'],
    content: `
      <h2>Challenge</h2>
      <p>TechCorp was struggling with high customer support volumes and long response times. Their traditional support system couldn't keep up with the growing demand.</p>
      
      <h2>Solution</h2>
      <p>We implemented Emma as their primary customer support assistant, integrating with their existing CRM and ticketing systems.</p>
      
      <h2>Results</h2>
      <p>The implementation resulted in significant improvements across all key metrics, transforming their customer support operations.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
    ],
    published: true
  },
  {
    id: 2,
    title: 'HealthPlus Patient Management',
    client: 'HealthPlus Medical',
    industry: 'Healthcare',
    date: 'Dec 20, 2024',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
    summary: 'Emma revolutionized patient scheduling and follow-up care at HealthPlus, improving patient outcomes and operational efficiency.',
    results: [
      { number: '60%', label: 'Scheduling Efficiency' },
      { number: '90%', label: 'Patient Satisfaction' },
      { number: '40%', label: 'Admin Time Saved' }
    ],
    tags: ['Healthcare', 'Patient Care', 'Scheduling'],
    content: `
      <h2>Challenge</h2>
      <p>HealthPlus needed a solution to manage complex patient scheduling and follow-up care coordination across multiple departments.</p>
      
      <h2>Solution</h2>
      <p>Emma was integrated into their patient management system to handle appointment scheduling, reminders, and follow-up care coordination.</p>
      
      <h2>Results</h2>
      <p>The solution dramatically improved patient care coordination and reduced administrative burden on medical staff.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
    ],
    published: true
  },
  {
    id: 3,
    title: 'EduTech Learning Platform',
    client: 'EduTech Solutions',
    industry: 'Education',
    date: 'Dec 18, 2024',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
    summary: 'Emma transformed student support services at EduTech, providing 24/7 assistance and personalized learning recommendations.',
    results: [
      { number: '95%', label: 'Query Resolution' },
      { number: '80%', label: 'Student Engagement' },
      { number: '65%', label: 'Support Efficiency' }
    ],
    tags: ['Education', 'Student Support', 'Learning Platform'],
    content: `
      <h2>Challenge</h2>
      <p>EduTech needed to provide comprehensive support to thousands of students while maintaining high service quality and reducing costs.</p>
      
      <h2>Solution</h2>
      <p>Emma was deployed as the primary student support assistant, handling course inquiries, technical issues, and learning recommendations.</p>
      
      <h2>Results</h2>
      <p>The implementation significantly improved student satisfaction and reduced the workload on human support staff.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
    ],
    published: true
  }
];

let navigationContent = {
    links: [
        { text: 'Home', href: '#home' },
        { text: 'About Us', href: '#about' },
        { text: 'Pricing', href: '#pricing' },
        { text: 'Resources', href: '#resources' },
        { text: 'Sign In', href: '#signin' }
    ]
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'enhanced-dashboard.html'));
});

// Hero API endpoints
app.get('/api/content/hero', (req, res) => {
    console.log('GET /api/content/hero - Returning:', heroContent);
    res.json(heroContent);
});

app.put('/api/content/hero', (req, res) => {
    console.log('PUT /api/content/hero - Received:', req.body);
    heroContent = req.body;
    console.log('Hero section updated:', heroContent);
    res.json({ message: 'Hero section updated successfully' });
});

// Navigation API endpoints
app.get('/api/content/navigation', (req, res) => {
    console.log('GET /api/content/navigation - Returning:', navigationContent);
    res.json(navigationContent);
});

app.put('/api/content/navigation', (req, res) => {
    console.log('PUT /api/content/navigation - Received:', req.body);
    navigationContent = req.body;
    console.log('Navigation updated:', navigationContent);
    res.json({ message: 'Navigation updated successfully' });
});

// Sections API endpoints (for admin dashboard compatibility)
app.get('/api/content/sections', (req, res) => {
    const sections = [
        {
            section_key: 'hero',
            section_name: 'Hero Section',
            content: JSON.stringify(heroContent),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            section_key: 'navigation',
            section_name: 'Navigation Bar',
            content: JSON.stringify(navigationContent),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
    console.log('GET /api/content/sections - Returning:', sections);
    res.json(sections);
});

app.get('/api/content/section/:key', (req, res) => {
    const { key } = req.params;
    let content;
    
    if (key === 'hero') {
        content = heroContent;
    } else if (key === 'navigation') {
        content = navigationContent;
    } else {
        return res.status(404).json({ error: 'Section not found' });
    }
    
    const section = {
        section_key: key,
        section_name: key === 'hero' ? 'Hero Section' : 'Navigation Bar',
        content: JSON.stringify(content),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    console.log(`GET /api/content/section/${key} - Returning:`, section);
    res.json(section);
});

app.put('/api/content/section/:key', (req, res) => {
    const { key } = req.params;
    const { content } = req.body;
    
    console.log(`PUT /api/content/section/${key} - Received:`, content);
    
    if (key === 'hero') {
        heroContent = content;
        console.log('Hero section updated:', heroContent);
    } else if (key === 'navigation') {
        navigationContent = content;
        console.log('Navigation updated:', navigationContent);
    } else {
        return res.status(404).json({ error: 'Section not found' });
    }
    
    res.json({ message: 'Content updated successfully' });
});

// Banners API endpoints (for admin dashboard compatibility)
app.get('/api/content/banners', (req, res) => {
    const banners = [];
    console.log('GET /api/content/banners - Returning:', banners);
    res.json(banners);
});

app.post('/api/content/banners', (req, res) => {
    console.log('POST /api/content/banners - Received:', req.body);
    res.json({ message: 'Banner created successfully' });
});

app.put('/api/content/banners/:id', (req, res) => {
    const { id } = req.params;
    console.log(`PUT /api/content/banners/${id} - Received:`, req.body);
    res.json({ message: 'Banner updated successfully' });
});

app.delete('/api/content/banners/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/content/banners/${id}`);
    res.json({ message: 'Banner deleted successfully' });
});

// Enhanced CMS API endpoints
let featuresContent = [
    { title: 'AI-Powered Automation', description: 'Intelligent automation that learns and adapts', icon: 'fas fa-robot' },
    { title: 'Real-time Analytics', description: 'Get insights and analytics in real-time', icon: 'fas fa-chart-line' },
    { title: 'Seamless Integration', description: 'Integrates with your existing tools and workflows', icon: 'fas fa-plug' }
];

let aboutContent = {
    title: 'About Emma',
    description: 'Emma is your intelligent AI assistant designed to revolutionize how you work and manage your operations.'
};

let seoContent = {
    title: 'Emma - AI Assistant Platform',
    description: 'Meet Emma, your intelligent AI assistant built to power the future of operations.',
    keywords: 'AI, assistant, automation, productivity, operations'
};

let themeContent = {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#48bb78'
};

let settingsContent = {
    siteName: 'Emma by KodeFast',
    siteDescription: 'AI Assistant Platform',
    siteUrl: 'http://localhost:3000'
};

let usersContent = [
    { id: 1, username: 'admin', email: 'admin@emma.com', role: 'admin', lastLogin: '2 minutes ago' }
];

let mediaContent = [];

// Blogs and Use Cases data
let blogsContent = [
    {
        id: 1,
        title: 'The Future of AI-Powered Customer Service',
        excerpt: 'Explore how AI is revolutionizing customer service and what it means for your business.',
        category: 'AI Automation',
        date: '2024-12-15',
        author: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
        authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content: `
            <h2>Introduction</h2>
            <p>The landscape of customer service is undergoing a revolutionary transformation, driven by artificial intelligence technologies that are making interactions more efficient, personalized, and effective than ever before.</p>
            
            <h2>The Current State of Customer Service</h2>
            <p>Traditional customer service models are struggling to keep up with the increasing demands of modern consumers. Long wait times, repetitive queries, and limited availability are common pain points that businesses face daily.</p>
            
            <h3>Key Challenges</h3>
            <ul>
                <li>High operational costs</li>
                <li>Limited scalability</li>
                <li>Inconsistent service quality</li>
                <li>Difficulty in handling peak volumes</li>
            </ul>
            
            <h2>How AI is Transforming Customer Service</h2>
            <p>Artificial Intelligence is addressing these challenges through intelligent automation, natural language processing, and machine learning algorithms that can understand, learn, and respond to customer needs in real-time.</p>
            
            <blockquote>
                "AI-powered customer service isn't about replacing human agents—it's about augmenting their capabilities and creating better experiences for both customers and employees."
            </blockquote>
            
            <h3>Key Benefits</h3>
            <ul>
                <li><strong>24/7 Availability:</strong> AI never sleeps, providing round-the-clock support</li>
                <li><strong>Instant Responses:</strong> Immediate answers to common questions</li>
                <li><strong>Personalization:</strong> Tailored experiences based on customer history</li>
                <li><strong>Cost Efficiency:</strong> Reduced operational costs while maintaining quality</li>
            </ul>
            
            <h2>Real-World Applications</h2>
            <p>Leading companies are already implementing AI-powered customer service solutions with remarkable results. From chatbots that handle initial inquiries to sophisticated systems that can resolve complex issues autonomously.</p>
            
            <h2>Looking Ahead</h2>
            <p>As AI technology continues to evolve, we can expect even more sophisticated customer service solutions that will further blur the lines between human and artificial intelligence, creating seamless, efficient, and highly personalized customer experiences.</p>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
        ],
        published: true
    },
    {
        id: 2,
        title: '10 Ways AI Can Boost Your Team\'s Productivity',
        excerpt: 'Discover practical AI tools and strategies that can transform your team\'s workflow.',
        category: 'Productivity',
        date: '2024-12-12',
        author: 'Mike Chen',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        content: `
            <h2>Introduction</h2>
            <p>In today's fast-paced business environment, productivity is the key to success. Artificial Intelligence offers unprecedented opportunities to enhance team productivity through intelligent automation and data-driven insights.</p>
            
            <h2>1. Intelligent Task Automation</h2>
            <p>AI can automate repetitive tasks, freeing up your team to focus on high-value activities that require human creativity and strategic thinking.</p>
            
            <h2>2. Smart Scheduling and Calendar Management</h2>
            <p>AI-powered scheduling tools can optimize meeting times, manage conflicts, and ensure optimal resource utilization across your team.</p>
            
            <h2>3. Enhanced Communication</h2>
            <p>AI-driven communication tools can translate languages in real-time, summarize long conversations, and even suggest responses based on context.</p>
            
            <h2>4. Predictive Analytics for Decision Making</h2>
            <p>Leverage AI to analyze patterns and predict outcomes, helping your team make more informed decisions faster.</p>
            
            <h2>5. Intelligent Document Management</h2>
            <p>AI can categorize, search, and extract information from documents automatically, making information retrieval instant and accurate.</p>
            
            <h2>6. Personalized Learning and Development</h2>
            <p>AI can create personalized training programs for each team member, identifying skill gaps and recommending relevant learning materials.</p>
            
            <h2>7. Advanced Data Analysis</h2>
            <p>Transform raw data into actionable insights with AI-powered analytics that can identify trends and opportunities your team might miss.</p>
            
            <h2>8. Intelligent Project Management</h2>
            <p>AI can predict project risks, optimize resource allocation, and suggest timeline adjustments based on historical data and current progress.</p>
            
            <h2>9. Enhanced Customer Insights</h2>
            <p>AI can analyze customer behavior and preferences, providing your team with deep insights to improve products and services.</p>
            
            <h2>10. Continuous Process Optimization</h2>
            <p>AI systems continuously learn and improve, automatically optimizing workflows and processes to maximize efficiency.</p>
            
            <h2>Getting Started</h2>
            <p>Implementing AI in your team doesn't have to be overwhelming. Start with one or two tools that address your biggest pain points, then gradually expand as your team becomes comfortable with the technology.</p>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
        ],
        published: true
    },
    {
        id: 3,
        title: 'Understanding Natural Language Processing in Business',
        excerpt: 'A comprehensive guide to NLP and how it\'s being used in modern business applications.',
        category: 'Technology',
        date: '2024-12-10',
        author: 'Emily Davis',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        authorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        content: `
            <h2>What is Natural Language Processing?</h2>
            <p>Natural Language Processing (NLP) is a branch of artificial intelligence that focuses on the interaction between computers and humans through natural language. It enables machines to understand, interpret, and generate human language in a valuable way.</p>
            
            <h2>Core Components of NLP</h2>
            <p>NLP systems typically consist of several key components that work together to process and understand human language:</p>
            
            <h3>1. Text Preprocessing</h3>
            <p>This involves cleaning and preparing text data for analysis, including tokenization, stemming, and removing stop words.</p>
            
            <h3>2. Syntax Analysis</h3>
            <p>Understanding the grammatical structure of sentences to extract meaning and relationships between words.</p>
            
            <h3>3. Semantic Analysis</h3>
            <p>Determining the meaning of words and phrases in context, including understanding synonyms, antonyms, and contextual meanings.</p>
            
            <h3>4. Pragmatic Analysis</h3>
            <p>Understanding the intended meaning behind language, including sarcasm, humor, and implied meanings.</p>
            
            <h2>Business Applications of NLP</h2>
            <p>NLP is being used across various industries to solve real-world problems and improve business processes:</p>
            
            <h3>Customer Service</h3>
            <p>Chatbots and virtual assistants use NLP to understand customer queries and provide relevant responses, improving customer satisfaction and reducing response times.</p>
            
            <h3>Content Analysis</h3>
            <p>NLP can analyze large volumes of text data to extract insights, sentiment, and trends, helping businesses make data-driven decisions.</p>
            
            <h3>Document Processing</h3>
            <p>Automated document analysis and information extraction, making it easier to process contracts, reports, and other business documents.</p>
            
            <h3>Market Research</h3>
            <p>Analyzing social media posts, reviews, and feedback to understand customer sentiment and market trends.</p>
            
            <h2>Challenges and Considerations</h2>
            <p>While NLP offers tremendous potential, there are several challenges to consider when implementing NLP solutions in business:</p>
            
            <ul>
                <li><strong>Language Complexity:</strong> Human language is nuanced and context-dependent</li>
                <li><strong>Data Quality:</strong> NLP models require high-quality, diverse training data</li>
                <li><strong>Bias and Fairness:</strong> Ensuring NLP systems are fair and unbiased</li>
                <li><strong>Privacy Concerns:</strong> Handling sensitive text data responsibly</li>
            </ul>
            
            <h2>Future of NLP in Business</h2>
            <p>As NLP technology continues to advance, we can expect even more sophisticated applications that will further transform how businesses interact with customers and process information.</p>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'
        ],
        published: true
    }
];

let useCasesContent = [
    {
        id: 1,
        title: 'Healthcare Patient Management',
        description: 'Streamline patient scheduling, appointment reminders, and follow-up care coordination.',
        icon: 'fas fa-hospital',
        stats: [
            { number: '85%', label: 'Reduction in no-shows' },
            { number: '40%', label: 'Time saved' }
        ],
        tags: ['Healthcare', 'Scheduling', 'Patient Care'],
        industry: 'Healthcare',
        date: '2024-12-20',
        detailedContent: `
            <h2>Overview</h2>
            <p>Our AI-powered patient management system revolutionizes healthcare operations by automating routine tasks and providing intelligent insights that improve patient outcomes and operational efficiency.</p>
            
            <h2>Key Features</h2>
            <h3>Intelligent Scheduling</h3>
            <p>Our system automatically optimizes appointment scheduling based on patient preferences, provider availability, and historical data to minimize wait times and maximize efficiency.</p>
            
            <h3>Automated Reminders</h3>
            <p>Multi-channel reminder system that sends personalized notifications via SMS, email, and phone calls, significantly reducing no-show rates.</p>
            
            <h3>Follow-up Care Coordination</h3>
            <p>Automated follow-up scheduling and care plan management ensures patients receive timely post-treatment care and monitoring.</p>
            
            <h2>Implementation Process</h2>
            <p>Our implementation follows a proven 3-phase approach designed to minimize disruption while maximizing value:</p>
            
            <h3>Phase 1: Assessment & Integration (Weeks 1-2)</h3>
            <ul>
                <li>Comprehensive analysis of current patient management workflows</li>
                <li>Integration with existing EHR and scheduling systems</li>
                <li>Custom configuration based on practice requirements</li>
                <li>Staff training and change management preparation</li>
            </ul>
            
            <h3>Phase 2: Pilot Launch (Weeks 3-4)</h3>
            <ul>
                <li>Limited rollout with select patient groups</li>
                <li>Real-time monitoring and optimization</li>
                <li>Feedback collection and system refinement</li>
                <li>Performance metrics tracking</li>
            </ul>
            
            <h3>Phase 3: Full Deployment (Weeks 5-6)</h3>
            <ul>
                <li>Complete system activation across all departments</li>
                <li>Ongoing support and monitoring</li>
                <li>Continuous improvement based on usage data</li>
                <li>Advanced feature activation</li>
            </ul>
            
            <h2>Results & Benefits</h2>
            <p>Healthcare organizations implementing our solution typically see:</p>
            <ul>
                <li><strong>85% reduction in no-show rates</strong> through intelligent reminder systems</li>
                <li><strong>40% time savings</strong> for administrative staff</li>
                <li><strong>Improved patient satisfaction</strong> through better communication</li>
                <li><strong>Increased revenue</strong> through optimized scheduling</li>
            </ul>
            
            <h2>Technical Specifications</h2>
            <p>Our solution integrates seamlessly with major EHR systems and supports:</p>
            <ul>
                <li>HIPAA-compliant data handling</li>
                <li>Real-time synchronization with existing systems</li>
                <li>Multi-language support for diverse patient populations</li>
                <li>Mobile-responsive design for staff and patients</li>
            </ul>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop'
        ],
        published: true
    },
    {
        id: 2,
        title: 'E-commerce Customer Support',
        description: 'Handle order inquiries, product recommendations, and returns processing automatically.',
        icon: 'fas fa-shopping-cart',
        stats: [
            { number: '92%', label: 'Query resolution' },
            { number: '60%', label: 'Faster response' }
        ],
        tags: ['E-commerce', 'Support', 'Automation'],
        industry: 'E-commerce',
        date: '2024-12-18',
        detailedContent: `
            <h2>Overview</h2>
            <p>Transform your e-commerce customer support with AI-powered automation that handles inquiries, provides product recommendations, and manages returns with human-like intelligence.</p>
            
            <h2>Core Capabilities</h2>
            <h3>Intelligent Query Resolution</h3>
            <p>Our AI understands customer intent and provides accurate, helpful responses to common questions about orders, products, shipping, and returns.</p>
            
            <h3>Product Recommendation Engine</h3>
            <p>Advanced machine learning algorithms analyze customer behavior and preferences to suggest relevant products, increasing cross-sell and up-sell opportunities.</p>
            
            <h3>Automated Returns Processing</h3>
            <p>Streamlined returns management that handles return requests, generates labels, and processes refunds automatically while maintaining customer satisfaction.</p>
            
            <h2>Implementation Strategy</h2>
            <h3>Phase 1: Foundation (Weeks 1-2)</h3>
            <ul>
                <li>Integration with existing e-commerce platform</li>
                <li>Customer data analysis and segmentation</li>
                <li>Knowledge base creation and optimization</li>
                <li>AI model training with historical data</li>
            </ul>
            
            <h3>Phase 2: Testing & Optimization (Weeks 3-4)</h3>
            <ul>
                <li>Beta testing with select customer segments</li>
                <li>Performance monitoring and adjustment</li>
                <li>Response accuracy optimization</li>
                <li>Integration with CRM and support tools</li>
            </ul>
            
            <h3>Phase 3: Full Deployment (Weeks 5-6)</h3>
            <ul>
                <li>Complete system activation</li>
                <li>Staff training and handoff procedures</li>
                <li>Continuous monitoring and improvement</li>
                <li>Advanced analytics and reporting</li>
            </ul>
            
            <h2>Business Impact</h2>
            <p>E-commerce businesses using our solution experience:</p>
            <ul>
                <li><strong>92% query resolution rate</strong> without human intervention</li>
                <li><strong>60% faster response times</strong> compared to traditional support</li>
                <li><strong>25% increase in customer satisfaction</strong> scores</li>
                <li><strong>30% reduction in support costs</strong> while improving service quality</li>
            </ul>
            
            <h2>Advanced Features</h2>
            <ul>
                <li>Multi-language support for global customers</li>
                <li>Sentiment analysis for proactive issue resolution</li>
                <li>Integration with inventory management systems</li>
                <li>Real-time analytics and performance dashboards</li>
            </ul>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop'
        ],
        published: true
    },
    {
        id: 3,
        title: 'Educational Institution',
        description: 'Manage student inquiries, course information, and administrative tasks efficiently.',
        icon: 'fas fa-graduation-cap',
        stats: [
            { number: '78%', label: 'Student satisfaction' },
            { number: '50%', label: 'Admin workload' }
        ],
        tags: ['Education', 'Student Services', 'Administration'],
        industry: 'Education',
        date: '2024-12-15',
        detailedContent: `
            <h2>Overview</h2>
            <p>Empower educational institutions with AI-driven solutions that streamline student services, administrative processes, and academic support, creating a more efficient and engaging learning environment.</p>
            
            <h2>Key Solutions</h2>
            <h3>Student Information Management</h3>
            <p>Comprehensive system for handling student inquiries, course information, enrollment processes, and academic records with intelligent automation.</p>
            
            <h3>Academic Support Automation</h3>
            <p>AI-powered tutoring and academic assistance that provides personalized learning support and answers student questions 24/7.</p>
            
            <h3>Administrative Process Optimization</h3>
            <p>Automated handling of routine administrative tasks including scheduling, registration, financial aid inquiries, and campus services.</p>
            
            <h2>Implementation Approach</h2>
            <h3>Phase 1: System Integration (Weeks 1-3)</h3>
            <ul>
                <li>Integration with existing student information systems</li>
                <li>Academic calendar and course catalog synchronization</li>
                <li>Faculty and staff training programs</li>
                <li>Student communication preferences setup</li>
            </ul>
            
            <h3>Phase 2: Pilot Program (Weeks 4-6)</h3>
            <ul>
                <li>Limited rollout with select student groups</li>
                <li>Academic department-specific customization</li>
                <li>Performance monitoring and feedback collection</li>
                <li>System optimization based on usage patterns</li>
            </ul>
            
            <h3>Phase 3: Full Campus Deployment (Weeks 7-8)</h3>
            <ul>
                <li>Complete system activation across all departments</li>
                <li>Advanced analytics and reporting capabilities</li>
                <li>Ongoing support and maintenance</li>
                <li>Continuous improvement and feature updates</li>
            </ul>
            
            <h2>Measurable Outcomes</h2>
            <p>Educational institutions implementing our solution achieve:</p>
            <ul>
                <li><strong>78% improvement in student satisfaction</strong> with support services</li>
                <li><strong>50% reduction in administrative workload</strong> for staff</li>
                <li><strong>40% faster response times</strong> for student inquiries</li>
                <li><strong>25% increase in student engagement</strong> with academic resources</li>
            </ul>
            
            <h2>Specialized Features</h2>
            <ul>
                <li>Academic calendar integration and event management</li>
                <li>Course recommendation engine based on student interests</li>
                <li>Financial aid and scholarship information automation</li>
                <li>Campus life and extracurricular activity guidance</li>
            </ul>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
        ],
        published: true
    },
    {
        id: 4,
        title: 'Corporate HR Management',
        description: 'Automate employee onboarding, benefits inquiries, and policy questions.',
        icon: 'fas fa-building',
        stats: [
            { number: '90%', label: 'Query accuracy' },
            { number: '70%', label: 'HR efficiency' }
        ],
        tags: ['HR', 'Employee Services', 'Onboarding'],
        industry: 'Corporate',
        date: '2024-12-12',
        detailedContent: `
            <h2>Overview</h2>
            <p>Revolutionize your HR operations with AI-powered automation that handles employee inquiries, streamlines onboarding processes, and provides instant access to company policies and benefits information.</p>
            
            <h2>Core Functionality</h2>
            <h3>Intelligent Employee Onboarding</h3>
            <p>Automated onboarding workflows that guide new employees through paperwork, training, and orientation processes while ensuring compliance and completeness.</p>
            
            <h3>Benefits & Policy Management</h3>
            <p>AI-powered system that provides instant, accurate answers to employee questions about benefits, policies, procedures, and company guidelines.</p>
            
            <h3>HR Process Automation</h3>
            <p>Streamlined handling of common HR tasks including leave requests, expense reports, performance reviews, and employee data updates.</p>
            
            <h2>Deployment Strategy</h2>
            <h3>Phase 1: Foundation & Integration (Weeks 1-2)</h3>
            <ul>
                <li>Integration with existing HRIS and payroll systems</li>
                <li>Employee data migration and validation</li>
                <li>Policy and benefits information digitization</li>
                <li>HR team training and change management</li>
            </ul>
            
            <h3>Phase 2: Pilot & Testing (Weeks 3-4)</h3>
            <ul>
                <li>Limited rollout with select employee groups</li>
                <li>Onboarding process automation testing</li>
                <li>Benefits inquiry system validation</li>
                <li>Performance monitoring and optimization</li>
            </ul>
            
            <h3>Phase 3: Full Implementation (Weeks 5-6)</h3>
            <ul>
                <li>Complete system activation across all departments</li>
                <li>Advanced analytics and reporting setup</li>
                <li>Employee training and adoption programs</li>
                <li>Ongoing support and continuous improvement</li>
            </ul>
            
            <h2>Business Results</h2>
            <p>Organizations implementing our HR solution see:</p>
            <ul>
                <li><strong>90% accuracy rate</strong> in answering employee queries</li>
                <li><strong>70% improvement in HR efficiency</strong> and productivity</li>
                <li><strong>60% reduction in HR support tickets</strong></li>
                <li><strong>45% faster onboarding process</strong> completion</li>
            </ul>
            
            <h2>Advanced Capabilities</h2>
            <ul>
                <li>Multi-language support for global workforces</li>
                <li>Integration with payroll and time-tracking systems</li>
                <li>Compliance monitoring and reporting</li>
                <li>Employee sentiment analysis and feedback collection</li>
            </ul>
        `,
        gallery: [
            'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop'
        ],
        published: true
    }
];

// Features API
app.get('/api/content/features', (req, res) => {
    console.log('GET /api/content/features - Returning:', featuresContent);
    res.json({ features: featuresContent });
});

app.put('/api/content/features', (req, res) => {
    console.log('PUT /api/content/features - Received:', req.body);
    featuresContent = req.body.features || [];
    res.json({ message: 'Features updated successfully' });
});

// About API
app.get('/api/content/about', (req, res) => {
    console.log('GET /api/content/about - Returning:', aboutContent);
    res.json(aboutContent);
});

app.put('/api/content/about', (req, res) => {
    console.log('PUT /api/content/about - Received:', req.body);
    aboutContent = req.body;
    res.json({ message: 'About section updated successfully' });
});

// SEO API
app.get('/api/content/seo', (req, res) => {
    console.log('GET /api/content/seo - Returning:', seoContent);
    res.json(seoContent);
});

app.put('/api/content/seo', (req, res) => {
    console.log('PUT /api/content/seo - Received:', req.body);
    seoContent = req.body;
    res.json({ message: 'SEO settings updated successfully' });
});

// Theme API
app.get('/api/content/theme', (req, res) => {
    console.log('GET /api/content/theme - Returning:', themeContent);
    res.json(themeContent);
});

app.put('/api/content/theme', (req, res) => {
    console.log('PUT /api/content/theme - Received:', req.body);
    themeContent = req.body;
    res.json({ message: 'Theme settings updated successfully' });
});

// Settings API
app.get('/api/content/settings', (req, res) => {
    console.log('GET /api/content/settings - Returning:', settingsContent);
    res.json(settingsContent);
});

app.put('/api/content/settings', (req, res) => {
    console.log('PUT /api/content/settings - Received:', req.body);
    settingsContent = req.body;
    res.json({ message: 'Settings updated successfully' });
});

// Users API
app.get('/api/content/users', (req, res) => {
    console.log('GET /api/content/users - Returning:', usersContent);
    res.json(usersContent);
});

app.post('/api/content/users', (req, res) => {
    console.log('POST /api/content/users - Received:', req.body);
    const newUser = {
        id: usersContent.length + 1,
        ...req.body,
        lastLogin: 'Never'
    };
    usersContent.push(newUser);
    res.json({ message: 'User created successfully', user: newUser });
});

app.put('/api/content/users/:id', (req, res) => {
    const { id } = req.params;
    console.log(`PUT /api/content/users/${id} - Received:`, req.body);
    const userIndex = usersContent.findIndex(u => u.id == id);
    if (userIndex !== -1) {
        usersContent[userIndex] = { ...usersContent[userIndex], ...req.body };
        res.json({ message: 'User updated successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.delete('/api/content/users/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/content/users/${id}`);
    const userIndex = usersContent.findIndex(u => u.id == id);
    if (userIndex !== -1) {
        usersContent.splice(userIndex, 1);
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Media API
app.get('/api/content/media', (req, res) => {
    console.log('GET /api/content/media - Returning:', mediaContent);
    res.json(mediaContent);
});

app.post('/api/content/media/upload', (req, res) => {
    console.log('POST /api/content/media/upload - Received files');
    // In a real implementation, you would handle file upload here
    res.json({ message: 'Files uploaded successfully' });
});

app.delete('/api/content/media/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/content/media/${id}`);
    const mediaIndex = mediaContent.findIndex(m => m.id == id);
    if (mediaIndex !== -1) {
        mediaContent.splice(mediaIndex, 1);
        res.json({ message: 'File deleted successfully' });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Stats API
app.get('/api/content/stats', (req, res) => {
    const stats = {
        totalSections: 8,
        lastUpdated: '2 min ago',
        pageViews: '1,234',
        conversionRate: '3.2%'
    };
    console.log('GET /api/content/stats - Returning:', stats);
    res.json(stats);
});

// Auth API (simplified for demo)
app.post('/api/content/auth/login', (req, res) => {
    const { username, password } = req.body;
    console.log('POST /api/content/auth/login - Received:', { username });
    
    if (username === 'admin' && password === 'admin123') {
        res.json({ 
            message: 'Login successful',
            token: 'demo-token-123',
            user: { username: 'admin', role: 'admin' }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/content/auth/verify', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token === 'demo-token-123') {
        res.json({ valid: true, user: { username: 'admin', role: 'admin' } });
    } else {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Blogs API
app.get('/api/content/blogs', (req, res) => {
    console.log('GET /api/content/blogs - Returning:', blogsContent);
    // Sort blogs by date (newest first)
    const sortedBlogs = blogsContent
        .filter(blog => blog.published)
        .sort((a, b) => {
            // Convert date strings to proper Date objects
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date(0);
                // Handle format like "Dec 15, 2024"
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? new Date(0) : date;
            };
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA; // Newest first
        });
    res.json(sortedBlogs);
});

app.get('/api/content/blogs/:id', (req, res) => {
    const { id } = req.params;
    const blog = blogsContent.find(b => b.id == id && b.published);
    if (blog) {
        console.log(`GET /api/content/blogs/${id} - Returning:`, blog);
        res.json(blog);
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

// Backward compatibility - also support /api/blogs endpoints
app.get('/api/blogs', (req, res) => {
    console.log('GET /api/blogs - Returning:', blogsContent);
    // Sort blogs by date (newest first)
    const sortedBlogs = blogsContent
        .filter(blog => blog.published)
        .sort((a, b) => {
            // Convert date strings to proper Date objects
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date(0);
                // Handle format like "Dec 15, 2024"
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? new Date(0) : date;
            };
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA; // Newest first
        });
    res.json(sortedBlogs);
});

app.get('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    const blog = blogsContent.find(b => b.id == id && b.published);
    if (blog) {
        console.log(`GET /api/blogs/${id} - Returning:`, blog);
        res.json(blog);
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

// Backward compatibility PUT endpoint for blog editing
app.put('/api/blogs/:id', upload.fields([
    { name: 'blogImage', maxCount: 1 },
    { name: 'blogAuthorImage', maxCount: 1 },
    { name: 'blogGallery', maxCount: 10 }
]), (req, res) => {
    try {
        const { id } = req.params;
        console.log(`PUT /api/blogs/${id} - Received:`, req.body);
        console.log(`PUT /api/blogs/${id} - Files:`, req.files);
        
        const blogIndex = blogsContent.findIndex(b => b.id == id);
        if (blogIndex !== -1) {
            const updatedBlog = { ...blogsContent[blogIndex], ...req.body };

            // Handle uploaded files
            if (req.files) {
                if (req.files.blogImage && req.files.blogImage[0]) {
                    updatedBlog.image = `/uploads/blogs/${req.files.blogImage[0].filename}`;
                }
                if (req.files.blogAuthorImage && req.files.blogAuthorImage[0]) {
                    updatedBlog.authorImage = `/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
                }
                if (req.files.blogGallery) {
                    updatedBlog.gallery = req.files.blogGallery.map(file => `/uploads/blogs/${file.filename}`);
                }
            }

            blogsContent[blogIndex] = updatedBlog;
            res.json({ message: 'Blog updated successfully' });
        } else {
            res.status(404).json({ error: 'Blog not found' });
        }
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

// Backward compatibility POST endpoint for blog creation
app.post('/api/blogs', upload.fields([
    { name: 'blogImage', maxCount: 1 },
    { name: 'blogAuthorImage', maxCount: 1 },
    { name: 'blogGallery', maxCount: 10 }
]), (req, res) => {
    try {
        console.log('POST /api/blogs - Received:', req.body);
        console.log('POST /api/blogs - Files:', req.files);
        
        const newBlog = {
            id: blogsContent.length + 1,
            ...req.body,
            published: true,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        // Handle uploaded files
        if (req.files) {
            if (req.files.blogImage && req.files.blogImage[0]) {
                newBlog.image = `/uploads/blogs/${req.files.blogImage[0].filename}`;
            }
            if (req.files.blogAuthorImage && req.files.blogAuthorImage[0]) {
                newBlog.authorImage = `/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
            }
            if (req.files.blogGallery) {
                newBlog.gallery = req.files.blogGallery.map(file => `/uploads/blogs/${file.filename}`);
            }
        }

        blogsContent.push(newBlog);
        res.json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

app.post('/api/content/blogs', upload.fields([
    { name: 'blogImage', maxCount: 1 },
    { name: 'blogAuthorImage', maxCount: 1 },
    { name: 'blogGallery', maxCount: 10 }
]), (req, res) => {
    try {
        console.log('POST /api/content/blogs - Received:', req.body);
        console.log('POST /api/content/blogs - Files:', req.files);
        
        const newBlog = {
            id: blogsContent.length + 1,
            ...req.body,
            published: true,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        // Handle uploaded files
        if (req.files) {
            if (req.files.blogImage && req.files.blogImage[0]) {
                newBlog.image = `/uploads/blogs/${req.files.blogImage[0].filename}`;
            }
            if (req.files.blogAuthorImage && req.files.blogAuthorImage[0]) {
                newBlog.authorImage = `/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
            }
            if (req.files.blogGallery) {
                newBlog.gallery = req.files.blogGallery.map(file => `/uploads/blogs/${file.filename}`);
            }
        }

        blogsContent.push(newBlog);
        res.json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
});

app.put('/api/content/blogs/:id', upload.fields([
    { name: 'blogImage', maxCount: 1 },
    { name: 'blogAuthorImage', maxCount: 1 },
    { name: 'blogGallery', maxCount: 10 }
]), (req, res) => {
    try {
        const { id } = req.params;
        console.log(`PUT /api/content/blogs/${id} - Received:`, req.body);
        console.log(`PUT /api/content/blogs/${id} - Files:`, req.files);
        
        const blogIndex = blogsContent.findIndex(b => b.id == id);
        if (blogIndex !== -1) {
            const updatedBlog = { ...blogsContent[blogIndex], ...req.body };

            // Handle uploaded files
            if (req.files) {
                if (req.files.blogImage && req.files.blogImage[0]) {
                    updatedBlog.image = `/uploads/blogs/${req.files.blogImage[0].filename}`;
                }
                if (req.files.blogAuthorImage && req.files.blogAuthorImage[0]) {
                    updatedBlog.authorImage = `/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
                }
                if (req.files.blogGallery) {
                    updatedBlog.gallery = req.files.blogGallery.map(file => `/uploads/blogs/${file.filename}`);
                }
            }

            blogsContent[blogIndex] = updatedBlog;
            res.json({ message: 'Blog updated successfully' });
        } else {
            res.status(404).json({ error: 'Blog not found' });
        }
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Failed to update blog' });
    }
});

app.delete('/api/content/blogs/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/content/blogs/${id}`);
    const blogIndex = blogsContent.findIndex(b => b.id == id);
    if (blogIndex !== -1) {
        blogsContent.splice(blogIndex, 1);
        res.json({ message: 'Blog deleted successfully' });
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

// Backward compatibility DELETE endpoint for blog deletion
app.delete('/api/blogs/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/blogs/${id}`);
    const blogIndex = blogsContent.findIndex(b => b.id == id);
    if (blogIndex !== -1) {
        blogsContent.splice(blogIndex, 1);
        res.json({ message: 'Blog deleted successfully' });
    } else {
        res.status(404).json({ error: 'Blog not found' });
    }
});

// Case Studies API
app.get('/api/content/casestudies', (req, res) => {
    console.log('GET /api/content/casestudies - Returning:', caseStudiesContent);
    // Sort case studies by date (newest first)
    const sortedCaseStudies = caseStudiesContent
        .filter(caseStudy => caseStudy.published)
        .sort((a, b) => {
            // Convert date strings to proper Date objects
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date(0);
                // Handle format like "Dec 15, 2024"
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? new Date(0) : date;
            };
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA; // Newest first
        });
    res.json(sortedCaseStudies);
});

app.get('/api/content/casestudies/:id', (req, res) => {
    const { id } = req.params;
    const caseStudy = caseStudiesContent.find(c => c.id == id && c.published);
    if (caseStudy) {
        console.log(`GET /api/content/casestudies/${id} - Returning:`, caseStudy);
        res.json(caseStudy);
    } else {
        res.status(404).json({ error: 'Case study not found' });
    }
});

app.post('/api/content/casestudies', upload.fields([
    { name: 'caseStudyImage', maxCount: 1 },
    { name: 'caseStudyGallery', maxCount: 10 }
]), (req, res) => {
    try {
        console.log('POST /api/content/casestudies - Received:', req.body);
        console.log('POST /api/content/casestudies - Files:', req.files);
        
        const newCaseStudy = {
            id: caseStudiesContent.length + 1,
            ...req.body,
            published: true,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        // Handle uploaded files
        if (req.files) {
            if (req.files.caseStudyImage && req.files.caseStudyImage[0]) {
                newCaseStudy.image = `/uploads/casestudies/${req.files.caseStudyImage[0].filename}`;
            }
            if (req.files.caseStudyGallery && req.files.caseStudyGallery.length > 0) {
                newCaseStudy.gallery = req.files.caseStudyGallery.map(file => `/uploads/casestudies/${file.filename}`);
            }
        }

        // Parse results and tags from strings
        if (req.body.results) {
            try {
                newCaseStudy.results = JSON.parse(req.body.results);
            } catch (e) {
                newCaseStudy.results = [];
            }
        }
        if (req.body.tags) {
            try {
                newCaseStudy.tags = JSON.parse(req.body.tags);
            } catch (e) {
                newCaseStudy.tags = req.body.tags.split(',').map(tag => tag.trim());
            }
        }

        caseStudiesContent.push(newCaseStudy);
        console.log('POST /api/content/casestudies - Created:', newCaseStudy);
        res.json({ message: 'Case study created successfully', caseStudy: newCaseStudy });
    } catch (error) {
        console.error('Error creating case study:', error);
        res.status(500).json({ error: 'Failed to create case study' });
    }
});

app.put('/api/content/casestudies/:id', upload.fields([
    { name: 'caseStudyImage', maxCount: 1 },
    { name: 'caseStudyGallery', maxCount: 10 }
]), (req, res) => {
    try {
        const { id } = req.params;
        console.log(`PUT /api/content/casestudies/${id} - Received:`, req.body);
        console.log(`PUT /api/content/casestudies/${id} - Files:`, req.files);
        
        const caseStudyIndex = caseStudiesContent.findIndex(c => c.id == id);
        if (caseStudyIndex !== -1) {
            const updatedCaseStudy = { ...caseStudiesContent[caseStudyIndex], ...req.body };

            // Handle uploaded files
            if (req.files) {
                if (req.files.caseStudyImage && req.files.caseStudyImage[0]) {
                    updatedCaseStudy.image = `/uploads/casestudies/${req.files.caseStudyImage[0].filename}`;
                }
                if (req.files.caseStudyGallery && req.files.caseStudyGallery.length > 0) {
                    updatedCaseStudy.gallery = req.files.caseStudyGallery.map(file => `/uploads/casestudies/${file.filename}`);
                }
            }

            // Parse results and tags from strings
            if (req.body.results) {
                try {
                    updatedCaseStudy.results = JSON.parse(req.body.results);
                } catch (e) {
                    // Keep existing results if parsing fails
                }
            }
            if (req.body.tags) {
                try {
                    updatedCaseStudy.tags = JSON.parse(req.body.tags);
                } catch (e) {
                    updatedCaseStudy.tags = req.body.tags.split(',').map(tag => tag.trim());
                }
            }

            caseStudiesContent[caseStudyIndex] = updatedCaseStudy;
            console.log(`PUT /api/content/casestudies/${id} - Updated:`, updatedCaseStudy);
            res.json({ message: 'Case study updated successfully', caseStudy: updatedCaseStudy });
        } else {
            res.status(404).json({ error: 'Case study not found' });
        }
    } catch (error) {
        console.error('Error updating case study:', error);
        res.status(500).json({ error: 'Failed to update case study' });
    }
});

app.delete('/api/content/casestudies/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/content/casestudies/${id}`);
    const caseStudyIndex = caseStudiesContent.findIndex(c => c.id == id);
    if (caseStudyIndex !== -1) {
        caseStudiesContent.splice(caseStudyIndex, 1);
        res.json({ message: 'Case study deleted successfully' });
    } else {
        res.status(404).json({ error: 'Case study not found' });
    }
});

// Use Cases API
app.get('/api/content/usecases', (req, res) => {
    console.log('GET /api/content/usecases - Returning:', useCasesContent);
    // Sort use cases by date (newest first)
    const sortedUseCases = useCasesContent
        .filter(useCase => useCase.published)
        .sort((a, b) => {
            // Convert date strings to proper Date objects
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date(0);
                // Handle format like "Dec 15, 2024"
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? new Date(0) : date;
            };
            const dateA = parseDate(a.date || a.createdAt);
            const dateB = parseDate(b.date || b.createdAt);
            return dateB - dateA; // Newest first
        });
    res.json(sortedUseCases);
});

app.get('/api/content/usecases/:id', (req, res) => {
    const { id } = req.params;
    const useCase = useCasesContent.find(u => u.id == id && u.published);
    if (useCase) {
        console.log(`GET /api/content/usecases/${id} - Returning:`, useCase);
        res.json(useCase);
    } else {
        res.status(404).json({ error: 'Use case not found' });
    }
});

app.post('/api/content/usecases', upload.fields([
    { name: 'useCaseGallery', maxCount: 10 }
]), (req, res) => {
    try {
        console.log('POST /api/content/usecases - Received:', req.body);
        console.log('POST /api/content/usecases - Files:', req.files);
        
        const newUseCase = {
            id: useCasesContent.length + 1,
            ...req.body,
            published: true,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        // Handle uploaded files
        if (req.files && req.files.useCaseGallery) {
            newUseCase.gallery = req.files.useCaseGallery.map(file => `/uploads/usecases/${file.filename}`);
        }

        useCasesContent.push(newUseCase);
        res.json({ message: 'Use case created successfully', useCase: newUseCase });
    } catch (error) {
        console.error('Error creating use case:', error);
        res.status(500).json({ error: 'Failed to create use case' });
    }
});

app.put('/api/content/usecases/:id', upload.fields([
    { name: 'useCaseGallery', maxCount: 10 }
]), (req, res) => {
    try {
        const { id } = req.params;
        console.log(`PUT /api/content/usecases/${id} - Received:`, req.body);
        console.log(`PUT /api/content/usecases/${id} - Files:`, req.files);
        
        const useCaseIndex = useCasesContent.findIndex(u => u.id == id);
        if (useCaseIndex !== -1) {
            const updatedUseCase = { ...useCasesContent[useCaseIndex], ...req.body };

            // Handle uploaded files
            if (req.files && req.files.useCaseGallery) {
                updatedUseCase.gallery = req.files.useCaseGallery.map(file => `/uploads/usecases/${file.filename}`);
            }

            useCasesContent[useCaseIndex] = updatedUseCase;
            res.json({ message: 'Use case updated successfully' });
        } else {
            res.status(404).json({ error: 'Use case not found' });
        }
    } catch (error) {
        console.error('Error updating use case:', error);
        res.status(500).json({ error: 'Failed to update use case' });
    }
});

app.delete('/api/content/usecases/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/content/usecases/${id}`);
    const useCaseIndex = useCasesContent.findIndex(u => u.id == id);
    if (useCaseIndex !== -1) {
        useCasesContent.splice(useCaseIndex, 1);
        res.json({ message: 'Use case deleted successfully' });
    } else {
        res.status(404).json({ error: 'Use case not found' });
    }
});

// Pricing Content
let pricingContent = {
    title: 'Custom Pricing Plans',
    subtitle: 'Tailored solutions for every organization\'s unique needs',
    plans: [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Perfect for small teams getting started with AI automation',
            features: [
                'Up to 1,000 conversations/month',
                'Basic AI capabilities',
                'Email & SMS integration',
                'Standard support'
            ],
            price: 'Custom',
            period: 'Contact Sales',
            featured: false,
            buttonText: 'Contact Sales',
            buttonStyle: 'outline'
        },
        {
            id: 'professional',
            name: 'Professional',
            description: 'Ideal for growing businesses that need advanced AI capabilities',
            features: [
                'Up to 10,000 conversations/month',
                'Advanced AI capabilities',
                'Multi-channel integration',
                'Custom workflows',
                'Priority support'
            ],
            price: 'Custom',
            period: 'Contact Sales',
            featured: true,
            buttonText: 'Contact Sales',
            buttonStyle: 'primary'
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Complete solution for large organizations with complex requirements',
            features: [
                'Unlimited conversations',
                'Full AI customization',
                'All integrations included',
                'Dedicated account manager',
                '24/7 premium support'
            ],
            price: 'Custom',
            period: 'Contact Sales',
            featured: false,
            buttonText: 'Contact Sales',
            buttonStyle: 'outline'
        }
    ],
    customSolutions: {
        title: 'Need a Custom Solution?',
        description: 'Every organization is unique. Let\'s work together to create the perfect AI solution for your specific needs, industry requirements, and scale.',
        features: [
            'Tailored AI training',
            'Industry-specific customization',
            'Dedicated implementation team',
            'Ongoing optimization'
        ]
    }
};

// Contact Sales Submissions
let contactSubmissions = [];

// Pricing API endpoints
app.get('/api/content/pricing', (req, res) => {
    console.log('GET /api/content/pricing - Returning:', pricingContent);
    res.json(pricingContent);
});

app.put('/api/content/pricing', (req, res) => {
    console.log('PUT /api/content/pricing - Received:', req.body);
    pricingContent = req.body;
    console.log('Pricing content updated:', pricingContent);
    res.json({ message: 'Pricing content updated successfully' });
});

// Contact Sales API endpoints
app.post('/api/contact-sales', (req, res) => {
    try {
        console.log('POST /api/contact-sales - Received:', req.body);
        
        const submission = {
            id: contactSubmissions.length + 1,
            ...req.body,
            submittedAt: new Date().toISOString(),
            status: 'new'
        };
        
        contactSubmissions.push(submission);
        
        // In a real application, you would:
        // 1. Save to database
        // 2. Send email notification to sales team
        // 3. Send confirmation email to customer
        // 4. Create CRM lead
        
        console.log('Contact sales submission created:', submission);
        
        res.json({ 
            success: true, 
            message: 'Thank you for your interest! Our sales team will contact you within 24 hours.',
            submissionId: submission.id
        });
    } catch (error) {
        console.error('Error processing contact sales submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit your request. Please try again.' 
        });
    }
});

app.get('/api/contact-sales', (req, res) => {
    console.log('GET /api/contact-sales - Returning submissions');
    res.json(contactSubmissions);
});

app.get('/api/contact-sales/:id', (req, res) => {
    const { id } = req.params;
    const submission = contactSubmissions.find(s => s.id == id);
    
    if (submission) {
        console.log(`GET /api/contact-sales/${id} - Returning:`, submission);
        res.json(submission);
    } else {
        res.status(404).json({ error: 'Submission not found' });
    }
});

app.put('/api/contact-sales/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    console.log(`PUT /api/contact-sales/${id} - Received:`, req.body);
    
    const submissionIndex = contactSubmissions.findIndex(s => s.id == id);
    if (submissionIndex !== -1) {
        contactSubmissions[submissionIndex] = {
            ...contactSubmissions[submissionIndex],
            status: status || contactSubmissions[submissionIndex].status,
            notes: notes || contactSubmissions[submissionIndex].notes,
            updatedAt: new Date().toISOString()
        };
        
        console.log(`Contact sales submission ${id} updated:`, contactSubmissions[submissionIndex]);
        res.json({ message: 'Submission updated successfully' });
    } else {
        res.status(404).json({ error: 'Submission not found' });
    }
});

// Website settings storage (in-memory for demo)
let websiteSettings = {
    logo_url: {
        value: 'Logo And Recording/cropped_circle_image.png',
        type: 'text',
        description: 'Website logo URL'
    },
    logo_alt_text: {
        value: 'Emma Logo',
        type: 'text',
        description: 'Logo alt text for accessibility'
    },
    site_title: {
        value: 'Emma - By KodeFast',
        type: 'text',
        description: 'Main website title'
    }
};

// Website settings routes
app.get('/api/settings', (req, res) => {
    try {
        console.log('GET /api/settings - Returning:', websiteSettings);
        res.json(websiteSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/settings/:key', (req, res) => {
    try {
        const { key } = req.params;
        const { value, type } = req.body;
        
        console.log(`PUT /api/settings/${key} - Received:`, { value, type });
        
        if (!websiteSettings[key]) {
            websiteSettings[key] = {};
        }
        
        websiteSettings[key].value = value;
        websiteSettings[key].type = type || 'text';
        websiteSettings[key].updatedAt = new Date().toISOString();
        
        console.log(`Setting ${key} updated successfully`);
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logo upload endpoint
app.post('/api/upload/logo', upload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No logo file uploaded' });
        }
        
        const logoUrl = `/uploads/logo/${req.file.filename}`;
        console.log('Logo uploaded:', logoUrl);
        
        // Update the logo_url setting
        if (!websiteSettings.logo_url) {
            websiteSettings.logo_url = {};
        }
        websiteSettings.logo_url.value = logoUrl;
        websiteSettings.logo_url.type = 'text';
        websiteSettings.logo_url.updatedAt = new Date().toISOString();
        
        res.json({ 
            message: 'Logo uploaded successfully',
            url: logoUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Working Hero Server running on port 3000');
    console.log('📱 Main website: http://localhost:3000');
    console.log('🔧 Admin dashboard: http://localhost:3000/admin');
});
