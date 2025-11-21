import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRepoContent, getFileContent, getRepoInfo } from "@/lib/github";
import { getGeminiModel } from "@/lib/gemini";
import { cleanMermaidDiagram } from "@/lib/mermaid-cleaner";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { owner, repo } = await req.json();
        console.log(`Generating README for ${owner}/${repo}`);

        // Get repository info
        const repoInfo = await getRepoInfo(session.accessToken as string, owner, repo);

        // Get file list
        const files = await getRepoContent(session.accessToken as string, owner, repo, "");

        if (!files) {
            console.error("Could not fetch repo content");
            return NextResponse.json({ error: "Could not fetch repo content" }, { status: 500 });
        }

        const fileList = Array.isArray(files) ? files : [];
        console.log(`Found ${fileList.length} files`);

        // Identify key files to analyze
        const keyFiles = [
            'package.json',
            'README.md',
            'requirements.txt',
            'setup.py',
            'Cargo.toml',
            'go.mod',
            'pom.xml',
            'build.gradle',
            'Gemfile',
            'composer.json'
        ];

        // Fetch content of key files
        const fileContents: Record<string, string> = {};
        for (const file of fileList) {
            if ('name' in file && keyFiles.includes(file.name)) {
                const content = await getFileContent(session.accessToken as string, owner, repo, file.name);
                if (content) {
                    fileContents[file.name] = content.substring(0, 2000); // Limit to first 2000 chars
                }
            }
        }

        // Build comprehensive prompt
        const fileNames = fileList.map((f: any) => f.name).join("\n");
        const repoDescription = repoInfo?.description || "No description provided";
        const repoLanguage = repoInfo?.language || "Unknown";
        const repoTopics = repoInfo?.topics?.join(", ") || "None";

        const prompt = `You are an expert technical writer creating professional documentation for a GitHub repository. Generate a comprehensive README.md file.

Repository Information:
- Name: ${repo}
- Description: ${repoDescription}
- Primary Language: ${repoLanguage}
- Topics: ${repoTopics}

Files in the repository:
${fileNames}

Key File Contents:
${Object.entries(fileContents).map(([name, content]) => `
--- ${name} ---
${content}
`).join('\n')}

WRITING GUIDELINES:
- Use a professional, technical tone suitable for enterprise documentation
- Write clear, precise sentences with appropriate technical terminology
- Use proper Markdown formatting with - for bullet points (NOT * or asterisks)
- Use emojis sparingly in section headers only (e.g., 🚀 for deployment, ⚡ for features, 📦 for installation)
- Include code examples with proper syntax highlighting
- Ensure content is well-structured and scannable

Generate a detailed README.md with these sections:

## 1. Project Title and Badges
- Clear, professional title
- Relevant badges (build status, version, license) if applicable
- Concise tagline describing the project's purpose

## 2. Overview
- Problem statement and solution
- Target audience
- Key value proposition (2-3 sentences)

## 3. ✨ Features
- List main features using - bullet points
- Be specific based on actual code analysis
- Focus on capabilities and benefits

## 4. 🏗️ Architecture
- Create an ASCII art diagram showing the system architecture
- Use simple box-drawing characters and arrows
- Show main components and data flow
- Example format:
    \`\`\`
    ┌─────────────┐
    │   Client    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  API Server │
    └──────┬──────┘
           │
      ┌────┴────┐
      ▼         ▼
    ┌────┐   ┌────────┐
    │ DB │   │ Cache  │
    └────┘   └────────┘
    \`\`\`
- Keep it simple and clear
- Only include if project has 3+ distinct components
- Use boxes (┌─┐│└┘), arrows (→ ← ↑ ↓ ▼ ▲), and lines (─ │ ┬ ┴ ├ ┤)

## 5. 🛠️ Tech Stack
- List technologies, frameworks, and libraries
- Group by category (Frontend, Backend, Database, DevOps, etc.)
- Use - bullet points

## 6. 📦 Installation

### Prerequisites
- List required software and versions

### Setup Steps
- Provide clear, numbered installation steps
- Include actual commands in code blocks
- Specify the working directory if relevant

## 7. 🚀 Usage
- How to run the application
- Include command examples with expected output
- Provide configuration examples

## 8. ⚙️ Configuration
- List all environment variables
- Explain purpose of each variable
- Provide example values (use placeholders for secrets)
- Use a table format:

| Variable | Description | Example |
|----------|-------------|---------|
| VAR_NAME | Purpose | \`value\` |

## 9. 📚 API Documentation (if applicable)
- Document key endpoints
- Show request/response examples
- Use tables for parameters
- Include authentication requirements

## 10. 🤝 Contributing
- Guidelines for contributors
- Code style requirements
- Pull request process

## 11. 📄 License
- State the license type if found

FORMATTING REQUIREMENTS:
✓ Use - for ALL bullet points (never * or asterisks)
✓ Use code blocks with language tags (\`\`\`bash, \`\`\`javascript, etc.)
✓ Use tables for structured data
✓ Use emojis only in section headers
✓ Use ASCII art for architecture diagrams (simple and always renders correctly)
✓ Use bold (**text**) for emphasis
✓ Ensure all diagrams use plain text characters only

Analyze the actual code and provide specific, accurate information. Avoid generic placeholders.`;

        console.log("Calling Vertex AI with enhanced prompt...");
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.candidates?.[0].content.parts[0].text;

        // Clean up any Mermaid diagrams to ensure valid syntax (if any slip through)
        if (text) {
            text = cleanMermaidDiagram(text);
        }

        console.log("README generated successfully");
        return NextResponse.json({ readme: text });
    } catch (error: any) {
        console.error("Error generating content:", error);
        console.error("Error details:", error.message, error.stack);
        return NextResponse.json({
            error: "Failed to generate README",
            details: error.message
        }, { status: 500 });
    }
}
