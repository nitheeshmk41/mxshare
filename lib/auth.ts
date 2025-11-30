import GoogleProvider from "next-auth/providers/google";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import db from "@/lib/db";
import Admins from "@/lib/models/Admins";
import Users from "@/lib/models/User";

/**
 * NextAuth configuration - Google OAuth + Admin Credentials
 */

type ExtendedToken = JWT & { email?: string | null; name?: string | null; picture?: string | null; role?: string };

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],

  callbacks: {
    async signIn({ user }: { user?: User | null }): Promise<boolean | string> {
      // Check domain for Google OAuth
      const allowedDomain = process.env.ALLOWED_DOMAIN || "psgtech.ac.in";
      const domain = user?.email?.split("@")[1];
      if (domain !== allowedDomain) return false;

      // Sync User to DB & Check Block Status
      try {
        await db();
        const email = user?.email;
        if (email) {
          let dbUser = await Users.findOne({ email });
          
          if (!dbUser) {
            // Create new user
            dbUser = await Users.create({
              email,
              name: user?.name,
              image: user?.image,
            });
          } else {
            // Check if blocked
            if (dbUser.blockedUntil && new Date(dbUser.blockedUntil) > new Date()) {
              // Return false to deny login, or a string URL to redirect to a "blocked" page
              // For now, we'll just return false which shows a generic error
              return false; 
            }
            
            // Update info
            dbUser.name = user?.name;
            dbUser.image = user?.image;
            await dbUser.save();
          }
        }
      } catch (err) {
        console.error("Error syncing user:", err);
        // Allow login even if DB sync fails? Maybe not safe if we want to enforce blocks.
        // But for now, let's allow it to avoid locking everyone out on DB error.
      }

      return true;
    },

    async jwt({ token, user }: { token: ExtendedToken; user?: User | undefined }) {
      if (user) {
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
        
        // Check admin status for Google login
        try {
          await db();
          const email = user.email;
          const admin = await Admins.findOne({ email });
          token.role = admin ? "admin" : "user";
        } catch (e) {
          token.role = "user";
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session & { user: { role?: string } }; token: ExtendedToken }) {
      session.user = {
        ...(session.user ?? {}),
        email: token.email ?? undefined,
        name: token.name ?? undefined,
        image: token.picture ?? undefined,
        role: token.role ?? "user"
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
