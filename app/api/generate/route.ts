import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRepoContent } from "@/lib/github";
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

        const files = await getRepoContent(session.accessToken as string, owner, repo, "");

        if (!files) {
            console.error("Could not fetch repo content");
            return NextResponse.json({ error: "Could not fetch repo content" }, { status: 500 });
        }

        const fileList = Array.isArray(files) ? files.map((f: any) => f.name).join("\n") : "No files found";
        console.log(`Found ${Array.isArray(files) ? files.length : 0} files`);

        const prompt = `
    I have a GitHub repository with the following files:
    ${fileList}
    
    Please generate a comprehensive README.md file for this project.
    Include sections for: Introduction, Features, Installation, Usage.
    Make reasonable assumptions based on the file names (e.g. if you see package.json, it's a Node project).
  `;

        console.log("Calling Vertex AI...");
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
