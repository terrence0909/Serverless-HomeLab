terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = "us-east-1"
  profile = "homelab"
}

resource "aws_iam_role" "lambda_exec" {
  name = "homelab-lambda-exec-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Add DynamoDB table for analytics
resource "aws_dynamodb_table" "analytics" {
  name           = "homelab-analytics"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "click_id"

  attribute {
    name = "click_id"
    type = "S"
  }

  attribute {
    name = "slug"
    type = "S"
  }

  # Global secondary index for querying by slug
  global_secondary_index {
    name               = "slug-index"
    hash_key           = "slug"
    projection_type    = "ALL"
    read_capacity      = 5
    write_capacity     = 5
  }

  tags = {
    Project = "homelab"
  }
}

# Add IAM policy for DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "homelab-lambda-dynamodb"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.analytics.arn,
          "${aws_dynamodb_table.analytics.arn}/index/*"
        ]
      }
    ]
  })
}

# UPDATED Lambda function with environment variable
resource "aws_lambda_function" "homelab_api" {
  filename         = "lambda-function.zip"
  source_code_hash = filebase64sha256("lambda-function.zip")
  function_name    = "homelab-api"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  memory_size     = 128
  timeout         = 30

  # ADDED environment variable for analytics
  environment {
    variables = {
      ANALYTICS_TABLE = aws_dynamodb_table.analytics.name
    }
  }
}

resource "aws_apigatewayv2_api" "homelab" {
  name          = "homelab-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "homelab" {
  api_id = aws_apigatewayv2_api.homelab.id
  name   = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "homelab" {
  api_id           = aws_apigatewayv2_api.homelab.id
  integration_type = "AWS_PROXY"
  integration_method = "POST"
  integration_uri  = aws_lambda_function.homelab_api.invoke_arn
  payload_format_version = "2.0"
}

# SPECIFIC ROUTES (not catch-all)
resource "aws_apigatewayv2_route" "homelab_root" {
  api_id    = aws_apigatewayv2_api.homelab.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.homelab.id}"
}

resource "aws_apigatewayv2_route" "homelab_status" {
  api_id    = aws_apigatewayv2_api.homelab.id
  route_key = "GET /status"
  target    = "integrations/${aws_apigatewayv2_integration.homelab.id}"
}

resource "aws_apigatewayv2_route" "homelab_links" {
  api_id    = aws_apigatewayv2_api.homelab.id
  route_key = "GET /links"
  target    = "integrations/${aws_apigatewayv2_integration.homelab.id}"
}

resource "aws_apigatewayv2_route" "homelab_tools" {
  api_id    = aws_apigatewayv2_api.homelab.id
  route_key = "GET /tools"
  target    = "integrations/${aws_apigatewayv2_integration.homelab.id}"
}

resource "aws_apigatewayv2_route" "homelab_go" {
  api_id    = aws_apigatewayv2_api.homelab.id
  route_key = "GET /go/{proxy}"
  target    = "integrations/${aws_apigatewayv2_integration.homelab.id}"
}

# ADD analytics route to API Gateway
resource "aws_apigatewayv2_route" "homelab_analytics" {
  api_id    = aws_apigatewayv2_api.homelab.id
  route_key = "GET /analytics"
  target    = "integrations/${aws_apigatewayv2_integration.homelab.id}"
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.homelab_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.homelab.execution_arn}/*/*"
}

output "api_url" {
  value = "${aws_apigatewayv2_api.homelab.api_endpoint}/"
}