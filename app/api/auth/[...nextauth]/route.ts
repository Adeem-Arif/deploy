import bcrypt from "bcryptjs";
import User from "@/models/user";
import { connectionToDatabase } from "@/lib/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import NextAuth, { AuthOptions } from "next-auth";

const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.Auth_Github_ID as string,
      clientSecret: process.env.Auth_Github_SECREt as string,
      authorization: { params: { scope: "read:user user:email" } },
    }),
    GoogleProvider({
      clientId: process.env.AUth_Google_ID as string,
      clientSecret: process.env.AUth_Google_SECRET as string,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials) {
        try {
          await connectionToDatabase();
          const user = await User.findOne({ email: credentials?.email });
          if (!user) throw new Error("No user found with this email");

          const isPasswordValid = await bcrypt.compare(
            credentials?.password ?? "",
            user.password as string
          );
          if (!isPasswordValid) throw new Error("Invalid password");

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.profileImage || null,
          };
        } catch (error) {
          console.error("❌ Credentials error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        await connectionToDatabase();
        const email = profile?.email;
        if (!email) return false;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          const newUser = new User({
            name: profile?.name,
            email: profile?.email,
            profileImage: profile?.image || null,
          });
          await newUser.save();
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      await connectionToDatabase();

      if (user) {
        // First login or credentials provider
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.image = dbUser.profileImage || null;
        }
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.image as string | null,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/authentication/signIn",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


