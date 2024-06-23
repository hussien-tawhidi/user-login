import NextAuth from "next-auth";
import google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "./model/UserModel";
import initDB from "./libs/db";
import bcrypt from "bcryptjs";

initDB();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Sign in with Email",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        // login
        const { email, password } = credentials;
        const user = await UserModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        const isCorrectPassword = bcrypt.compare(
          // @ts-ignore
          password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }
        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.id = user._id.toString(); // Convert ObjectID to string
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        // @ts-ignore
        session.user = { id: token.id, name: token.name, email: token.email };
      }
      return session;
    },
  },
});
