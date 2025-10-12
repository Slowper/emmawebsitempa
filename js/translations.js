// Translation data for Hi Emma website
// English (en) and Arabic (ar) translations

const translations = {
    en: {
        // Navigation
        nav: {
            home: "Home",
            about: "About",
            pricing: "Pricing",
            resources: "Resources",
            schedule_demo: "Schedule Demo",
            contact: "Contact",
            book_demo: "Book a Demo"
        },
        
        // Logo/Brand
        brand: {
            name: "Hi Emma",
            tagline: "AI Assistant",
            ai_assistant: "AI Assistant"
        },
        
        // Hero Section
        hero: {
            title: "Meet Emma",
            subtitle: "Your Intelligent AI Assistant",
            description: "Transform your business with AI that understands, learns, and adapts. From healthcare, banking, and education - Emma delivers results across key sectors.",
            cta_primary: "Talk to Her Now",
            cta_secondary: "Learn More",
            trusted_by: "Made For Industry Leaders",
            see_how: "See how Emma transforms operations across sectors",
            conversation: {
                user1: "Hello Emma!",
                emma1: "Hi! How can I help you today?",
                user2: "I need assistance",
                emma2: "I'm here to help! What do you need?"
            }
        },
        
        // Workflow Section
        workflow: {
            analyze: "Analyze",
            learn: "Learn",
            adapt: "Adapt",
            deliver: "Deliver"
        },
        
        // Use Cases Section
        use_cases: {
            healthcare: {
                title: "Healthcare",
                description: "Automates patient calls, bookings, and reminders with 24/7 voice support.",
                stats: {
                    efficiency: "60% efficiency",
                    compliance: "HIPAA compliant"
                }
            },
            recruitment: {
                title: "Recruitment",
                description: "Intelligent candidate screening, automated interviews, and talent matching",
                stats: {
                    time_saved: "70% time saved",
                    quality: "Better candidate quality"
                }
            },
            retail: {
                title: "Retail",
                description: "Personalized shopping, virtual assistants, and demand forecasting",
                stats: {
                    conversion: "70% conversion",
                    inventory: "Smart inventory"
                }
            },
            banking: {
                title: "Banking",
                description: "Customer service automation, fraud detection, and financial advisory",
                stats: {
                    faster: "40% faster",
                    accurate: "99.9% accurate"
                }
            },
            education: {
                title: "Education",
                description: "Student support, course management, and personalized learning",
                stats: {
                    engagement: "85% engagement",
                    support: "24/7 support"
                }
            },
            customer_service: {
                title: "Customer Service",
                description: "24/7 support, ticket management, and customer satisfaction",
                stats: {
                    satisfaction: "95% satisfaction",
                    response: "Instant response"
                }
            }
        },
        
        // Home Page Specific
        home: {
            hero_title: "Meet Emma\nYour Intelligent AI Assistant",
            trusted_by: "Made For Industry Leaders",
            capabilities_title: "Emma's Core Capabilities",
            capabilities_subtitle: "Intelligent automation that adapts, learns, and takes initiative",
            industries_title: "Industry Solutions",
            industries_subtitle: "Tailored AI solutions for every sector",
            use_cases_title: "Use Cases",
            use_cases_subtitle: "Real-world applications across industries",
            ready_title: "Ready to Transform Your Industry?",
            ready_subtitle: "Be among the first to experience the future of AI automation",
            trusted_title: "Trusted & Certified",
            footer_title: "Emma AI",
            product: "Product",
            company: "Company",
            support: "Support",
            legal: "Legal",
            stay_updated: "Stay Updated"
        },
        
        // Features Section
        features: {
            title: "Emma Features",
            subtitle: "Powerful capabilities that make Emma the perfect AI assistant for your business",
            multilingual: {
                title: "Multilingual & Accent Support.",
                subtitle: "Communicate naturally in 50+ languages.",
                description: "Perfect accent recognition and cultural context understanding across all major languages and dialects worldwide."
            },
            conversations: {
                title: "Human Conversations.",
                subtitle: "Out of the box, natural dialogue.",
                description: "Pre-trained to understand context and emotion, ready to engage naturally from day one."
            },
            customizable: {
                title: "Customizable Name & Avatar.",
                subtitle: "Personalize Emma's appearance and identity.",
                description: "Match your brand identity with customizable avatars, names, and personality traits that reflect your company culture."
            },
            security: {
                title: "Enterprise-Grade Security.",
                subtitle: "Bank-level encryption and compliance.",
                description: "SOC 2, HIPAA, and GDPR certified with military-grade encryption ensuring your data is always protected and compliant."
            },
            industry: {
                title: "Industry & Domain Agnostic.",
                subtitle: "Out of the box, ready for any sector.",
                description: "Pre-configured for healthcare, finance, education, and more. Deploy immediately without custom training."
            },
            availability: {
                title: "24/7 Availability.",
                subtitle: "Never sleeps, never takes breaks.",
                description: "Emma is always ready to assist your customers around the clock with 99.9% uptime guarantee and instant response times."
            },
            integrations: {
                title: "Seamless Integrations.",
                subtitle: "Connects effortlessly with your existing tools.",
                description: "Integrate with 50+ platforms including CRM systems, messaging platforms, and custom APIs for a unified workflow experience."
            },
            analytics: {
                title: "Post-call Analytics",
                subtitle: "Comprehensive insights to optimize performance.",
                description: "Real-time reporting with 50+ key metrics to track performance and make data-driven decisions."
            }
        },
        
        // Architecture Section
        architecture: {
            title: "Emma Architecture",
            subtitle: "Watch how Emma transforms your request into intelligent action",
            step1: {
                title: "It all starts with a question.",
                description: "Emma receives your request through voice, text, or multi-modal input in any language",
                tag1: "Voice",
                tag2: "Text",
                tag3: "Multi-modal"
            },
            step2: {
                title: "Emma listens, understands, and thinks.",
                description: "Advanced NLP identifies entities, intent, and context from your request",
                tag1: "NLP",
                tag2: "Context",
                tag3: "Intent"
            },
            step3: {
                title: "Connecting the dots and learning.",
                description: "Emma applies reasoning, memory, and learning to make intelligent decisions",
                tag1: "Reasoning",
                tag2: "Memory",
                tag3: "Learning"
            },
            step4: {
                title: "Crafting the perfect response.",
                description: "Emma generates personalized, contextual responses that feel genuinely human",
                tag1: "Personalized",
                tag2: "Contextual",
                tag3: "Natural"
            },
            step5: {
                title: "Putting the answer into action.",
                description: "Emma seamlessly integrates with your tools to execute the requested action",
                tag1: "APIs",
                tag2: "Webhooks",
                tag3: "Real-time"
            }
        },
        
        // Enterprises Section
        enterprises: {
            title: "Built for the world's largest enterprises.",
            heading: "Creating value in weeks, not months.",
            description: "Don't waste months on complex AI implementations that don't deliver results. Work with Emma's intelligent automation that understands your business, learns from your data, and adapts to your unique needs."
        },
        
        // Capabilities Section
        capabilities: {
            title: "Emma's Core Capabilities",
            subtitle: "Intelligent automation that adapts, learns, and takes initiative",
            scheduling: {
                title: "Conversational Scheduling",
                description: "Manages bookings, reschedules, and sends reminders across WhatsApp, SMS, email, and voice",
                demo_user: "Schedule a meeting for tomorrow at 2 PM",
                demo_emma: "I've scheduled your meeting and sent confirmations!"
            },
            intelligence: {
                title: "Smart Pre-Qualification",
                description: "Gathers input, prioritizes urgent needs, and routes requests to the right place automatically",
                demo_user: "I need help with my account",
                demo_emma: "I'll gather some details and connect you with the right specialist"
            },
            personalization: {
                title: "Hyper-Personalized Engagement",
                description: "Delivers relevant nudges and follow-ups in multiple languages and tones",
                demo_user: "Follow up with our VIP clients",
                demo_emma: "Personalized messages sent in their preferred language!"
            }
        },
        
        // Industries Section
        industries: {
            title: "Industry Solutions",
            subtitle: "Tailored AI agents for your specific industry needs",
            healthcare: {
                title: "Healthcare",
                features: {
                    virtual_assistant: {
                        title: "Virtual Health Assistant",
                        description: "24/7 patient support and symptom assessment"
                    },
                    patient_management: {
                        title: "Patient Management",
                        description: "Intelligent care coordination and monitoring"
                    },
                    symptom_checker: {
                        title: "Symptom Checker",
                        description: "AI-powered diagnostic assistance"
                    }
                }
            },
            banking: {
                title: "Banking",
                features: {
                    fraud_detection: {
                        title: "Fraud Detection",
                        description: "Real-time transaction monitoring and protection"
                    },
                    personal_finance: {
                        title: "Personal Finance Agent",
                        description: "Intelligent budgeting and investment advice"
                    },
                    chatbot_banker: {
                        title: "Chatbot Banker",
                        description: "24/7 customer service and account management"
                    }
                }
            },
            education: {
                title: "Education",
                features: {
                    ai_tutor: {
                        title: "AI Tutor",
                        description: "Personalized learning experiences and guidance"
                    },
                    adaptive_testing: {
                        title: "Adaptive Testing",
                        description: "Dynamic assessment based on student performance"
                    },
                    curriculum_design: {
                        title: "Curriculum Design",
                        description: "AI-powered educational content creation"
                    }
                }
            },
            recruitment: {
                title: "Recruitment",
                features: {
                    candidate_screening: {
                        title: "Intelligent Screening",
                        description: "AI-powered candidate assessment and filtering"
                    },
                    automated_interviews: {
                        title: "Automated Interviews",
                        description: "Conduct initial interviews and gather insights"
                    },
                    talent_matching: {
                        title: "Talent Matching",
                        description: "Smart job-candidate matching algorithms"
                    }
                }
            },
            retail: {
                title: "Retail",
                features: {
                    personalized_shopping: {
                        title: "Personalized Shopping",
                        description: "AI-powered product recommendations"
                    },
                    virtual_assistant: {
                        title: "Virtual Assistant",
                        description: "24/7 customer support and guidance"
                    },
                    demand_forecasting: {
                        title: "Demand Forecasting",
                        description: "Smart inventory and pricing optimization"
                    }
                }
            },
            finance: {
                title: "Finance",
                features: {
                    risk_assessment: {
                        title: "Risk Assessment",
                        description: "Advanced fraud detection and compliance"
                    },
                    algorithmic_trading: {
                        title: "Algorithmic Trading",
                        description: "AI-driven investment strategies"
                    },
                    financial_advisor: {
                        title: "Financial Advisor",
                        description: "Personalized wealth management"
                    }
                }
            },
            cta: {
                title: "Ready to Transform Your Industry?",
                description: "Discover how Emma's revolutionary AI agents can transform your operations and deliver exceptional results.",
                stats: {
                    companies: "Companies",
                    industries: "Industries",
                    uptime: "Uptime"
                },
                buttons: {
                    start_trial: "Start Free Trial",
                    schedule_demo: "Schedule Demo"
                }
            }
        },
        
        // Use Cases
        use_cases: {
            healthcare: {
                title: "Healthcare",
                description: "Automates patient calls, bookings, and reminders with 24/7 voice support.",
                stats: {
                    efficiency: "60% efficiency",
                    compliance: "HIPAA compliant"
                }
            },
            recruitment: {
                title: "Recruitment",
                description: "Intelligent candidate screening, automated interviews, and talent matching",
                stats: {
                    time_saved: "70% time saved",
                    quality: "Better candidate quality"
                }
            },
            retail: {
                title: "Retail",
                description: "Personalized shopping, virtual assistants, and demand forecasting",
                stats: {
                    conversion: "70% conversion",
                    inventory: "Smart inventory"
                }
            },
            banking: {
                title: "Banking",
                description: "Customer service automation, fraud detection, and financial advisory",
                stats: {
                    faster: "40% faster",
                    accurate: "99.9% accurate"
                }
            },
            education: {
                title: "Education",
                description: "Student support, course management, and personalized learning",
                stats: {
                    engagement: "85% engagement",
                    support: "24/7 support"
                }
            },
            customer_service: {
                title: "Customer Service",
                description: "24/7 support, ticket management, and customer satisfaction",
                stats: {
                    satisfaction: "95% satisfaction",
                    response: "Instant response"
                }
            }
        },
        
        // Security & Compliance
        security: {
            title: "Trusted & Certified",
            description: "Our platform meets the highest security and compliance standards to protect your data and ensure regulatory compliance."
        },
        
        // CTA Section
        cta: {
            title: "Ready to Transform Your Operations?",
            description: "Let's work together to create the perfect AI solution for your organization.",
            button: "Get Started Today"
        },
        
        // Footer
        footer: {
            brand: {
                name: "Hi Emma",
                tagline: "Intelligent AI Assistant Platform by KodeFast",
                description: "Building the future of autonomous AI agents. Transform your operations with intelligent automation across Healthcare, Banking, Education, and more."
            },
            columns: {
                product: {
                    title: "Product",
                    features: "Features",
                    pricing: "Pricing",
                    integrations: "Integrations",
                    api: "API",
                    security: "Security"
                },
                industries: {
                    title: "Industries",
                    healthcare: "Healthcare",
                    banking: "Banking & Finance",
                    education: "Education",
                    manufacturing: "Manufacturing",
                    retail: "Retail"
                },
                company: {
                    title: "Company",
                    about_kodefast: "About KodeFast",
                    about: "About Us",
                    careers: "Careers",
                    blog: "Blog",
                    press: "Press",
                    partners: "Partners"
                },
                support: {
                    title: "Support",
                    help: "Help Center",
                    contact: "Contact Us",
                    status: "System Status",
                    documentation: "Documentation",
                    community: "Community"
                }
            },
            newsletter: {
                title: "Stay Updated",
                description: "Get the latest AI insights and product updates delivered to your inbox.",
                placeholder: "Enter your email",
                button: "Subscribe",
                disclaimer: "We respect your privacy. Unsubscribe at any time."
            },
            copyright: "KodeFast. All rights reserved. Building the future of autonomous AI agents.",
            legal: {
                privacy: "Privacy Policy",
                terms: "Terms of Service",
                cookies: "Cookie Policy",
                accessibility: "Accessibility"
            }
        },
        
        // Common
        common: {
            learn_more: "Learn More",
            get_started: "Get Started",
            contact_us: "Contact Us",
            read_more: "Read More",
            view_all: "View All",
            submit: "Submit",
            send: "Send",
            cancel: "Cancel",
            close: "Close",
            next: "Next",
            previous: "Previous",
            back: "Back",
            continue: "Continue",
            save: "Save",
            edit: "Edit",
            delete: "Delete",
            view: "View",
            download: "Download",
            upload: "Upload",
            search: "Search",
            filter: "Filter",
            sort: "Sort",
            refresh: "Refresh",
            loading: "Loading...",
            error: "Error",
            success: "Success",
            warning: "Warning",
            info: "Information"
        },

        // 404 Page
        error404: {
            title: "404 - Page Not Found",
            subtitle: "Page Not Found",
            description: "Sorry, the page you're looking for doesn't exist or has been moved. Don't worry, our AI agents are here to help you find what you need.",
            go_home: "Go Home",
            contact_support: "Contact Support",
            popular_pages: "Popular Pages",
            home_title: "Home - Emma AI Platform",
            home_desc: "Discover our AI automation solutions",
            about_title: "About - Learn about our mission",
            about_desc: "Revolutionizing operations through AI",
            pricing_title: "Pricing - Custom AI solutions",
            pricing_desc: "Tailored solutions for every organization",
            resources_title: "Resources - Blog & case studies",
            resources_desc: "Explore insights and best practices",
            contact_title: "Contact - Get in touch",
            contact_desc: "Ready to transform your operations?"
        },

        // Footer
        footer: {
            brand: {
                name: "Hi Emma",
                tagline: "Intelligent AI Assistant Platform by KodeFast",
                description: "Building the future of autonomous AI agents. Transform your operations with intelligent automation across Healthcare, Banking, Education, and more."
            },
            columns: {
                product: {
                    title: "Product",
                    features: "Features",
                    pricing: "Pricing",
                    integrations: "Integrations",
                    api: "API",
                    security: "Security"
                },
                company: {
                    title: "Company",
                    about_us: "About Us",
                    careers: "Careers",
                    blog: "Blog",
                    press: "Press",
                    partners: "Partners"
                },
                support: {
                    title: "Support",
                    help_center: "Help Center",
                    contact_us: "Contact Us",
                    system_status: "System Status",
                    documentation: "Documentation",
                    community: "Community"
                },
                legal: {
                    title: "Legal",
                    privacy_policy: "Privacy Policy",
                    terms_of_service: "Terms of Service",
                    cookie_policy: "Cookie Policy",
                    accessibility: "Accessibility"
                }
            },
            newsletter: {
                title: "Stay Updated",
                description: "Get the latest AI insights and product updates delivered to your inbox.",
                placeholder: "Enter your email",
                subscribe: "Subscribe",
                disclaimer: "We respect your privacy. Unsubscribe at any time."
            },
            bottom: {
                copyright: "© 2025 KodeFast. All rights reserved. Building the future of autonomous AI agents.",
                privacy_policy: "Privacy Policy",
                terms_of_service: "Terms of Service",
                cookie_policy: "Cookie Policy",
                accessibility: "Accessibility"
            }
        },

        // Pricing Page
        pricing: {
            title: "Custom Pricing Plans",
            subtitle: "Tailored solutions for every organization's unique needs",
            description: "Discover Hi Emma's custom pricing plans tailored for every organization. Get transparent pricing for AI automation solutions in Healthcare, Banking, and Education.",
            plans: {
                starter: {
                    name: "Starter",
                    price: "Custom",
                    period: "Contact Sales",
                    description: "Perfect for small teams getting started with AI automation",
                    features: [
                        "Up to 1,000 conversations/month",
                        "Basic AI capabilities",
                        "Email & SMS integration",
                        "Standard support",
                        "Basic analytics",
                        "API access"
                    ],
                    button: "Contact Sales"
                },
                professional: {
                    name: "Professional",
                    price: "Custom",
                    period: "Contact Sales",
                    description: "Advanced features for growing organizations",
                    features: [
                        "Up to 10,000 conversations/month",
                        "Advanced AI capabilities",
                        "Multi-channel integration",
                        "Custom workflows",
                        "Priority support",
                        "Advanced analytics",
                        "Full API access",
                        "Custom integrations"
                    ],
                    button: "Contact Sales"
                },
                enterprise: {
                    name: "Enterprise",
                    price: "Custom",
                    period: "Contact Sales",
                    description: "Complete solution for large organizations",
                    features: [
                        "Unlimited conversations",
                        "Full AI customization",
                        "All integrations included",
                        "Dedicated account manager",
                        "24/7 premium support",
                        "Enterprise analytics",
                        "White-label options",
                        "On-premise deployment",
                        "SLA guarantees"
                    ],
                    button: "Contact Sales"
                }
            },
            custom_solutions: {
                title: "Need a Custom Solution?",
                description: "Every organization is unique. Let's work together to create the perfect AI solution for your specific needs, industry requirements, and scale.",
                features: [
                    {
                        title: "Tailored AI Capabilities",
                        description: "Custom AI models trained specifically for your industry and use cases"
                    },
                    {
                        title: "Industry-Specific Customization",
                        description: "Deep domain expertise applied to your specific industry requirements"
                    },
                    {
                        title: "Scalable Architecture",
                        description: "Infrastructure designed to grow with your organization's needs"
                    },
                    {
                        title: "Dedicated Support Team",
                        description: "Expert support team dedicated to your success and implementation"
                    }
                ],
                button: "Get Custom Quote"
            }
        },

        // Contact Page
        contact: {
            title: "Contact Us",
            subtitle: "Ready to transform your operations with AI? Let's discuss your needs and find the perfect solution.",
            hero: {
                title: "Contact Us",
                subtitle: "Ready to transform your operations with AI? Let's discuss your needs and find the perfect solution.",
                stats: {
                    response_time: "Response Time",
                    satisfaction: "Satisfaction",
                    consultation: "Consultation"
                }
            },
            form: {
                title: "Get in Touch",
                name: "Full Name",
                email: "Email Address",
                company: "Company",
                industry: "Industry",
                industry_options: {
                    select: "Select Industry",
                    healthcare: "Healthcare",
                    banking: "Banking & Finance",
                    education: "Education",
                    retail: "Retail",
                    manufacturing: "Manufacturing",
                    other: "Other"
                },
                interest: "Area of Interest",
                interest_options: {
                    select: "Select Interest",
                    demo: "Schedule a Demo",
                    pricing: "Get Pricing Information",
                    consultation: "AI Consultation",
                    partnership: "Partnership Opportunities",
                    support: "Technical Support"
                },
                message: "Message",
                message_placeholder: "Tell us about your AI automation needs...",
                submit: "Send Message",
                success: "Thank you for your message! We'll get back to you within 24 hours."
            },
            info: {
                title: "Contact Information",
                email: "Email",
                phone: "Phone",
                phone_extension: "Ext: 392",
                phone_hours: "Mon-Fri 9AM-6PM EST",
                address: "Address",
                address_text: "200 Motor Parkway, Suite D 26\nHauppauge, NY 11788",
                response_time: "Response Time",
                response_time_text: "We typically respond within 24 hours during business days. For urgent matters, please call us directly.",
                social_media: "Social Media",
                social_twitter: "Follow us on Twitter:",
                social_linkedin: "Connect on LinkedIn:",
                social_instagram: "Follow on Instagram:"
            },
            demo: {
                title: "Schedule Your Personal Demo",
                description: "See Hi Emma in action with a personalized demonstration tailored to your industry and use case.",
                options: {
                    industry: {
                        title: "Industry-Specific Demo",
                        description: "See how Emma works specifically for your industry - Healthcare, Banking, Education, or Manufacturing."
                    },
                    quick: {
                        title: "Quick 15-Min Demo",
                        description: "Get a quick overview of Emma's capabilities and see how it can transform your operations."
                    },
                    technical: {
                        title: "Technical Deep Dive",
                        description: "Explore the technical aspects, integration options, and customization possibilities."
                    }
                },
                cta_button: "Get A Demo"
            },
            cta: {
                title: "Ready to Get Started?",
                description: "Choose the best way to begin your AI transformation journey with Hi Emma.",
                demo_button: "Get A Demo",
                resources_button: "Explore Resources"
            }
        },

        // Schedule Demo Page
        schedule_demo: {
            title: "Get a demo",
            description: "Thank you for taking the time to contact us. We look forward to connecting with you soon.",
            form: {
                name: "Name",
                work_email: "Work Email",
                work_email_hint: "Please double check spelling for accuracy.",
                phone_number: "Phone Number",
                search_country: "Search country...",
                submit: "Submit",
                submitting: "Submitting...",
                success: "Thank you for your demo request! We'll contact you within 24 hours to schedule your demo."
            },
            navigation: {
                home: "Home",
                contact: "Contact"
            },
            brand: {
                meet_emma: "Meet Emma",
                ai_assistant: "AI Assistant"
            }
        },

        // About Page
        about: {
            title: "About Emma",
            subtitle: "Revolutionizing operations through intelligent automation and cutting-edge AI technology",
            description: "Learn about our mission to revolutionize business operations through intelligent AI automation across Healthcare, Banking, Education, and beyond.",
            mission: {
                title: "Our Mission",
                description: "At Emma, we believe that artificial intelligence should be accessible, intelligent, and transformative. Our mission is to empower organizations across industries with AI solutions that not only automate processes but also learn, adapt, and evolve with your business needs.",
                second_paragraph: "We're building the future where AI agents work alongside human teams, enhancing productivity, reducing errors, and enabling organizations to focus on what matters most - innovation and growth."
            },
            what_we_do: {
                title: "What We Do",
                description: "Emma specializes in creating intelligent automation solutions that understand context, make decisions, and continuously improve. Our platform delivers:",
                card1: {
                    title: "Intelligent AI Agents",
                    description: "Autonomous AI agents that can understand natural language, process complex data, and make informed decisions in real-time."
                },
                card2: {
                    title: "Industry-Specific Solutions",
                    description: "Tailored AI implementations for Healthcare, Banking, and Education sectors with deep domain expertise."
                },
                card3: {
                    title: "Custom Development",
                    description: "Bespoke AI solutions designed specifically for your organization's unique requirements and workflows."
                },
                card4: {
                    title: "Continuous Learning",
                    description: "AI systems that learn from interactions and improve performance over time without manual intervention."
                },
                card5: {
                    title: "Seamless Integration",
                    description: "Easy integration with existing systems and workflows through our comprehensive API and SDK."
                },
                card6: {
                    title: "24/7 Support",
                    description: "Round-the-clock technical support and monitoring to ensure optimal performance and reliability."
                }
            },
            industries: {
                title: "Industries We Serve",
                description: "Emma's intelligent automation solutions are transforming operations across key industries:",
                healthcare: {
                    title: "Healthcare",
                    description: "Streamlining patient care, administrative tasks, and medical record management"
                },
                banking: {
                    title: "Banking & Finance",
                    description: "Automating compliance, risk assessment, and customer service operations"
                },
                education: {
                    title: "Education",
                    description: "Enhancing learning experiences and administrative efficiency"
                },
                other_industries: {
                    title: "Wait, What About My Industry?",
                    description: "Don't see your industry listed above? No worries! Emma is like that friend who's good at everything - whether you're in manufacturing, retail, real estate, logistics, or even space exploration (we're ready for the future! 🚀), Emma can adapt to your unique needs.",
                    tagline: "\"If it involves people, processes, or problems - Emma can probably help!\" - Our overly optimistic development team 😄",
                    cta: "Tell Us About Your Industry"
                }
            },
            technology: {
                title: "Our Technology",
                description: "Emma is built on cutting-edge technologies and best practices:",
                item1: {
                    title: "Advanced Machine Learning",
                    description: "State-of-the-art ML models for natural language processing, computer vision, and predictive analytics"
                },
                item2: {
                    title: "Cloud-Native Architecture",
                    description: "Scalable, secure, and reliable infrastructure built for enterprise requirements"
                },
                item3: {
                    title: "API-First Design",
                    description: "Comprehensive APIs and SDKs for seamless integration with existing systems"
                },
                item4: {
                    title: "Real-time Processing",
                    description: "Low-latency AI processing for time-sensitive applications"
                },
                item5: {
                    title: "Security & Compliance",
                    description: "Enterprise-grade security with SOC 2, HIPAA, and GDPR compliance"
                }
            },
            story: {
                title: "Our Story",
                description: "The story behind Emma and the passionate team building the future of AI",
                content: "Founded with a vision to democratize AI technology, Emma represents years of research, development, and real-world testing. Our journey began with a simple question: How can we make AI not just powerful, but truly helpful and accessible to everyone?",
                timeline1: {
                    title: "The Reality",
                    description: "What should have been a 30-minute clinic visit became a 4-hour ordeal, witnessing the chaos of manual scheduling and complex systems that frustrated patients."
                },
                timeline2: {
                    title: "The Game",
                    description: "A typical Saturday morning pickup game turned into a life-changing moment when our founder suffered a dislocated shoulder during a hard drive to the basket."
                },
                timeline3: {
                    title: "The Vision",
                    description: "A simple question emerged: \"What if there was a virtual assistant that could handle all this seamlessly?\" Not just for healthcare, but for every industry."
                },
                timeline4: {
                    title: "Emma is Born",
                    description: "From that single moment of inspiration, Emma was born—an AI assistant designed to bridge the gap between complex technology and everyday people."
                }
            },
            leadership_team: {
                title: "Meet the Leadership Team",
                description: "The visionaries leading Emma's mission to democratize AI",
                member1: {
                    name: "Jay Talluri",
                    role: "Founder & Chairman",
                    bio: "Accomplished entrepreneur who founded KodeFast in March 2021, demonstrating his commitment to innovative business solutions."
                },
                member2: {
                    name: "Radha Alla",
                    role: "Founder & CEO",
                    bio: "Founder and CEO of KodeFast, leveraging AI to revolutionize application development and empowering teams to build custom applications effortlessly."
                },
                member3: {
                    name: "Suman Tammareddy",
                    role: "Chief Operating Officer",
                    bio: "Chief Operating Officer at KodeFast, bringing extensive experience in managing technology-driven enterprises and holding directorial positions."
                },
                member4: {
                    name: "Prasad Bandaru",
                    role: "Head Of AI",
                    bio: "Director of Technology at KodeFast, overseeing technological advancements with a focus on leveraging AI-powered no-code tools."
                }
            },
            team: {
                title: "Team Behind Emma",
                description: "The dedicated professionals bringing Emma to life",
                member1: {
                    name: "Shree Talluri",
                    role: "Operations Manager",
                    bio: "Accomplished operations professional who leads a 20+ person team, developing policies, managing budgets, and identifying cross-selling opportunities."
                },
                member2: {
                    name: "Ravi Paleti",
                    role: "Head Of Sales",
                    bio: "Seasoned executive with 18+ years in tech and business leadership. Expert in strategy, innovation, product delivery, and cross-functional team leadership."
                },
                member3: {
                    name: "Shikha Bakshi",
                    role: "Head Of Marketing",
                    bio: "Client Success Manager at KodeFast with experience at Google Operations Center and Barclays. Skilled in client relations and account management."
                },
                member4: {
                    name: "Mohith",
                    role: "Automation Project Manager",
                    bio: "Technical manager specializing in optimizing the software development lifecycle by integrating robust automation with Agile project delivery."
                }
            },
            cta: {
                title: "Ready to Transform Your Organization?",
                description: "Let's discuss how Emma can revolutionize your operations with intelligent automation.",
                button: "Get Started Today"
            },
            vision: {
                title: "Our Vision",
                description: "A world where every organization has access to intelligent AI agents that understand, learn, and adapt to their unique needs and challenges."
            },
            values: {
                title: "Our Values",
                items: [
                    {
                        title: "Innovation",
                        description: "Pushing the boundaries of what's possible with AI technology"
                    },
                    {
                        title: "Reliability",
                        description: "Building robust, dependable solutions that organizations can trust"
                    },
                    {
                        title: "Accessibility",
                        description: "Making advanced AI technology accessible to everyone"
                    },
                    {
                        title: "Excellence",
                        description: "Delivering exceptional results and customer experiences"
                    }
                ]
            },
            stats: {
                title: "By the Numbers",
                items: [
                    {
                        number: "500+",
                        label: "Organizations Served"
                    },
                    {
                        number: "1M+",
                        label: "Conversations Processed"
                    },
                    {
                        number: "99.9%",
                        label: "Uptime Guarantee"
                    },
                    {
                        number: "24/7",
                        label: "Support Available"
                    }
                ]
            }
        },

        // Resources Page
        resources: {
            title: "Resources",
            subtitle: "Everything you need to succeed with Hi Emma",
            description: "Access our comprehensive library of resources, guides, and tools to maximize your success with Hi Emma's AI automation platform.",
            page_title: "Resources",
            page_subtitle: "Insights, Case Studies & Industry Best Practices",
            page_description: "Explore our comprehensive collection of resources to help you succeed",
            categories: {
                all: "All",
                blogs: "Blogs",
                case_studies: "Case Studies",
                use_cases: "Use Cases",
                documentation: "Documentation",
                guides: "Guides",
                whitepapers: "Whitepapers",
                webinars: "Webinars",
                tutorials: "Tutorials"
            },
            filters: {
                filter_by_type: "Filter by Type",
                filter_by_industry: "Filter by Industry",
                all_resources: "All Resources",
                all_industries: "All Industries",
                latest: "Latest",
                oldest: "Oldest",
                popular: "Most Popular",
                most_viewed: "Most Viewed",
                featured: "Featured",
                sort_by: "Sort by"
            },
            search: {
                placeholder: "Search resources...",
                button: "Search",
                searching: "Searching...",
                no_results: "No resources found",
                try_different: "Try adjusting your filters or search terms"
            },
            actions: {
                load_more: "Load More",
                loading: "Loading...",
                read_more: "Read More",
                view_details: "View Details",
                download: "Download",
                share: "Share"
            },
            card: {
                by: "By",
                published_on: "Published on",
                min_read: "min read",
                views: "views",
                view: "view",
                read_time: "Read Time",
                author: "Author",
                date: "Date",
                tags: "Tags",
                industry: "Industry"
            },
            empty_state: {
                title: "No Resources Found",
                description: "We couldn't find any resources matching your criteria.",
                suggestion: "Try adjusting your filters or search terms to find what you're looking for.",
                clear_filters: "Clear Filters",
                browse_all: "Browse All Resources"
            },
            loading_state: {
                loading: "Loading resources...",
                please_wait: "Please wait while we fetch the latest content"
            },
            stats: {
                total: "Total Resources",
                blogs: "Blogs",
                case_studies: "Case Studies",
                use_cases: "Use Cases"
            }
        }
    },
    
    ar: {
        // Navigation
        nav: {
            home: "الرئيسية",
            about: "من نحن",
            pricing: "الأسعار",
            resources: "الموارد",
            schedule_demo: "حجز عرض توضيحي",
            contact: "اتصل بنا",
            book_demo: "احجز عرضاً توضيحياً"
        },
        
        // Logo/Brand
        brand: {
            name: "مرحباً إيما",
            tagline: "مساعد الذكاء الاصطناعي",
            ai_assistant: "مساعد الذكاء الاصطناعي"
        },
        
        // Hero Section
        hero: {
            title: "تعرف على إيما",
            subtitle: "مساعدك الذكي للذكاء الاصطناعي",
            description: "حوّل عملك بالذكاء الاصطناعي الذي يفهم ويتعلم ويتكيف. من الرعاية الصحية والبنوك والتعليم - إيما تحقق النتائج في القطاعات الرئيسية.",
            cta_primary: "تحدث معها الآن",
            cta_secondary: "اعرف المزيد",
            trusted_by: "موثوق من قادة الصناعة",
            see_how: "شاهد كيف تحول إيما العمليات عبر القطاعات",
            conversation: {
                user1: "مرحباً إيما!",
                emma1: "مرحباً! كيف يمكنني مساعدتك اليوم؟",
                user2: "أحتاج مساعدة",
                emma2: "أنا هنا لمساعدتك! ماذا تحتاج؟"
            }
        },
        
        // Workflow Section
        workflow: {
            analyze: "تحليل",
            learn: "تعلم",
            adapt: "تكيف",
            deliver: "تسليم"
        },
        
        // Use Cases Section
        use_cases: {
            healthcare: {
                title: "الرعاية الصحية",
                description: "أتمتة مكالمات المرضى والحجوزات والتذكيرات مع دعم صوتي على مدار الساعة.",
                stats: {
                    efficiency: "60% كفاءة",
                    compliance: "متوافق مع HIPAA"
                }
            },
            recruitment: {
                title: "التوظيف",
                description: "فحص ذكي للمرشحين ومقابلات آلية ومطابقة المواهب",
                stats: {
                    time_saved: "70% توفير في الوقت",
                    quality: "جودة أفضل للمرشحين"
                }
            },
            retail: {
                title: "التجارة",
                description: "تسوق شخصي ومساعدين افتراضيين وتنبؤ بالطلب",
                stats: {
                    conversion: "70% تحويل",
                    inventory: "مخزون ذكي"
                }
            },
            banking: {
                title: "البنوك",
                description: "أتمتة خدمة العملاء وكشف الاحتيال والاستشارات المالية",
                stats: {
                    faster: "40% أسرع",
                    accurate: "99.9% دقة"
                }
            },
            education: {
                title: "التعليم",
                description: "دعم الطلاب وإدارة الدورات والتعلم الشخصي",
                stats: {
                    engagement: "85% مشاركة",
                    support: "دعم على مدار الساعة"
                }
            },
            customer_service: {
                title: "خدمة العملاء",
                description: "دعم على مدار الساعة وإدارة التذاكر ورضا العملاء",
                stats: {
                    satisfaction: "95% رضا",
                    response: "استجابة فورية"
                }
            }
        },

        // Home Page Specific
        home: {
            hero_title: "تعرف على إيما\nمساعدك الذكي للذكاء الاصطناعي",
            trusted_by: "موثوق من قادة الصناعة",
            capabilities_title: "قدرات إيما الأساسية",
            capabilities_subtitle: "أتمتة ذكية تتكيف وتتعلم وتتخذ المبادرة",
            industries_title: "حلول الصناعة",
            industries_subtitle: "حلول ذكاء اصطناعي مصممة لكل قطاع",
            use_cases_title: "حالات الاستخدام",
            use_cases_subtitle: "تطبيقات حقيقية عبر الصناعات",
            ready_title: "هل أنت مستعد لتحويل عملياتك؟",
            ready_subtitle: "كن من أوائل من يجرب مستقبل أتمتة الذكاء الاصطناعي",
            trusted_title: "موثوق ومعتمد",
            footer_title: "إيما للذكاء الاصطناعي",
            product: "المنتج",
            company: "الشركة",
            support: "الدعم",
            legal: "قانوني",
            stay_updated: "ابق محدثاً"
        },
        
        // Features Section
        features: {
            title: "ميزات إيما",
            subtitle: "قدرات قوية تجعل إيما مساعد الذكاء الاصطناعي المثالي لأعمالك",
            multilingual: {
                title: "دعم متعدد اللغات واللهجات.",
                subtitle: "تواصل بشكل طبيعي بأكثر من 50 لغة.",
                description: "التعرف المثالي على اللهجات وفهم السياق الثقافي عبر جميع اللغات واللهجات الرئيسية في جميع أنحاء العالم."
            },
            conversations: {
                title: "محادثات بشرية.",
                subtitle: "جاهزة للاستخدام، حوار طبيعي.",
                description: "مدربة مسبقاً لفهم السياق والعاطفة، جاهزة للتفاعل بشكل طبيعي من اليوم الأول."
            },
            customizable: {
                title: "اسم وصورة رمزية قابلة للتخصيص.",
                subtitle: "خصص مظهر وهوية إيما.",
                description: "طابق هوية علامتك التجارية مع صور رمزية وأسماء وسمات شخصية قابلة للتخصيص تعكس ثقافة شركتك."
            },
            security: {
                title: "أمان على مستوى المؤسسات.",
                subtitle: "تشفير والامتثال على مستوى البنوك.",
                description: "معتمد من SOC 2 و HIPAA و GDPR مع تشفير من الدرجة العسكرية يضمن حماية بياناتك والامتثال دائماً."
            },
            industry: {
                title: "مستقل عن الصناعة والمجال.",
                subtitle: "جاهز للاستخدام، جاهز لأي قطاع.",
                description: "مُهيأ مسبقاً للرعاية الصحية والمالية والتعليم والمزيد. انشر على الفور دون تدريب مخصص."
            },
            availability: {
                title: "متاح على مدار الساعة طوال أيام الأسبوع.",
                subtitle: "لا تنام أبداً، لا تأخذ فترات راحة أبداً.",
                description: "إيما جاهزة دائماً لمساعدة عملائك على مدار الساعة مع ضمان وقت تشغيل بنسبة 99.9٪ وأوقات استجابة فورية."
            },
            integrations: {
                title: "تكاملات سلسة.",
                subtitle: "يتصل بسهولة بأدواتك الحالية.",
                description: "التكامل مع أكثر من 50 منصة بما في ذلك أنظمة إدارة علاقات العملاء ومنصات المراسلة وواجهات برمجة التطبيقات المخصصة لتجربة سير عمل موحدة."
            },
            analytics: {
                title: "تحليلات ما بعد المكالمة",
                subtitle: "رؤى شاملة لتحسين الأداء.",
                description: "تقارير في الوقت الفعلي مع أكثر من 50 مقياساً رئيسياً لتتبع الأداء واتخاذ قرارات مستندة إلى البيانات."
            }
        },
        
        // Architecture Section
        architecture: {
            title: "معمارية إيما",
            subtitle: "شاهد كيف تحول إيما طلبك إلى عمل ذكي",
            step1: {
                title: "كل شيء يبدأ بسؤال.",
                description: "تتلقى إيما طلبك من خلال الصوت أو النص أو الإدخال متعدد الوسائط بأي لغة",
                tag1: "الصوت",
                tag2: "النص",
                tag3: "متعدد الوسائط"
            },
            step2: {
                title: "إيما تستمع وتفهم وتفكر.",
                description: "تحدد معالجة اللغة الطبيعية المتقدمة الكيانات والنية والسياق من طلبك",
                tag1: "معالجة اللغة الطبيعية",
                tag2: "السياق",
                tag3: "النية"
            },
            step3: {
                title: "ربط النقاط والتعلم.",
                description: "تطبق إيما التفكير والذاكرة والتعلم لاتخاذ قرارات ذكية",
                tag1: "التفكير",
                tag2: "الذاكرة",
                tag3: "التعلم"
            },
            step4: {
                title: "صياغة الرد المثالي.",
                description: "تولد إيما ردوداً شخصية وسياقية تبدو بشرية حقاً",
                tag1: "شخصي",
                tag2: "سياقي",
                tag3: "طبيعي"
            },
            step5: {
                title: "وضع الإجابة موضع التنفيذ.",
                description: "تتكامل إيما بسلاسة مع أدواتك لتنفيذ الإجراء المطلوب",
                tag1: "واجهات برمجة التطبيقات",
                tag2: "خطافات الويب",
                tag3: "الوقت الفعلي"
            }
        },
        
        // Enterprises Section
        enterprises: {
            title: "مبني لأكبر المؤسسات في العالم.",
            heading: "خلق قيمة في أسابيع، وليس أشهر.",
            description: "لا تضيع شهوراً في تطبيقات الذكاء الاصطناعي المعقدة التي لا تقدم نتائج. اعمل مع أتمتة إيما الذكية التي تفهم عملك وتتعلم من بياناتك وتتكيف مع احتياجاتك الفريدة."
        },
        
        // Capabilities Section
        capabilities: {
            title: "قدرات إيما الأساسية",
            subtitle: "أتمتة ذكية تتكيف وتتعلم وتتخذ المبادرة",
            scheduling: {
                title: "جدولة المحادثات",
                description: "تدير الحجوزات وإعادة الجدولة وترسل التذكيرات عبر واتساب والرسائل النصية والبريد الإلكتروني والصوت",
                demo_user: "جدولة اجتماع غداً في الساعة 2 مساءً",
                demo_emma: "لقد قمت بجدولة اجتماعك وأرسلت التأكيدات!"
            },
            intelligence: {
                title: "التأهيل المسبق الذكي",
                description: "يجمع المدخلات ويحدد الأولويات للاحتياجات العاجلة ويوجه الطلبات إلى المكان المناسب تلقائياً",
                demo_user: "أحتاج مساعدة في حسابي",
                demo_emma: "سأجمع بعض التفاصيل وأوصلتك بالمختص المناسب"
            },
            personalization: {
                title: "التفاعل الشخصي المتقدم",
                description: "يوفر التنبيهات والمتابعات ذات الصلة بعدة لغات ونبرات",
                demo_user: "تابع مع عملائنا المميزين",
                demo_emma: "تم إرسال الرسائل الشخصية باللغة المفضلة لديهم!"
            }
        },
        
        // Industries Section
        industries: {
            title: "حلول الصناعة",
            subtitle: "وكلاء ذكاء اصطناعي مخصصون لاحتياجات صناعتك المحددة",
            healthcare: {
                title: "الرعاية الصحية",
                features: {
                    virtual_assistant: {
                        title: "مساعد الصحة الافتراضي",
                        description: "دعم المرضى على مدار الساعة وتقييم الأعراض"
                    },
                    patient_management: {
                        title: "إدارة المرضى",
                        description: "تنسيق الرعاية الذكي والمراقبة"
                    },
                    symptom_checker: {
                        title: "فحص الأعراض",
                        description: "مساعدة تشخيصية مدعومة بالذكاء الاصطناعي"
                    }
                }
            },
            banking: {
                title: "البنوك",
                features: {
                    fraud_detection: {
                        title: "كشف الاحتيال",
                        description: "مراقبة المعاملات في الوقت الفعلي والحماية"
                    },
                    personal_finance: {
                        title: "وكيل المالية الشخصية",
                        description: "نصائح ذكية للميزانية والاستثمار"
                    },
                    chatbot_banker: {
                        title: "روبوت البنك",
                        description: "خدمة العملاء وإدارة الحسابات على مدار الساعة"
                    }
                }
            },
            education: {
                title: "التعليم",
                features: {
                    ai_tutor: {
                        title: "معلم الذكاء الاصطناعي",
                        description: "تجارب تعلم شخصية وإرشاد"
                    },
                    adaptive_testing: {
                        title: "اختبارات تكيفية",
                        description: "تقييم ديناميكي بناءً على أداء الطالب"
                    },
                    curriculum_design: {
                        title: "تصميم المناهج",
                        description: "إنشاء محتوى تعليمي مدعوم بالذكاء الاصطناعي"
                    }
                }
            },
            recruitment: {
                title: "التوظيف",
                features: {
                    candidate_screening: {
                        title: "الفحص الذكي",
                        description: "تقييم وفلترة المرشحين مدعوم بالذكاء الاصطناعي"
                    },
                    automated_interviews: {
                        title: "المقابلات الآلية",
                        description: "إجراء المقابلات الأولية وجمع الرؤى"
                    },
                    talent_matching: {
                        title: "مطابقة المواهب",
                        description: "خوارزميات مطابقة الوظائف والمرشحين الذكية"
                    }
                }
            },
            retail: {
                title: "التجارة",
                features: {
                    personalized_shopping: {
                        title: "التسوق الشخصي",
                        description: "توصيات المنتجات مدعومة بالذكاء الاصطناعي"
                    },
                    virtual_assistant: {
                        title: "المساعد الافتراضي",
                        description: "دعم العملاء والإرشاد على مدار الساعة"
                    },
                    demand_forecasting: {
                        title: "التنبؤ بالطلب",
                        description: "تحسين المخزون والأسعار الذكي"
                    }
                }
            },
            finance: {
                title: "المالية",
                features: {
                    risk_assessment: {
                        title: "تقييم المخاطر",
                        description: "كشف الاحتيال المتقدم والامتثال"
                    },
                    algorithmic_trading: {
                        title: "التداول الخوارزمي",
                        description: "استراتيجيات الاستثمار مدعومة بالذكاء الاصطناعي"
                    },
                    financial_advisor: {
                        title: "المستشار المالي",
                        description: "إدارة الثروة الشخصية"
                    }
                }
            },
            cta: {
                title: "هل أنت مستعد لتحويل صناعتك؟",
                description: "انضم إلى آلاف المنظمات التي تستخدم بالفعل وكلاء إيما للذكاء الاصطناعي لثورة عملياتها وتحقيق نتائج استثنائية.",
                stats: {
                    companies: "شركة",
                    industries: "صناعة",
                    uptime: "وقت التشغيل"
                },
                buttons: {
                    start_trial: "ابدأ التجربة المجانية",
                    schedule_demo: "جدولة عرض توضيحي"
                }
            }
        },
        
        // Use Cases
        use_cases: {
            healthcare: {
                title: "الرعاية الصحية",
                description: "جدولة المرضى والسجلات الطبية والمساعدة التشخيصية",
                stats: {
                    efficiency: "60% كفاءة",
                    compliance: "متوافق مع HIPAA"
                }
            },
            recruitment: {
                title: "التوظيف",
                description: "الفحص الذكي للمرشحين والمقابلات الآلية ومطابقة المواهب",
                stats: {
                    time_saved: "70% توفير الوقت",
                    quality: "جودة مرشحين أفضل"
                }
            },
            retail: {
                title: "التجارة",
                description: "التسوق الشخصي والمساعدين الافتراضيين والتنبؤ بالطلب",
                stats: {
                    conversion: "70% تحويل",
                    inventory: "مخزون ذكي"
                }
            },
            banking: {
                title: "البنوك",
                description: "أتمتة خدمة العملاء وكشف الاحتيال والاستشارة المالية",
                stats: {
                    faster: "40% أسرع",
                    accurate: "99.9% دقة"
                }
            },
            education: {
                title: "التعليم",
                description: "دعم الطلاب وإدارة الدورات والتعلم الشخصي",
                stats: {
                    engagement: "85% مشاركة",
                    support: "دعم على مدار الساعة"
                }
            },
            customer_service: {
                title: "خدمة العملاء",
                description: "دعم على مدار الساعة وإدارة التذاكر ورضا العملاء",
                stats: {
                    satisfaction: "95% رضا",
                    response: "استجابة فورية"
                }
            }
        },
        
        // Security & Compliance
        security: {
            title: "موثوق ومعتمد",
            description: "منصتنا تلبي أعلى معايير الأمان والامتثال لحماية بياناتك وضمان الامتثال التنظيمي."
        },
        
        // CTA Section
        cta: {
            title: "هل أنت مستعد لتحويل عملياتك؟",
            description: "دعنا نعمل معاً لإنشاء الحل المثالي للذكاء الاصطناعي لمنظمتك.",
            button: "ابدأ اليوم"
        },
        
        // Footer
        footer: {
            brand: {
                name: "مرحباً إيما",
                tagline: "منصة المساعد الذكي للذكاء الاصطناعي",
                description: "بناء مستقبل وكلاء الذكاء الاصطناعي المستقلين. حوّل عملياتك بالأتمتة الذكية عبر الرعاية الصحية والبنوك والتعليم والمزيد."
            },
            columns: {
                product: {
                    title: "المنتج",
                    features: "الميزات",
                    pricing: "الأسعار",
                    integrations: "التكامل",
                    api: "واجهة برمجة التطبيقات",
                    security: "الأمان"
                },
                industries: {
                    title: "الصناعات",
                    healthcare: "الرعاية الصحية",
                    banking: "البنوك والمالية",
                    education: "التعليم",
                    manufacturing: "التصنيع",
                    retail: "التجارة"
                },
                company: {
                    title: "الشركة",
                    about_kodefast: "حول كودفاست",
                    about: "من نحن",
                    careers: "الوظائف",
                    blog: "المدونة",
                    press: "الصحافة",
                    partners: "الشركاء"
                },
                support: {
                    title: "الدعم",
                    help: "مركز المساعدة",
                    contact: "اتصل بنا",
                    status: "حالة النظام",
                    documentation: "الوثائق",
                    community: "المجتمع"
                }
            },
            newsletter: {
                title: "ابق محدثاً",
                description: "احصل على أحدث رؤى الذكاء الاصطناعي وتحديثات المنتج في صندوق الوارد الخاص بك.",
                placeholder: "أدخل بريدك الإلكتروني",
                button: "اشترك",
                disclaimer: "نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت."
            },
            copyright: "© 2025 كودفاست. جميع الحقوق محفوظة. بناء مستقبل وكلاء الذكاء الاصطناعي المستقلين.",
            legal: {
                privacy: "سياسة الخصوصية",
                terms: "شروط الخدمة",
                cookies: "سياسة ملفات تعريف الارتباط",
                accessibility: "إمكانية الوصول"
            }
        },
        
        // Common
        common: {
            learn_more: "اعرف المزيد",
            get_started: "ابدأ الآن",
            contact_us: "اتصل بنا",
            read_more: "اقرأ المزيد",
            view_all: "عرض الكل",
            submit: "إرسال",
            send: "إرسال",
            cancel: "إلغاء",
            close: "إغلاق",
            next: "التالي",
            previous: "السابق",
            back: "رجوع",
            continue: "متابعة",
            save: "حفظ",
            edit: "تعديل",
            delete: "حذف",
            view: "عرض",
            download: "تحميل",
            upload: "رفع",
            search: "بحث",
            filter: "تصفية",
            sort: "ترتيب",
            refresh: "تحديث",
            loading: "جاري التحميل...",
            error: "خطأ",
            success: "نجح",
            warning: "تحذير",
            info: "معلومات"
        },

        // 404 Page
        error404: {
            title: "404 - الصفحة غير موجودة",
            subtitle: "الصفحة غير موجودة",
            description: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لا تقلق، وكلاء الذكاء الاصطناعي لدينا هنا لمساعدتك في العثور على ما تحتاجه.",
            go_home: "العودة للرئيسية",
            contact_support: "اتصل بالدعم",
            popular_pages: "الصفحات الشائعة",
            home_title: "الرئيسية - منصة إيما للذكاء الاصطناعي",
            home_desc: "اكتشف حلول أتمتة الذكاء الاصطناعي",
            about_title: "حول - تعرف على مهمتنا",
            about_desc: "ثورة في العمليات من خلال الذكاء الاصطناعي",
            pricing_title: "الأسعار - حلول ذكاء اصطناعي مخصصة",
            pricing_desc: "حلول مصممة لكل منظمة",
            resources_title: "الموارد - المدونة ودراسات الحالة",
            resources_desc: "استكشف الرؤى وأفضل الممارسات",
            contact_title: "اتصل - تواصل معنا",
            contact_desc: "مستعد لتحويل عملياتك؟"
        },

        // Footer
        footer: {
            brand: {
                name: "مرحباً إيما",
                tagline: "منصة مساعد الذكاء الاصطناعي الذكي",
                description: "بناء مستقبل وكلاء الذكاء الاصطناعي المستقلين. حول عملياتك بأتمتة ذكية عبر الرعاية الصحية والبنوك والتعليم والمزيد."
            },
            product: {
                title: "المنتج",
                features: "الميزات",
                pricing: "الأسعار",
                integrations: "التكاملات",
                api: "واجهة برمجة التطبيقات",
                security: "الأمان"
            },
            company: {
                title: "الشركة",
                about_kodefast: "حول KodeFast",
                about_us: "من نحن",
                careers: "الوظائف",
                blog: "المدونة",
                press: "الصحافة",
                partners: "الشركاء"
            },
            support: {
                title: "الدعم",
                help_center: "مركز المساعدة",
                contact_us: "اتصل بنا",
                system_status: "حالة النظام",
                documentation: "الوثائق",
                community: "المجتمع"
            },
            legal: {
                title: "قانوني",
                privacy_policy: "سياسة الخصوصية",
                terms_of_service: "شروط الخدمة",
                cookie_policy: "سياسة ملفات تعريف الارتباط",
                accessibility: "إمكانية الوصول"
            },
            social: {
                join_conversation: "انضم إلى المحادثة"
            },
            newsletter: {
                get_ahead: "تقدم",
                with_ai_insights: "برؤى الذكاء الاصطناعي",
                description: "أطلق العنان للذكاء المستقل. كن أول من يتلقى استراتيجيات الذكاء الاصطناعي المتطورة وتحديثات المنتج الحصرية ورؤى الصناعة التي تمنحك الميزة التنافسية.",
                email_placeholder: "أدخل بريدك الإلكتروني",
                subscribe: "اشتراك",
                privacy_notice: "نحترم خصوصيتك. إلغاء الاشتراك في أي وقت."
            },
            bottom: {
                privacy: "الخصوصية",
                terms: "الشروط",
                cookies: "ملفات تعريف الارتباط",
                accessibility: "إمكانية الوصول"
            }
        },

        // Pricing Page
        pricing: {
            title: "خطط الأسعار المخصصة",
            subtitle: "حلول مصممة خصيصاً لاحتياجات كل منظمة فريدة",
            description: "اكتشف خطط الأسعار المخصصة لإيما المصممة خصيصاً لكل منظمة. احصل على أسعار شفافة لحلول أتمتة الذكاء الاصطناعي في الرعاية الصحية والبنوك والتعليم.",
            plans: {
                starter: {
                    name: "البداية",
                    price: "مخصص",
                    period: "اتصل بالمبيعات",
                    description: "مثالي للفرق الصغيرة التي تبدأ مع أتمتة الذكاء الاصطناعي",
                    features: [
                        "حتى 1,000 محادثة/شهر",
                        "قدرات الذكاء الاصطناعي الأساسية",
                        "تكامل البريد الإلكتروني والرسائل النصية",
                        "دعم قياسي",
                        "تحليلات أساسية",
                        "وصول API"
                    ],
                    button: "اتصل بالمبيعات"
                },
                professional: {
                    name: "المهني",
                    price: "مخصص",
                    period: "اتصل بالمبيعات",
                    description: "ميزات متقدمة للمنظمات النامية",
                    features: [
                        "حتى 10,000 محادثة/شهر",
                        "قدرات الذكاء الاصطناعي المتقدمة",
                        "تكامل متعدد القنوات",
                        "سير عمل مخصص",
                        "دعم أولوية",
                        "تحليلات متقدمة",
                        "وصول API كامل",
                        "تكاملات مخصصة"
                    ],
                    button: "اتصل بالمبيعات"
                },
                enterprise: {
                    name: "المؤسسة",
                    price: "مخصص",
                    period: "اتصل بالمبيعات",
                    description: "حل كامل للمنظمات الكبيرة",
                    features: [
                        "محادثات غير محدودة",
                        "تخصيص الذكاء الاصطناعي الكامل",
                        "جميع التكاملات مشمولة",
                        "مدير حساب مخصص",
                        "دعم متميز على مدار الساعة",
                        "تحليلات المؤسسة",
                        "خيارات العلامة البيضاء",
                        "نشر محلي",
                        "ضمانات SLA"
                    ],
                    button: "اتصل بالمبيعات"
                }
            },
            custom_solutions: {
                title: "تحتاج حل مخصص؟",
                description: "كل منظمة فريدة. دعنا نعمل معاً لإنشاء حل الذكاء الاصطناعي المثالي لاحتياجاتك المحددة ومتطلبات الصناعة وحجمها.",
                features: [
                    {
                        title: "قدرات الذكاء الاصطناعي المخصصة",
                        description: "نماذج الذكاء الاصطناعي المخصصة المدربة خصيصاً لصناعتك وحالات الاستخدام"
                    },
                    {
                        title: "التخصيص الخاص بالصناعة",
                        description: "الخبرة العميقة في المجال المطبقة على متطلبات صناعتك المحددة"
                    },
                    {
                        title: "هندسة معمارية قابلة للتوسع",
                        description: "بنية تحتية مصممة لتنمو مع احتياجات منظمتك"
                    },
                    {
                        title: "فريق دعم مخصص",
                        description: "فريق دعم خبير مخصص لنجاحك وتنفيذك"
                    }
                ],
                button: "احصل على عرض أسعار مخصص"
            }
        },

        // Contact Page
        contact: {
            title: "اتصل بنا",
            subtitle: "مستعد لتحويل عملياتك بالذكاء الاصطناعي؟ دعنا نناقش احتياجاتك ونجد الحل المثالي.",
            hero: {
                title: "اتصل بنا",
                subtitle: "مستعد لتحويل عملياتك بالذكاء الاصطناعي؟ دعنا نناقش احتياجاتك ونجد الحل المثالي.",
                stats: {
                    response_time: "وقت الاستجابة",
                    satisfaction: "الرضا",
                    consultation: "الاستشارة"
                }
            },
            form: {
                title: "تواصل معنا",
                name: "الاسم الكامل",
                email: "عنوان البريد الإلكتروني",
                company: "الشركة",
                industry: "القطاع",
                industry_options: {
                    select: "اختر القطاع",
                    healthcare: "الرعاية الصحية",
                    banking: "البنوك والمالية",
                    education: "التعليم",
                    retail: "التجزئة",
                    manufacturing: "التصنيع",
                    other: "أخرى"
                },
                interest: "مجال الاهتمام",
                interest_options: {
                    select: "اختر الاهتمام",
                    demo: "حجز عرض توضيحي",
                    pricing: "الحصول على معلومات الأسعار",
                    consultation: "استشارة الذكاء الاصطناعي",
                    partnership: "فرص الشراكة",
                    support: "الدعم التقني"
                },
                message: "الرسالة",
                message_placeholder: "أخبرنا عن احتياجاتك في أتمتة الذكاء الاصطناعي...",
                submit: "إرسال الرسالة",
                success: "شكراً لرسالتك! سنعود إليك خلال 24 ساعة."
            },
            info: {
                title: "معلومات الاتصال",
                email: "البريد الإلكتروني",
                phone: "الهاتف",
                phone_extension: "الفرعي: 392",
                phone_hours: "الاثنين-الجمعة 9 صباحاً-6 مساءً بتوقيت شرق أمريكا",
                address: "العنوان",
                address_text: "200 Motor Parkway, Suite D 26\nHauppauge, NY 11788",
                response_time: "وقت الاستجابة",
                response_time_text: "نرد عادة خلال 24 ساعة في أيام العمل. للأمور العاجلة، يرجى الاتصال بنا مباشرة.",
                social_media: "وسائل التواصل الاجتماعي",
                social_twitter: "تابعنا على تويتر:",
                social_linkedin: "تواصل معنا على لينكد إن:",
                social_instagram: "تابعنا على إنستغرام:"
            },
            demo: {
                title: "احجز عرضك التوضيحي الشخصي",
                description: "شاهد إيما في العمل مع عرض توضيحي شخصي مصمم لقطاعك وحالة الاستخدام.",
                options: {
                    industry: {
                        title: "عرض توضيحي خاص بالقطاع",
                        description: "شاهد كيف تعمل إيما خصيصاً لقطاعك - الرعاية الصحية، البنوك، التعليم، أو التصنيع."
                    },
                    quick: {
                        title: "عرض توضيحي سريع 15 دقيقة",
                        description: "احصل على نظرة عامة سريعة على قدرات إيما وشاهد كيف يمكنها تحويل عملياتك."
                    },
                    technical: {
                        title: "غوص تقني عميق",
                        description: "استكشف الجوانب التقنية وخيارات التكامل وإمكانيات التخصيص."
                    }
                },
                cta_button: "احصل على عرض توضيحي"
            },
            cta: {
                title: "مستعد للبدء؟",
                description: "اختر أفضل طريقة لبدء رحلة تحويل الذكاء الاصطناعي مع إيما.",
                demo_button: "احصل على عرض توضيحي",
                resources_button: "استكشف الموارد"
            }
        },

        // Schedule Demo Page
        schedule_demo: {
            title: "احصل على عرض توضيحي",
            description: "شكراً لك على الوقت الذي قضيته للتواصل معنا. نتطلع للتواصل معك قريباً.",
            form: {
                name: "الاسم",
                work_email: "البريد الإلكتروني للعمل",
                work_email_hint: "يرجى التحقق من الإملاء للتأكد من الدقة.",
                phone_number: "رقم الهاتف",
                search_country: "البحث عن بلد...",
                submit: "إرسال",
                submitting: "جاري الإرسال...",
                success: "شكراً لك على طلب العرض التوضيحي! سنتواصل معك خلال 24 ساعة لجدولة عرضك التوضيحي."
            },
            navigation: {
                home: "الرئيسية",
                contact: "اتصل بنا"
            },
            brand: {
                meet_emma: "تعرف على إيما",
                ai_assistant: "مساعد الذكاء الاصطناعي"
            }
        },

        // About Page
        about: {
            title: "حول إيما",
            subtitle: "بناء مستقبل وكلاء الذكاء الاصطناعي المستقلين",
            description: "تعرف على مهمتنا لإحداث ثورة في العمليات التجارية من خلال أتمتة الذكاء الاصطناعي الذكية عبر الرعاية الصحية والبنوك والتعليم وأكثر من ذلك.",
            mission: {
                title: "مهمتنا",
                description: "في إيما، نؤمن بأن الذكاء الاصطناعي يجب أن يكون متاحاً وذكياً ومحولاً. مهمتنا هي تمكين المنظمات عبر الصناعات بحلول الذكاء الاصطناعي التي لا تؤتمت العمليات فحسب، بل تتعلم وتتكيف وتتطور مع احتياجات عملك.",
                second_paragraph: "نحن نبني المستقبل حيث يعمل وكلاء الذكاء الاصطناعي جنباً إلى جنب مع الفرق البشرية، مما يعزز الإنتاجية ويقلل الأخطاء ويمكن المنظمات من التركيز على ما يهم أكثر - الابتكار والنمو."
            },
            what_we_do: {
                title: "ما نفعله",
                description: "تتخصص إيما في إنشاء حلول الأتمتة الذكية التي تفهم السياق وتتخذ القرارات وتتحسن باستمرار. تقدم منصتنا:",
                card1: {
                    title: "وكلاء الذكاء الاصطناعي الأذكياء",
                    description: "وكلاء ذكاء اصطناعي مستقلون يمكنهم فهم اللغة الطبيعية ومعالجة البيانات المعقدة واتخاذ قرارات مدروسة في الوقت الفعلي."
                },
                card2: {
                    title: "حلول مخصصة للصناعة",
                    description: "تطبيقات ذكاء اصطناعي مصممة خصيصاً لقطاعات الرعاية الصحية والبنوك والتعليم مع خبرة عميقة في المجال."
                },
                card3: {
                    title: "التطوير المخصص",
                    description: "حلول ذكاء اصطناعي مصممة خصيصاً لمتطلبات وسير عمل منظمتك الفريدة."
                },
                card4: {
                    title: "التعلم المستمر",
                    description: "أنظمة ذكاء اصطناعي تتعلم من التفاعلات وتحسن الأداء مع مرور الوقت دون تدخل يدوي."
                },
                card5: {
                    title: "التكامل السلس",
                    description: "تكامل سهل مع الأنظمة وسير العمل الحالية من خلال واجهة برمجة التطبيقات وSDK الشاملة."
                },
                card6: {
                    title: "الدعم على مدار الساعة",
                    description: "دعم فني ومراقبة على مدار الساعة لضمان الأداء الأمثل والموثوقية."
                }
            },
            industries: {
                title: "الصناعات التي نخدمها",
                description: "حلول الأتمتة الذكية من إيما تحول العمليات عبر الصناعات الرئيسية:",
                healthcare: {
                    title: "الرعاية الصحية",
                    description: "تبسيط رعاية المرضى والمهام الإدارية وإدارة السجلات الطبية"
                },
                banking: {
                    title: "البنوك والتمويل",
                    description: "أتمتة الامتثال وتقييم المخاطر وعمليات خدمة العملاء"
                },
                education: {
                    title: "التعليم",
                    description: "تحسين تجارب التعلم والكفاءة الإدارية"
                },
                other_industries: {
                    title: "انتظر، ماذا عن صناعتي؟",
                    description: "لا ترى صناعتك مدرجة أعلاه؟ لا تقلق! إيما مثل ذلك الصديق الذي يجيد كل شيء - سواء كنت في التصنيع أو البيع بالتجزئة أو العقارات أو الخدمات اللوجستية أو حتى استكشاف الفضاء (نحن مستعدون للمستقبل! 🚀)، يمكن لإيما التكيف مع احتياجاتك الفريدة.",
                    tagline: "\"إذا كان يتضمن أشخاصاً أو عمليات أو مشاكل - فربما يمكن لإيما المساعدة!\" - فريق التطوير المتفائل لدينا 😄",
                    cta: "أخبرنا عن صناعتك"
                }
            },
            technology: {
                title: "تقنيتنا",
                description: "إيما مبنية على التقنيات المتطورة وأفضل الممارسات:",
                item1: {
                    title: "التعلم الآلي المتقدم",
                    description: "نماذج تعلم آلي حديثة لمعالجة اللغة الطبيعية ورؤية الكمبيوتر والتحليلات التنبؤية"
                },
                item2: {
                    title: "الهندسة المعمارية السحابية الأصلية",
                    description: "بنية تحتية قابلة للتوسع وآمنة وموثوقة مصممة لمتطلبات المؤسسات"
                },
                item3: {
                    title: "التصميم المبدئي لواجهة برمجة التطبيقات",
                    description: "واجهات برمجة تطبيقات وSDK شاملة للتكامل السلس مع الأنظمة الموجودة"
                },
                item4: {
                    title: "المعالجة في الوقت الفعلي",
                    description: "معالجة ذكاء اصطناعي منخفضة الكمون للتطبيقات الحساسة للوقت"
                },
                item5: {
                    title: "الأمان والامتثال",
                    description: "أمان على مستوى المؤسسة مع امتثال SOC 2 وHIPAA وGDPR"
                }
            },
            story: {
                title: "قصتنا",
                description: "القصة وراء إيما والفريق المتحمس الذي يبني مستقبل الذكاء الاصطناعي",
                content: "تأسست برؤية لدمقرطة تقنية الذكاء الاصطناعي، تمثل إيما سنوات من البحث والتطوير والاختبار في العالم الحقيقي. بدأت رحلتنا بسؤال بسيط: كيف يمكننا جعل الذكاء الاصطناعي ليس قوياً فحسب، بل مفيداً ومتاحاً حقاً للجميع؟",
                timeline1: {
                    title: "الواقع",
                    description: "ما كان يجب أن يكون زيارة عيادة لمدة 30 دقيقة أصبح محنة لمدة 4 ساعات، حيث شاهدنا فوضى الجدولة اليدوية والأنظمة المعقدة التي أزعجت المرضى."
                },
                timeline2: {
                    title: "اللعبة",
                    description: "لعبة صباحية عادية يوم السبت تحولت إلى لحظة تغير الحياة عندما أصيب مؤسسنا بخلع في الكتف أثناء محاولة قوية للتسديد."
                },
                timeline3: {
                    title: "الرؤية",
                    description: "ظهر سؤال بسيط: \"ماذا لو كان هناك مساعد افتراضي يمكنه التعامل مع كل هذا بسلاسة؟\" ليس فقط للرعاية الصحية، بل لكل صناعة."
                },
                timeline4: {
                    title: "ولادة إيما",
                    description: "من لحظة الإلهام تلك، وُلدت إيما - مساعد ذكاء اصطناعي مصمم لسد الفجوة بين التكنولوجيا المعقدة والناس العاديين."
                }
            },
            leadership_team: {
                title: "تعرف على فريق القيادة",
                description: "الرؤساء الذين يقودون مهمة إيما لدمقرطة الذكاء الاصطناعي",
                member1: {
                    name: "جاي تالوري",
                    role: "المؤسس والرئيس",
                    bio: "رجل أعمال متميز أسس كودفاست في مارس 2021، مما يظهر التزامه بحلول الأعمال المبتكرة."
                },
                member2: {
                    name: "رادها آلا",
                    role: "المؤسس والرئيس التنفيذي",
                    bio: "مؤسس والرئيس التنفيذي لشركة كودفاست، يستفيد من الذكاء الاصطناعي لإحداث ثورة في تطوير التطبيقات وتمكين الفرق من بناء تطبيقات مخصصة بسهولة."
                },
                member3: {
                    name: "سومان تاماريدي",
                    role: "الرئيس التنفيذي للعمليات",
                    bio: "الرئيس التنفيذي للعمليات في كودفاست، يجلب خبرة واسعة في إدارة الشركات التي تقودها التكنولوجيا وشغل مناصب إدارية."
                },
                member4: {
                    name: "براساد باندارو",
                    role: "رئيس الذكاء الاصطناعي",
                    bio: "مدير التكنولوجيا في كودفاست، يشرف على التطورات التكنولوجية مع التركيز على الاستفادة من أدوات الذكاء الاصطناعي بدون كود."
                }
            },
            team: {
                title: "الفريق وراء إيما",
                description: "المحترفون المتفانون الذين يجعلون إيما حقيقة",
                member1: {
                    name: "شري تالوري",
                    role: "مدير العمليات",
                    bio: "محترف عمليات متميز يقود فريقاً من أكثر من 20 شخصاً، يطور السياسات ويدير الميزانيات ويحدد فرص البيع المتقاطع."
                },
                member2: {
                    name: "رافي باليتي",
                    role: "رئيس المبيعات",
                    bio: "تنفيذي مخضرم مع أكثر من 18 عاماً في قيادة التكنولوجيا والأعمال. خبير في الاستراتيجية والابتكار وتسليم المنتجات وقيادة الفرق متعددة الوظائف."
                },
                member3: {
                    name: "شيكا بخشي",
                    role: "رئيس التسويق",
                    bio: "مدير نجاح العملاء في كودفاست مع خبرة في مركز عمليات جوجل وباركليز. ماهرة في علاقات العملاء وإدارة الحسابات."
                },
                member4: {
                    name: "موهيث",
                    role: "مدير مشروع الأتمتة",
                    bio: "مدير تقني متخصص في تحسين دورة حياة تطوير البرمجيات من خلال دمج الأتمتة القوية مع تسليم المشاريع الرشيقة."
                }
            },
            cta: {
                title: "مستعد لتحويل منظمتك؟",
                description: "دعنا نناقش كيف يمكن لإيما إحداث ثورة في عملياتك بالأتمتة الذكية.",
                button: "ابدأ اليوم"
            },
            vision: {
                title: "رؤيتنا",
                description: "عالم حيث كل منظمة لديها إمكانية الوصول إلى وكلاء الذكاء الاصطناعي الذكيين الذين يفهمون ويتعلمون ويتكيفون مع احتياجاتهم وتحدياتهم الفريدة."
            },
            values: {
                title: "قيمنا",
                items: [
                    {
                        title: "الابتكار",
                        description: "دفع حدود ما هو ممكن مع تقنية الذكاء الاصطناعي"
                    },
                    {
                        title: "الموثوقية",
                        description: "بناء حلول قوية وموثوقة يمكن للمنظمات الوثوق بها"
                    },
                    {
                        title: "إمكانية الوصول",
                        description: "جعل تقنية الذكاء الاصطناعي المتقدمة متاحة للجميع"
                    },
                    {
                        title: "التميز",
                        description: "تقديم نتائج وتجارب عملاء استثنائية"
                    }
                ]
            },
            team: {
                title: "الفريق وراء إيما",
                description: "المحترفون المتفانون الذين يجعلون إيما حقيقة",
                member1: {
                    name: "شري تالوري",
                    role: "مدير العمليات",
                    bio: "محترف عمليات متميز يقود فريقاً من أكثر من 20 شخصاً، يطور السياسات ويدير الميزانيات ويحدد فرص البيع المتقاطع."
                },
                member2: {
                    name: "رافي باليتي",
                    role: "رئيس المبيعات",
                    bio: "تنفيذي مخضرم مع أكثر من 18 عاماً في قيادة التكنولوجيا والأعمال. خبير في الاستراتيجية والابتكار وتسليم المنتجات وقيادة الفرق متعددة الوظائف."
                },
                member3: {
                    name: "شيكا بخشي",
                    role: "رئيس التسويق",
                    bio: "مدير نجاح العملاء في كودفاست مع خبرة في مركز عمليات جوجل وباركليز. ماهرة في علاقات العملاء وإدارة الحسابات."
                },
                member4: {
                    name: "موهيث",
                    role: "مدير مشروع الأتمتة",
                    bio: "مدير تقني متخصص في تحسين دورة حياة تطوير البرمجيات من خلال دمج الأتمتة القوية مع تسليم المشاريع الرشيقة."
                }
            },
            stats: {
                title: "بالأرقام",
                items: [
                    {
                        number: "500+",
                        label: "منظمة مخدومة"
                    },
                    {
                        number: "1M+",
                        label: "محادثة معالجة"
                    },
                    {
                        number: "99.9%",
                        label: "ضمان وقت التشغيل"
                    },
                    {
                        number: "24/7",
                        label: "دعم متاح"
                    }
                ]
            }
        },

        // Resources Page
        resources: {
            title: "الموارد",
            subtitle: "كل ما تحتاجه للنجاح مع إيما",
            description: "الوصول إلى مكتبتنا الشاملة من الموارد والأدلة والأدوات لتعظيم نجاحك مع منصة أتمتة الذكاء الاصطناعي لإيما.",
            page_title: "الموارد",
            page_subtitle: "رؤى ودراسات حالة وأفضل الممارسات الصناعية",
            page_description: "استكشف مجموعتنا الشاملة من الموارد لمساعدتك على النجاح",
            categories: {
                all: "الكل",
                blogs: "المدونات",
                case_studies: "دراسات الحالة",
                use_cases: "حالات الاستخدام",
                documentation: "الوثائق",
                guides: "الأدلة",
                whitepapers: "الأوراق البيضاء",
                webinars: "الندوات عبر الإنترنت",
                tutorials: "الدروس التعليمية"
            },
            filters: {
                filter_by_type: "تصفية حسب النوع",
                filter_by_industry: "تصفية حسب الصناعة",
                all_resources: "جميع الموارد",
                all_industries: "جميع الصناعات",
                latest: "الأحدث",
                oldest: "الأقدم",
                popular: "الأكثر شعبية",
                most_viewed: "الأكثر مشاهدة",
                featured: "المميز",
                sort_by: "ترتيب حسب"
            },
            search: {
                placeholder: "البحث في الموارد...",
                button: "بحث",
                searching: "جاري البحث...",
                no_results: "لم يتم العثور على موارد",
                try_different: "جرب تعديل المرشحات أو مصطلحات البحث"
            },
            actions: {
                load_more: "تحميل المزيد",
                loading: "جاري التحميل...",
                read_more: "اقرأ المزيد",
                view_details: "عرض التفاصيل",
                download: "تحميل",
                share: "مشاركة"
            },
            card: {
                by: "بواسطة",
                published_on: "نُشر في",
                min_read: "دقيقة قراءة",
                views: "مشاهدات",
                view: "مشاهدة",
                read_time: "وقت القراءة",
                author: "المؤلف",
                date: "التاريخ",
                tags: "العلامات",
                industry: "الصناعة"
            },
            empty_state: {
                title: "لم يتم العثور على موارد",
                description: "لم نتمكن من العثور على أي موارد تطابق معاييرك.",
                suggestion: "جرب تعديل المرشحات أو مصطلحات البحث للعثور على ما تبحث عنه.",
                clear_filters: "مسح المرشحات",
                browse_all: "تصفح جميع الموارد"
            },
            loading_state: {
                loading: "جاري تحميل الموارد...",
                please_wait: "يرجى الانتظار بينما نحضر أحدث المحتوى"
            },
            stats: {
                total: "إجمالي الموارد",
                blogs: "المدونات",
                case_studies: "دراسات الحالة",
                use_cases: "حالات الاستخدام"
            }
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = translations;
} else {
    window.translations = translations;
}

