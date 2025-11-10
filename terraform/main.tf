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

resource "aws_lambda_function" "homelab_api" {
  filename         = "lambda-function.zip"
  source_code_hash = filebase64sha256("lambda-function.zip")
  function_name    = "homelab-api"
  role            = aws_iam_role.lambda_exec.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  memory_size     = 128
  timeout         = 30
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