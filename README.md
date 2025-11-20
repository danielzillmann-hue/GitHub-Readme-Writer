# GitHub Readme Writer

AI-powered README generator for GitHub repositories using Google Vertex AI.

## Features

- **GitHub OAuth Integration**: Securely sign in with your GitHub account
- **Repository Selection**: Browse and select from your GitHub repositories
- **AI-Powered Generation**: Uses Google Vertex AI (Gemini) to analyze your project and generate comprehensive READMEs
- **Modern UI**: Built with Next.js 14, React 18, and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js with GitHub Provider
- **AI**: Google Cloud Vertex AI (Gemini Pro)
- **Styling**: Tailwind CSS
- **Deployment**: Google Cloud Run

## Setup

### Prerequisites

- Node.js 18+ installed
- A Google Cloud Platform account with Vertex AI API enabled
- A GitHub OAuth App (for authentication)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## Deployment to Google Cloud Run

1. Ensure you have the Google Cloud SDK installed and configured
2. Update the `lib/gemini.ts` file with your GCP project ID
3. Deploy using Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Usage

1. Sign in with your GitHub account
2. Select a repository from your list
3. The AI will analyze the repository structure and generate a comprehensive README
4. Copy and use the generated README in your project

## License

ISC
