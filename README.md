# 🏠 Serverless HomeLab

A **cost-optimized serverless homelab** built with AWS Lambda, API Gateway, and Terraform.

## 🚀 Live Demo
**API URL:** `https://8r9ac1cid7.execute-api.us-east-1.amazonaws.com/`

### Endpoints
- `GET /` - Homelab dashboard
- `GET /status` - System status & cost metrics
- `GET /links` - URL shortener directory
- `GET /tools` - Services catalog
- `GET /go/{code}` - URL shortener

## 💰 Cost: $2/month (97% savings vs EKS)

## 🏗️ Architecture
- **Infrastructure**: Terraform
- **Compute**: AWS Lambda
- **API**: API Gateway
- **Cost**: ~$2/month

## 🚀 Deployment
```bash
cd terraform
terraform init
terraform apply
```

## 📁 Structure
```
terraform/     # Infrastructure code
lambda/        # Lambda function
kubernetes/    # K8s manifests (optional)
```
