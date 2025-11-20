"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";

function GenerateContent() {
    const searchParams = useSearchParams();
    const repoFullName = searchParams.get("repo");
    const { data: session } = useSession();
    const [readme, setReadme] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!repoFullName || !session) return;

        const [owner, repo] = repoFullName.split("/");

        fetch("/api/generate", {
            method: "POST",
            body: JSON.stringify({ owner, repo }),
        })
            .then((res) => res.json())
            .then((data) => {
                setReadme(data.readme);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [repoFullName, session]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-8">Generated README for {repoFullName}</h1>
            <div className="bg-slate-900 p-6 rounded-lg prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap">{readme}</pre>
            </div>
        </main>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GenerateContent />
        </Suspense>
    );
}
