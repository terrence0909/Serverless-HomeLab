exports.handler = async (event) => {
    console.log('🚀 Homelab API with Analytics');
    
    const path = event.rawPath || event.path || "/";
    const httpMethod = event.requestContext?.http?.method || event.httpMethod || 'GET';
    console.log('Path:', path, 'Method:', httpMethod);
    
    try {
        // ANALYTICS ENDPOINTS
        if (path === '/analytics/clicks') {
            return await getClickAnalytics();
        }
        
        if (path === '/analytics/urls') {
            return await getURLStats();
        }
        
        if (path.startsWith('/analytics/url/')) {
            const urlSlug = path.replace('/analytics/url/', '');
            return await getURLDetailAnalytics(urlSlug);
        }
        
        // TEST DYNAMODB ENDPOINT
        if (path === '/test-dynamodb') {
            const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
            const client = new DynamoDBClient({ region: 'us-east-1' });
            const analyticsTable = process.env.ANALYTICS_TABLE;
            const customUrlsTable = process.env.CUSTOM_URLS_TABLE;
            const tablesResult = await client.send(new ListTablesCommand({}));
            
            return {
                statusCode: 200,
                headers: { 
                    "Content-Type": "application/json", 
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: JSON.stringify({
                    success: true,
                    message: "🎉 DynamoDB Connection Successful!",
                    tables: {
                        analytics: analyticsTable,
                        custom_urls: customUrlsTable
                    },
                    availableTables: tablesResult.TableNames,
                    sdk: "AWS SDK v3"
                })
            };
        }
        
        // Personal URL Shortener
        const shortUrls = {
            'github': 'https://github.com/terrence0909',
            'linkedin': 'https://www.linkedin.com/in/tshepo-tau-8ab6b4b4',
            'resume': 'https://docs.google.com/document/d/your-resume-link',
            'portfolio': 'https://your-portfolio.com',
            'twitter': 'https://twitter.com',
            'email': 'mailto:tauterrence09@gmail.com'
        };
        
        // TRACK CLICK ENDPOINT (POST)
        if (path === '/track' && httpMethod === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }
            
            const shortCode = body.shortUrl;
            if (shortCode) {
                await trackClick(shortCode, event);
                return {
                    statusCode: 200,
                    headers: { 
                        "Content-Type": "application/json", 
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    },
                    body: JSON.stringify({
                        success: true,
                        message: "Click tracked",
                        slug: shortCode
                    })
                };
            }
            
            return {
                statusCode: 400,
                headers: { 
                    "Content-Type": "application/json", 
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                },
                body: JSON.stringify({
                    success: false,
                    error: "Missing shortUrl parameter"
                })
            };
        }
        
        // CREATE NEW SHORT URL ENDPOINT (POST) - UPDATED WITH DYNAMODB STORAGE
        if (path === '/links' && httpMethod === 'POST') {
            let body;
            try {
                body = JSON.parse(event.body);
            } catch (e) {
                body = {};
            }
            
            const { shortUrl, longUrl } = body;
            
            if (!shortUrl || !longUrl) {
                return {
                    statusCode: 400,
                    headers: { 
                        "Content-Type": "application/json", 
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    },
                    body: JSON.stringify({
                        success: false,
                        error: "Missing shortUrl or longUrl parameters"
                    })
                };
            }
            
            // Check if short URL already exists in hardcoded URLs
            if (shortUrls[shortUrl]) {
                return {
                    statusCode: 400,
                    headers: { 
                        "Content-Type": "application/json", 
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    },
                    body: JSON.stringify({
                        success: false,
                        error: "Short URL already exists in system URLs"
                    })
                };
            }
            
            // Save to DynamoDB
            const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
            const { marshall } = require('@aws-sdk/util-dynamodb');
            
            const client = new DynamoDBClient({ region: 'us-east-1' });
            
            const urlData = {
                shortUrl: shortUrl,
                longUrl: longUrl,
                createdAt: new Date().toISOString(),
                clicks: 0
            };
            
            try {
                await client.send(new PutItemCommand({
                    TableName: process.env.CUSTOM_URLS_TABLE,
                    Item: marshall(urlData),
                    ConditionExpression: "attribute_not_exists(shortUrl)" // Prevent overwrites
                }));
                
                return {
                    statusCode: 200,
                    headers: { 
                        "Content-Type": "application/json", 
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization"
                    },
                    body: JSON.stringify({
                        success: true,
                        message: "Short URL created",
                        shortUrl: shortUrl,
                        longUrl: longUrl,
                        shortLink: `https://${event.requestContext?.domainName}/go/${shortUrl}`
                    })
                };
            } catch (error) {
                if (error.name === 'ConditionalCheckFailedException') {
                    return {
                        statusCode: 400,
                        headers: { 
                            "Content-Type": "application/json", 
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                            "Access-Control-Allow-Headers": "Content-Type, Authorization"
                        },
                        body: JSON.stringify({
                            success: false,
                            error: "Short URL already exists"
                        })
                    };
                }
                throw error;
            }
        }
        
        // CORS PREFLIGHT HANDLER
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                    "Access-Control-Max-Age": "86400"
                },
                body: ''
            };
        }
        
        // URL Shortener - WITH CLICK TRACKING (UPDATED TO CHECK CUSTOM URLS)
        if (path.startsWith('/go/')) {
            // Extract the code from the path (works for both /go/{code} and /go/{proxy})
            let shortCode = path.substring(4); // Remove '/go/'
            
            // If there's a trailing slash, remove it
            if (shortCode.endsWith('/')) {
                shortCode = shortCode.slice(0, -1);
            }
            
            console.log('URL Shortener: code=', shortCode, 'path=', path);
            
            // Check hardcoded URLs first
            let destination = shortUrls[shortCode];
            
            // If not found in hardcoded, check custom URLs in DynamoDB
            if (!destination) {
                destination = await getCustomUrl(shortCode);
            }
            
            if (destination) {
                // TRACK THE CLICK
                trackClick(shortCode, event);
                console.log('Redirecting', shortCode, 'to', destination);
                
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
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ 
                        error: 'Short URL not found',
                        available: Object.keys(shortUrls),
                        requested: shortCode,
                        path: path
                    })
                };
            }
        }
        
        // LINKS ENDPOINT - UPDATED TO INCLUDE CUSTOM URLS
        if (path === '/links') {
            const customUrls = await getAllCustomUrls();
            const allUrls = { ...shortUrls, ...customUrls };
            
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    available_short_urls: allUrls,
                    usage: "Visit /go/{code} to redirect",
                    example: "/go/github → https://github.com",
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // STATUS ENDPOINT
        if (path === '/status') {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // TOOLS ENDPOINT
        if (path === '/tools') {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
                            name: "📈 URL Analytics", 
                            status: "🟢 Live", 
                            description: "Click tracking & insights",
                            endpoint: "/analytics" 
                        },
                        { 
                            name: "🗄️ DynamoDB Analytics", 
                            status: "🟢 Live", 
                            description: "Database connection test",
                            endpoint: "/test-dynamodb" 
                        }
                    ],
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // ROOT ENDPOINT
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: "🚀 Tshepo's Serverless Homelab",
                description: "Personal cloud platform - Cost: ~$2/month",
                endpoints: {
                    'GET /': 'This info page',
                    'GET /go/{code}': 'URL shortener (try /go/github)',
                    'GET /status': 'System status & metrics',
                    'GET /links': 'All available short URLs', 
                    'GET /tools': 'Available homelab tools',
                    'GET /test-dynamodb': 'Test DynamoDB connection',
                    'GET /analytics/clicks': 'Get click analytics',
                    'GET /analytics/urls': 'Get URL statistics',
                    'GET /analytics/url/{slug}': 'Get detailed URL analytics',
                    'POST /track': 'Track a click',
                    'POST /links': 'Create new short URL'
                },
                architecture: {
                    compute: "AWS Lambda",
                    api: "API Gateway",
                    database: "DynamoDB",
                    cost: "$2-5/month",
                    scaling: "Automatic",
                    maintenance: "Zero"
                },
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                success: false,
                error: error.message,
                code: error.name
            })
        };
    }
};

