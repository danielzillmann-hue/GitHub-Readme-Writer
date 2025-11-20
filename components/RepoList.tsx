"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Repo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
}

export default function RepoList({ repos }: { repos: Repo[] }) {
    const router = useRouter();

    const handleSelect = (repo: Repo) => {
        // Navigate to generation page
        router.push(`/generate?repo=${repo.full_name}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
                <div
                    key={repo.id}
                    className="border border-slate-800 p-4 rounded-lg hover:bg-slate-900 cursor-pointer transition-colors bg-slate-900/50"
                    onClick={() => handleSelect(repo)}
                >
                    <h3 className="font-bold text-lg mb-2 text-blue-400">{repo.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 h-10 overflow-hidden">
                        {repo.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{repo.language}</span>
                        <span className="flex items-center gap-1">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {repo.stargazers_count}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
