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

        const prompt = `You are an expert technical writer. Generate a comprehensive, professional README.md file for this GitHub repository.

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

Please generate a detailed README.md that includes:

1. **Project Title and Description**: Clear, engaging description of what the project does
2. **Features**: List the main features and capabilities (be specific based on the code)
3. **Tech Stack**: Identify all technologies, frameworks, and libraries used
4. **Installation**: Step-by-step installation instructions
5. **Usage**: How to use the application with examples
6. **Configuration**: Environment variables and configuration needed
7. **API Documentation** (if applicable): Key endpoints and their usage
8. **Contributing**: Guidelines for contributing
9. **License**: Mention the license if found

Make it professional, well-formatted in Markdown, and specific to this project. Don't use generic placeholders - analyze the actual code and provide real, actionable information.`;

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
