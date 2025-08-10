// Seed a temporary dev user for credentials login
// Usage: node scripts/seed-dev-user.js

const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

// Load env from .env.local (simple parser for KEY=VALUE pairs)
;(function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      content.split(/\r?\n/).forEach((line) => {
        if (!line || line.trim().startsWith('#')) return
        const idx = line.indexOf('=')
        if (idx === -1) return
        const key = line.slice(0, idx).trim()
        let val = line.slice(idx + 1).trim()
        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        if (!(key in process.env)) {
          process.env[key] = val
        }
      })
    }
  } catch (e) {
    console.warn('Warning: failed to parse .env.local:', e.message)
  }
})()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.env.DEV_USER_EMAIL || 'dev@example.com'
  const password = process.env.DEV_USER_PASSWORD || 'devpass123!'
  const username = process.env.DEV_USER_USERNAME || 'dev'
  const displayName = process.env.DEV_USER_DISPLAY_NAME || 'Developer'

  const passwordHash = await bcrypt.hash(password, 10)

  // Ensure unique username
  let finalUsername = username
  let counter = 1
  while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
    finalUsername = `${username}${counter}`
    counter++
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (!existing) {
    const user = await prisma.user.create({
      data: {
        email,
        username: finalUsername,
        displayName,
        passwordHash,
        emailVerified: new Date(),
        preferences: {
          create: {
            theme: 'system',
            language: 'en',
            timezone: 'UTC',
          },
        },
        subscription: {
          create: {
            plan: 'free',
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    })
    console.log('Created dev user:', { email: user.email, username: user.username })
    console.log('Use these credentials to sign in:')
    console.log('Email:', email)
    console.log('Password:', password)
  } else {
    // Update password if user exists
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash },
    })
    console.log('Updated existing user password for:', email)
    console.log('Password:', password)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
