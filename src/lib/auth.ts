import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Email/Password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            subscription: true,
          }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last active timestamp
        await db.user.update({
          where: { id: user.id },
          data: { lastActiveAt: new Date() }
        })

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
          isEnterprise: user.isEnterprise,
          plan: user.subscription?.plan || 'free',
        }
      }
    }),

    // OAuth providers
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID'] || '',
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
    }),

    GitHubProvider({
      clientId: process.env['GITHUB_CLIENT_ID'] || '',
      clientSecret: process.env['GITHUB_CLIENT_SECRET'] || '',
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
        token.username = user.username
        token.isPremium = user.isPremium
        token.isEnterprise = user.isEnterprise
        token.plan = user.plan
      }

      // Return previous token if the access token has not expired yet
      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      session.user.id = token.userId as string
      session.user.username = token.username as string
      session.user.isPremium = token.isPremium as boolean
      session.user.isEnterprise = token.isEnterprise as boolean
      session.user.plan = token.plan as string
      session.accessToken = token.accessToken as string

      return session
    },

    async signIn({ user, account, profile, email, credentials }) {
      // Handle OAuth sign-ins
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          // Check if user already exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Generate unique username from email or provider profile
            let username = user.email!.split('@')[0] || 'user'
            if (account.provider === 'github' && (profile as any)?.login) {
              username = (profile as any).login as string
            }

            // Ensure username is unique
            let finalUsername: string = username
            let counter = 1
            while (await db.user.findUnique({ where: { username: finalUsername } })) {
              finalUsername = `${username}${counter}`
              counter++
            }

            // Create user with OAuth data
            await db.user.create({
              data: {
                email: user.email!,
                username: finalUsername,
                displayName: user.name || finalUsername,
                avatar: user.image,
                emailVerified: new Date(), // OAuth emails are pre-verified
                preferences: {
                  create: {
                    theme: 'system',
                    language: 'en',
                    timezone: 'UTC',
                  }
                },
                subscription: {
                  create: {
                    plan: 'free',
                    status: 'active',
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  }
                }
              }
            })
          } else {
            // Update last active and avatar if changed
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                lastActiveAt: new Date(),
                avatar: user.image || existingUser.avatar,
              }
            })
          }
        } catch (error) {
          console.error('Error handling OAuth sign-in:', error)
          return false
        }
      }

      return true
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding'
  },

  events: {
    async signOut(message) {
      // Log user sign out
      console.log('User signed out:', message)
    },
    async session(message) {
      // Update user's last active timestamp on each session check
      if (message.session?.user?.id) {
        await db.user.update({
          where: { id: message.session.user.id },
          data: { lastActiveAt: new Date() }
        }).catch(console.error) // Don't fail session if this fails
      }
    },
  },

  debug: process.env['NODE_ENV'] === 'development',
}

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    username?: string
    isPremium?: boolean
    isEnterprise?: boolean
    plan?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      name?: string
      image?: string
      isPremium: boolean
      isEnterprise: boolean
      plan: string
    }
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    username?: string
    isPremium?: boolean
    isEnterprise?: boolean
    plan?: string
    accessToken?: string
  }
}