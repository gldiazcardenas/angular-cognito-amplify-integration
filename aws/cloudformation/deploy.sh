#!/bin/bash

# CloudFormation deployment script for Angular Cognito Demo
# Usage: ./deploy.sh [stack-name] [region]

STACK_NAME=${1:-"angular-cognito-amplify"}
REGION=${2:-"us-east-1"}

echo "🚀 Deploying CloudFormation stack: $STACK_NAME in region: $REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

# Deploy the CloudFormation stack
echo "📦 Creating/updating CloudFormation stack..."

aws cloudformation deploy \
    --template-file aws/cloudformation/template.yml \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
        UserPoolName="angular-cognito-amplify-pool" \
        AppClientName="angular-cognito-amplify-client" \
        CognitoDomainPrefix="angular-auth-$(whoami)-$(date +%m%d%H%M)" \
        CallbackURLs="http://localhost:4200/,https://yourdomain.com/" \
        LogoutURLs="http://localhost:4200/,https://yourdomain.com/" \
        AllowedOAuthFlows="code" \
        AllowedOAuthScopes="openid,email,profile" \
    --tags Project=angular-cognito-amplify Environment=demo

if [ $? -eq 0 ]; then
    echo "✅ Stack deployed successfully!"
    
    # Get stack outputs
    echo "📋 Stack outputs:"
    aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
    
    echo ""
    echo "🔧 Next steps:"
    echo "1. Copy the UserPoolId, UserPoolClientId, and HostedUIDomain from the outputs above"
    echo "2. Update your Angular environment files with these values"
    echo "3. Test the authentication flow with 'ng serve'"
    
else
    echo "❌ Stack deployment failed!"
    exit 1
fi
