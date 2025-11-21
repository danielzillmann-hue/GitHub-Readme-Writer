import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRepoContent, getFileContent, getRepoInfo } from "@/lib/github";
import { getGeminiModel } from "@/lib/gemini";
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

        const prompt = `You are an expert technical writer who writes engaging, human-friendly documentation. Generate a comprehensive README.md file for this GitHub repository.

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

IMPORTANT WRITING GUIDELINES:
- Write in a friendly, conversational tone as if explaining to a colleague
- Use proper Markdown formatting with - for bullet points (NOT * or asterisks)
- Use emojis sparingly but appropriately (e.g., 🚀 for deployment, ⚡ for features, 📦 for installation)
- Write clear, concise sentences without excessive jargon
- Include code examples where helpful
- Make it scannable with good use of headers and formatting

Please generate a detailed README.md that includes:

## 1. Project Title and Badge Section
- Clear, engaging title
- Add relevant badges (build status, version, license) if applicable
- Brief tagline describing what it does

## 2. Overview
- What problem does this solve?
- Who is it for?
- Key value proposition in 2-3 sentences

## 3. ✨ Features
- List main features using - bullet points
- Be specific based on the actual code
- Focus on user benefits, not just technical details

## 4. 🏗️ Architecture
- Create a Mermaid diagram showing the system architecture
- Include main components, data flow, and integrations
- Use this format:
\`\`\`mermaid
graph TD
    A[Component A] --> B[Component B]
    B --> C[Component C]
\`\`\`
- Only include if the project has multiple components or services

## 5. 🛠️ Tech Stack
- List technologies, frameworks, and libraries
- Group by category (Frontend, Backend, Database, etc.)
- Use - bullet points

## 6. 📦 Installation
- Clear step-by-step instructions
- Include prerequisites
- Provide actual commands
- Use code blocks for commands

## 7. 🚀 Usage
- How to run the application
- Include examples with code blocks
- Show expected output where relevant

## 8. ⚙️ Configuration
- List environment variables needed
- Explain what each one does
- Provide example values (with placeholders for secrets)

## 9. 📚 API Documentation (if applicable)
- Document key endpoints
- Show request/response examples
- Use tables for parameters

## 10. 🤝 Contributing
- Brief guidelines for contributors
- Link to CONTRIBUTING.md if it exists

## 11. 📄 License
- Mention the license if found in the code

FORMATTING RULES:
✓ Use - for ALL bullet points (never use * or asterisks)
✓ Use proper code blocks with language tags
✓ Use tables for structured data
✓ Use emojis in section headers for visual appeal
✓ Keep paragraphs short (2-3 sentences max)
✓ Use bold for emphasis, not italics
✓ Include a Mermaid architecture diagram if the project has multiple components

Make this README feel like it was written by a human developer who cares about good documentation, not a robot. Be specific to THIS project - analyze the actual code and provide real, actionable information.`;

        console.log("Calling Vertex AI with enhanced prompt...");
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates?.[0].content.parts[0].text;

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
