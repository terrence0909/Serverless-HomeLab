exports.handler = async (event) => {
    console.log('=== FULL EVENT ===');
    console.log(JSON.stringify(event, null, 2));
    console.log('==================');
    
    const rawPath = event.rawPath || "NO_RAW_PATH";
    const requestContextPath = event.requestContext?.http?.path || "NO_CONTEXT_PATH";
    const path = event.rawPath || "/";
    
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            debug: {
                rawPath: rawPath,
                requestContextPath: requestContextPath,
                fullEventKeys: Object.keys(event)
            },
            your_request: {
                intended_path: path,
                actual_data: "Check CloudWatch logs for full event"
            }
        })
    };
};
