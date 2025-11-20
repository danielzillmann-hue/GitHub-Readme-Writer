import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID ?? "",
            clientSecret: process.env.GITHUB_SECRET ?? "",
            authorization: {
                params: {
                    scope: "read:user repo",
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
            if (session.user) {
                session.accessToken = token.accessToken;
            }
            return session;
        },
        async jwt({ token, account }: any) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
    },
};

export const handler = NextAuth(authOptions);
