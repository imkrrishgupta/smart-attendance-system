import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          semester: user.semester,
          rollNumber: user.rollNumber
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.branch = (user as any).branch;
        token.semester = (user as any).semester;
        token.rollNumber = (user as any).rollNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).branch = token.branch as string;
        (session.user as any).semester = token.semester as string;
        (session.user as any).rollNumber = token.rollNumber as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
