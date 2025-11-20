import { VertexAI } from "@google-cloud/vertexai";

const project = "gcp-sandpit-intelia";
const location = "us-central1";

const vertexAI = new VertexAI({ project, location });

export const getGeminiModel = () => {
    return vertexAI.getGenerativeModel({ model: "gemini-pro" });
};
