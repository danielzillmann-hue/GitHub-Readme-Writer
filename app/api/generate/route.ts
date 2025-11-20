import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRepoContent } from "@/lib/github";
import { getGeminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { owner, repo } = await req.json();

    const files = await getRepoContent(session.accessToken as string, owner, repo, "");

    if (!files) {
        return NextResponse.json({ error: "Could not fetch repo content" }, { status: 500 });
    }

    const fileList = Array.isArray(files) ? files.map((f: any) => f.name).join("\n") : "No files found";

    const prompt = `
    I have a GitHub repository with the following files:
    ${fileList}
    
    Please generate a comprehensive README.md file for this project.
    Include sections for: Introduction, Features, Installation, Usage.
    Make reasonable assumptions based on the file names (e.g. if you see package.json, it's a Node project).
  `;

    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates?.[0].content.parts[0].text;
        return NextResponse.json({ readme: text });
    } catch (error) {
        console.error("Error generating content:", error);
        return NextResponse.json({ error: "Failed to generate README" }, { status: 500 });
    }
}
