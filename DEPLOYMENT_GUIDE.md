# Cloud Run Deployment Guide

## Setting Environment Variables in Cloud Run

The deployment is now fixed and ready to go! Here's how to set the environment variables:

### Step 1: Access Cloud Run Console
Go to: https://console.cloud.google.com/run?project=gcp-sandpit-intelia

### Step 2: Find Your Service
Look for the service named **github-readme-writer** in the list

### Step 3: Edit the Service
1. Click on the service name
2. Click the **"EDIT & DEPLOY NEW REVISION"** button at the top

### Step 4: Set Environment Variables
1. Scroll down to find the **"Variables & Secrets"** section
2. Click on the **"Variables"** tab
3. Click **"ADD VARIABLE"** for each of these:

| Variable Name | Value |
|--------------|-------|
| `GITHUB_ID` | `Ov23liGnyzqmbdJgvrgM` |
| `GITHUB_SECRET` | `aabec0ab71aeb717eff83366efbb777baad8f41c` |
| `NEXTAUTH_SECRET` | `supersecret` |
| `NEXTAUTH_URL` | (Use the Cloud Run URL - see note below) |

**Important Note about NEXTAUTH_URL:**
- After the first deployment, Cloud Run will give you a URL like: `https://github-readme-writer-XXXXX-uc.a.run.app`
- You'll need to:
  1. Deploy once without NEXTAUTH_URL (or use a placeholder)
  2. Copy the generated URL
  3. Edit the service again and add `NEXTAUTH_URL` with that URL
  4. Also update your GitHub OAuth App's callback URL to: `https://your-cloud-run-url/api/auth/callback/github`

### Step 5: Deploy
1. Scroll to the bottom
2. Click **"DEPLOY"**
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 6: Update GitHub OAuth App
1. Go to: https://github.com/settings/developers
2. Find your OAuth App
3. Update the **Homepage URL** to your Cloud Run URL
4. Update the **Authorization callback URL** to: `https://your-cloud-run-url/api/auth/callback/github`

## Deployment Status

The code has been pushed to GitHub with the Dockerfile fix. The deployment should now work!

You can trigger a new deployment from the Cloud Run console, and it will automatically pull the latest code from your GitHub repository.
