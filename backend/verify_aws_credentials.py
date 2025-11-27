#!/usr/bin/env python3
"""
Script to verify AWS credentials for emb_admin user
"""
import boto3
from app.config import settings

def verify_credentials():
    print("🔍 Verifying AWS Credentials...")
    print(f"Region: {settings.aws_region}")
    print(f"Access Key ID: {settings.aws_access_key_id[:10]}..." if settings.aws_access_key_id else "Not set")
    print()
    
    try:
        # Test basic AWS access
        sts = boto3.client(
            'sts',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        identity = sts.get_caller_identity()
        
        print("✅ AWS Credentials are VALID!")
        print(f"   Account ID: {identity.get('Account')}")
        print(f"   User ARN: {identity.get('Arn')}")
        user_name = identity.get('Arn', '').split('/')[-1] if '/' in identity.get('Arn', '') else 'Unknown'
        print(f"   User Name: {user_name}")
        print()
        
        # Test Textract access
        print("🔍 Testing Textract access...")
        textract = boto3.client(
            'textract',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
        print("✅ Textract client created successfully")
        print()
        print("🎉 All credentials are configured correctly!")
        print("   You can now process PDF documents.")
        
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        
        print(f"❌ Error: {error_type}")
        print(f"   {error_msg}")
        print()
        
        if "InvalidClientTokenId" in error_type or "UnrecognizedClientException" in error_msg:
            print("💡 Solution:")
            print("   1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/")
            print("   2. Click 'Users' → 'emb_admin' → 'Security credentials'")
            print("   3. Click 'Create access key'")
            print("   4. Copy the Access Key ID and Secret Access Key")
            print("   5. Update backend/.env file with the new credentials")
            print("   6. Run this script again to verify")
        elif "SubscriptionRequiredException" in error_msg:
            print("💡 Solution:")
            print("   Enable Textract in your AWS account:")
            print("   https://console.aws.amazon.com/textract/home")
        else:
            print("💡 Check your AWS credentials and permissions")

if __name__ == "__main__":
    verify_credentials()

