exports.handler = async (event) => {
    console.log('🚀 Lambda function started with AWS SDK v3');
    
    const path = event.rawPath || event.path || "/";
    console.log('Path:', path);
    
    try {
        // Test AWS SDK v3 availability
        console.log('Testing AWS SDK v3...');
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        console.log('AWS SDK v3 loaded successfully');
        
        if (path === '/test-dynamodb') {
            console.log('Testing DynamoDB connection...');
            
            const { ScanCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
            const client = new DynamoDBClient({ region: 'us-east-1' });
            const tableName = process.env.ANALYTICS_TABLE;
            
            console.log('Table name:', tableName);
            
            if (!tableName) {
                throw new Error('ANALYTICS_TABLE environment variable not set');
            }
            
            // List tables to verify connection
            const listCommand = new ListTablesCommand({});
            const tablesResult = await client.send(listCommand);
            console.log('Available tables:', tablesResult.TableNames);
            
            if (!tablesResult.TableNames.includes(tableName)) {
                return {
                    statusCode: 404,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({
                        success: false,
                        error: `Table "${tableName}" not found`,
                        availableTables: tablesResult.TableNames
                    })
                };
            }
            
            // Scan the table
            const scanCommand = new ScanCommand({
                TableName: tableName,
                Limit: 5
            });
            const scanResult = await client.send(scanCommand);
            
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    success: true,
                    message: "🎉 DynamoDB connection successful!",
                    table: tableName,
                    itemCount: scanResult.Count,
                    availableTables: tablesResult.TableNames,
                    sdk: "AWS SDK v3"
                })
            };
        }
        
        // Simple endpoints without DynamoDB
        if (path === '/status') {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({
                    status: "🟢 Systems Operational",
                    dynamodbConfigured: !!process.env.ANALYTICS_TABLE,
                    timestamp: new Date().toISOString()
                })
            };
        }
        
        // Root endpoint
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: "🚀 Tshepo's Serverless Homelab",
                status: "AWS SDK v3 Version",
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
                stack: error.stack,
                environment: {
                    table: process.env.ANALYTICS_TABLE,
                    region: process.env.AWS_REGION
                }
            })
        };
    }
};
