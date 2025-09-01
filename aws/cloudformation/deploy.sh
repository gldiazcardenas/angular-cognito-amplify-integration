#!/bin/bash

# CloudFormation deployment script for Angular Cognito Amplify Integration with AWS Amplify v6
# Usage: ./deploy.sh [stack-name] [region]

STACK_NAME=${1:-"angular-cognito-amplify"}
REGION=${2:-"us-east-1"}

echo "🚀 Deploying CloudFormation stack: $STACK_NAME in region: $REGION"
echo "📦 Setting up AWS Cognito infrastructure for Angular authentication with AWS Amplify v6"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured. Please run 'aws configure' first."
    echo "   Run: aws configure"
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
    echo "2. Update your Angular environment files (src/environments/environment.ts and environment.prod.ts)"
    echo "3. Replace the placeholder values with the actual Cognito configuration"
    echo "4. Test the authentication flow with 'ng serve'"
    echo ""
    echo "📚 For detailed setup instructions, see:"
    echo "   - README.md for project overview"
    echo "   - COGNITO_SETUP.md for manual Cognito configuration"
    echo "   - aws/cloudformation/template.yml for infrastructure details"
    
else
    echo "❌ Stack deployment failed!"
    echo "💡 Troubleshooting tips:"
    echo "   - Check if the Cognito domain prefix is unique (try a different prefix)"
    echo "   - Verify your AWS credentials have sufficient permissions"
    echo "   - Check the CloudFormation console for detailed error messages"
    exit 1
fi
