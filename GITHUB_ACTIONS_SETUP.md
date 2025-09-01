# GitHub Actions Setup

This project includes a GitHub Actions workflow that automatically deploys the CloudFormation stack when code is pushed to the main branch.

## Workflow Overview

The workflow (`.github/workflows/deploy.yml`) performs the following steps:

1. **Checkout code** - Retrieves the latest code from the repository
2. **Setup Node.js** - Installs Node.js 18 and configures npm caching
3. **Install dependencies** - Runs `npm ci` to install project dependencies
4. **Run tests** - Executes the test suite using Karma and ChromeHeadless
5. **Configure AWS credentials** - Sets up AWS authentication using GitHub secrets
6. **Validate CloudFormation template** - Validates the CloudFormation template before deployment
7. **Deploy CloudFormation stack** - Runs the `deploy.sh` script to deploy the infrastructure
8. **Get stack outputs** - Displays the CloudFormation stack outputs for configuration

## Required GitHub Secrets

Before the workflow can run, you need to configure the following secrets in your GitHub repository:

### 1. AWS_ACCESS_KEY_ID
- **Description**: AWS Access Key ID for the IAM user/role that will deploy the CloudFormation stack
- **How to create**:
  1. Go to AWS IAM Console
  2. Create a new IAM user or use an existing one
  3. Attach the `AWSCloudFormationFullAccess` policy (or create a custom policy with necessary permissions)
  4. Create an Access Key for the user
  5. Copy the Access Key ID

### 2. AWS_SECRET_ACCESS_KEY
- **Description**: AWS Secret Access Key corresponding to the Access Key ID
- **How to create**: 
  1. When creating the Access Key in the previous step, download the CSV file
  2. Copy the Secret Access Key from the CSV

## Setting up GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - Name: `AWS_ACCESS_KEY_ID`
   - Value: Your AWS Access Key ID
   - Name: `AWS_SECRET_ACCESS_KEY`
   - Value: Your AWS Secret Access Key

## Required AWS Permissions

The IAM user/role used for deployment needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:*",
                "cognito-idp:*",
                "iam:*",
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
```

## Customization

### Environment Variables

You can customize the deployment by modifying the environment variables in the workflow:

- `AWS_REGION`: The AWS region for deployment (default: us-east-1)
- `STACK_NAME`: The CloudFormation stack name (default: angular-cognito-amplify)

### Callback URLs

Update the callback URLs in the workflow for your production domain:

```yaml
env:
  CALLBACK_URLS: "https://your-production-domain.com/"
  LOGOUT_URLS: "https://your-production-domain.com/"
```

## Manual Deployment

If you need to deploy manually without using GitHub Actions:

```bash
# Make the script executable
chmod +x aws/cloudformation/deploy.sh

# Run the deployment
./aws/cloudformation/deploy.sh [stack-name] [region]
```

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**: Ensure the GitHub secrets are correctly set
2. **Permission Denied**: Verify the IAM user has the required permissions
3. **Template Validation Failed**: Check the CloudFormation template syntax
4. **Tests Failed**: Fix any failing tests before deployment

### Viewing Workflow Logs

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Click on the workflow run to view detailed logs
4. Check each step for error messages

## Security Considerations

- Never commit AWS credentials to the repository
- Use IAM roles with minimal required permissions
- Regularly rotate AWS access keys
- Consider using OIDC (OpenID Connect) for more secure AWS authentication