// CLICK TRACKING FUNCTION
async function trackClick(shortCode, event) {
    const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
    const { marshall } = require('@aws-sdk/util-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    
    const clickData = {
        click_id: `click-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        slug: shortCode,
        timestamp: new Date().toISOString(),
        user_agent: event.headers?.['User-Agent'] || 'unknown',
        ip_address: event.requestContext?.identity?.sourceIp || 'unknown',
        referrer: event.headers?.Referer || event.headers?.referer || 'direct',
    };
    
    try {
        await client.send(new PutItemCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Item: marshall(clickData)
        }));
        console.log('Click tracked:', shortCode);
    } catch (error) {
        console.error('Failed to track click:', error);
    }
}

// GET CUSTOM URL FROM DYNAMODB
async function getCustomUrl(shortUrl) {
    const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
    const { unmarshall } = require('@aws-sdk/util-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    
    try {
        const result = await client.send(new GetItemCommand({
            TableName: process.env.CUSTOM_URLS_TABLE,
            Key: { shortUrl: { S: shortUrl } }
        }));
        
        if (result.Item) {
            const item = unmarshall(result.Item);
            return item.longUrl;
        }
        return null;
    } catch (error) {
        console.error('Error getting custom URL:', error);
        return null;
    }
}

// GET ALL CUSTOM URLS FROM DYNAMODB
async function getAllCustomUrls() {
    const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
    const { unmarshall } = require('@aws-sdk/util-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    
    try {
        const result = await client.send(new ScanCommand({
            TableName: process.env.CUSTOM_URLS_TABLE
        }));
        
        const customUrls = {};
        if (result.Items) {
            result.Items.forEach(item => {
                const url = unmarshall(item);
                customUrls[url.shortUrl] = url.longUrl;
            });
        }
        return customUrls;
    } catch (error) {
        console.error('Error getting custom URLs:', error);
        return {};
    }
}

// ANALYTICS FUNCTIONS
async function getClickAnalytics() {
    const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
    const { unmarshall } = require('@aws-sdk/util-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    
    try {
        const result = await client.send(new ScanCommand({
            TableName: process.env.ANALYTICS_TABLE,
            Limit: 100
        }));
        
        const clicks = result.Items ? result.Items.map(item => unmarshall(item)) : [];
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                success: true,
                total_clicks: clicks.length,
                clicks: clicks,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Analytics error:', error);
        throw error;
    }
}

async function getURLStats() {
    const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
    const { unmarshall } = require('@aws-sdk/util-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    
    try {
        const result = await client.send(new ScanCommand({
            TableName: process.env.ANALYTICS_TABLE
        }));
        
        const clicks = result.Items ? result.Items.map(item => unmarshall(item)) : [];
        
        // Group by slug and count
        const urlStats = {};
        clicks.forEach(click => {
            if (!urlStats[click.slug]) {
                urlStats[click.slug] = { count: 0, last_click: click.timestamp };
            }
            urlStats[click.slug].count++;
            if (click.timestamp > urlStats[click.slug].last_click) {
                urlStats[click.slug].last_click = click.timestamp;
            }
        });
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                success: true,
                url_stats: urlStats,
                total_clicks: clicks.length,
                unique_urls: Object.keys(urlStats).length,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('URL stats error:', error);
        throw error;
    }
}

async function getURLDetailAnalytics(slug) {
    const { DynamoDBClient, QueryCommand } = require('@aws-sdk/client-dynamodb');
    const { unmarshall } = require('@aws-sdk/util-dynamodb');
    
    const client = new DynamoDBClient({ region: 'us-east-1' });
    
    try {
        const result = await client.send(new QueryCommand({
            TableName: process.env.ANALYTICS_TABLE,
            IndexName: 'slug-index',
            KeyConditionExpression: 'slug = :slug',
            ExpressionAttributeValues: {
                ':slug': { S: slug }
            },
            ScanIndexForward: false
        }));
        
        const clicks = result.Items ? result.Items.map(item => unmarshall(item)) : [];
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                success: true,
                slug: slug,
                total_clicks: clicks.length,
                clicks: clicks,
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('URL detail analytics error:', error);
        throw error;
    }
}