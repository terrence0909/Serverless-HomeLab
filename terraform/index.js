exports.handler = async (event) => {
    const path = event.rawPath || "/";
    
    console.log('Request path:', path);
    
    // Personal URL Shortener - Add your actual links here!
    const shortUrls = {
        'github': 'https://github.com',
        'linkedin': 'https://linkedin.com',
        'resume': 'https://docs.google.com/document/d/your-resume-link',
        'portfolio': 'https://your-portfolio.com',
        'twitter': 'https://twitter.com',
        'email': 'mailto:your.email@domain.com'
    };
    
    // URL Shortener - Redirect /go/{code} to actual URLs
    if (path.startsWith('/go/')) {
        const shortCode = path.split('/go/')[1];
        const destination = shortUrls[shortCode];
        
        if (destination) {
            return {
                statusCode: 302,
                headers: { 
                    'Location': destination,
                    'Access-Control-Allow-Origin': '*'
                },
                body: ''
            };
        } else {
            return {
                statusCode: 404,
                headers: { 
                    "Content-Type": "application/json", 
                    "Access-Control-Allow-Origin": "*" 
                },
                body: JSON.stringify({ 
                    error: 'Short URL not found',
                    available: Object.keys(shortUrls),
                    path: path
                })
            };
        }
    }
    
    // Handle specific routes
    if (path === '/status') {
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                status: "🟢 All Systems Operational",
                cost_breakdown: {
                    lambda: "$0.50/month",
                    api_gateway: "$1.20/month", 
                    total: "$1.70/month"
                },
                performance: {
                    response_time: "< 100ms",
                    availability: "99.95%"
                },
                timestamp: new Date().toISOString(),
                path: path
            })
        };
    }
    
    if (path === '/links') {
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                available_short_urls: shortUrls,
                usage: "Visit /go/{code} to redirect",
                example: "/go/github → https://github.com",
                timestamp: new Date().toISOString(),
                path: path
            })
        };
    }
    
    if (path === '/tools') {
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json", 
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                homelab_services: [
                    { 
                        name: "🔗 URL Shortener", 
                        status: "🟢 Live",
                        description: "Personal link management",
                        endpoint: "/go/{code}" 
                    },
                    { 
                        name: "📊 System Monitor", 
                        status: "🟢 Live", 
                        description: "Real-time homelab metrics",
                        endpoint: "/status" 
                    },
                    { 
                        name: "📧 Contact API", 
                        status: "🟡 Planned", 
                        description: "Handle form submissions" 
                    },
                    { 
                        name: "📁 File Sharing", 
                        status: "🟡 Planned", 
                        description: "Secure file upload/download" 
                    }
                ],
                timestamp: new Date().toISOString(),
                path: path
            })
        };
    }
    
    // Default route (/)
    return {
        statusCode: 200,
        headers: { 
            "Content-Type": "application/json", 
            "Access-Control-Allow-Origin": "*" 
        },
        body: JSON.stringify({
            message: "🚀 Tshepo's Serverless Homelab",
            description: "Personal cloud platform - Cost: ~$2/month",
            endpoints: {
                'GET /': 'This info page',
                'GET /go/{code}': 'URL shortener (try /go/github)',
                'GET /status': 'System status & metrics',
                'GET /links': 'All available short URLs', 
                'GET /tools': 'Available homelab tools'
            },
            architecture: {
                compute: "AWS Lambda",
                api: "API Gateway",
                cost: "$2-5/month",
                scaling: "Automatic",
                maintenance: "Zero"
            },
            timestamp: new Date().toISOString(),
            path: path
        })
    };
};
