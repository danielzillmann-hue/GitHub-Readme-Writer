import { Octokit } from "@octokit/rest";

export const getOctokit = (accessToken: string) => {
    return new Octokit({
        auth: accessToken,
    });
};

export const getUserRepos = async (accessToken: string) => {
    const octokit = getOctokit(accessToken);
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 100,
        visibility: "all",
    });
    return data;
};

export const getRepoContent = async (accessToken: string, owner: string, repo: string, path: string = "") => {
    const octokit = getOctokit(accessToken);
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });
        return data;
    } catch (error) {
        console.error("Error fetching repo content:", error);
        return null;
    }
};

export const getFileContent = async (accessToken: string, owner: string, repo: string, path: string) => {
    const octokit = getOctokit(accessToken);
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if ('content' in data && data.content) {
            return Buffer.from(data.content, 'base64').toString('utf-8');
        }
        return null;
    } catch (error) {
        console.error(`Error fetching file ${path}:`, error);
        return null;
    }
};

export const getRepoInfo = async (accessToken: string, owner: string, repo: string) => {
    const octokit = getOctokit(accessToken);
    try {
        const { data } = await octokit.rest.repos.get({
            owner,
            repo,
        });
        return data;
    } catch (error) {
        console.error("Error fetching repo info:", error);
        return null;
    }
};
