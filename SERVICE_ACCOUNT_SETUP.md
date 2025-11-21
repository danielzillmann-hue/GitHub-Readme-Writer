# Service Account Permissions Setup

## Current Service Account

Your Cloud Run service is using the default Compute Engine service account:
```
566828750593-compute@developer.gserviceaccount.com
```

## Required Permissions

To enable Vertex AI API calls, this service account needs the **Vertex AI User** role.

## Grant Permissions via Console

1. Go to: https://console.cloud.google.com/iam-admin/iam?project=gcp-sandpit-intelia
2. Find the service account: `566828750593-compute@developer.gserviceaccount.com`
3. Click the pencil icon (Edit) next to it
4. Click **"ADD ANOTHER ROLE"**
5. Search for and select: **Vertex AI User**
6. Click **"SAVE"**

## Grant Permissions via Command Line

Alternatively, run this command:

```bash
gcloud projects add-iam-policy-binding gcp-sandpit-intelia \
  --member="serviceAccount:566828750593-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## Verify Vertex AI API is Enabled

Also ensure the Vertex AI API is enabled:

1. Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=gcp-sandpit-intelia
2. Click **"ENABLE"** if it's not already enabled

## After Granting Permissions

Once you've granted the permissions:
1. Wait 1-2 minutes for the permissions to propagate
2. Try generating a README again
3. It should now work!

## Model Updated

I've also updated the code to use **Gemini 2.0 Flash (Experimental)** which is the latest and fastest model.
