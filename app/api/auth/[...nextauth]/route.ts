import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const domain = user.email?.split("@")[1];
      return domain === process.env.ALLOWED_DOMAIN;
    }
  }
});

export { handler as GET, handler as POST };
