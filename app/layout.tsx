import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
    title: "GitHub Readme Writer",
    description: "Generate comprehensive READMEs for your GitHub repositories using AI.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased bg-slate-950 text-slate-50">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
