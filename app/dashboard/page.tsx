import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserRepos } from "@/lib/github";
import RepoList from "@/components/RepoList";
import LoginButton from "@/components/LoginButton";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        redirect("/");
    }

    const repos = await getUserRepos(session.accessToken as string);

    return (
        <main className="min-h-screen p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Select a Repository</h1>
                <LoginButton />
            </header>
            <RepoList repos={repos as any} />
        </main>
    );
}
