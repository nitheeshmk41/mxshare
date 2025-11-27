import GoogleProvider from "next-auth/providers/google";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * NextAuth configuration container. We build the config object here and
 * export a small helper. The actual NextAuth handler is required at runtime
 * to avoid a TypeScript mismatch with different next-auth type definitions
 * in some environments.
 */

type ExtendedToken = JWT & { email?: string | null; name?: string | null; picture?: string | null };

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],

  callbacks: {
    async signIn({ user }: { user?: User | null }): Promise<boolean | string> {
      const allowedDomain = process.env.ALLOWED_DOMAIN || "psgtech.ac.in";
      const domain = user?.email?.split("@")[1];
      if (domain !== allowedDomain) return false;
      return true;
    },

    async jwt({ token, user }: { token: ExtendedToken; user?: User | undefined }) {
      if (user) {
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: ExtendedToken }) {
      session.user = {
        ...(session.user ?? {}),
        email: token.email ?? undefined,
        name: token.name ?? undefined,
        image: token.picture ?? undefined
      };
      return session;
    }
  },

  pages: {
    signIn: "/login"
  },

  secret: process.env.NEXTAUTH_SECRET
};

export function createNextAuthHandler() {
  // require at runtime to avoid static type resolution issues during build
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const NextAuth = require("next-auth").default;
  return NextAuth(authConfig as any);
}
