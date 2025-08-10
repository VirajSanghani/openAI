import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { asyncHandler, success, error, NotFoundError } from '@/lib/api'
import { requireAuth } from '@/lib/auth-middleware'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/apps/[id]/like - Toggle like on app
export const POST = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request)
  const { id } = params
  
  const where = id.length === 25 ? { id } : { slug: id }
  
  // Check if app exists
  const app = await db.app.findUnique({
    where,
    select: { id: true, name: true }
  })
  
  if (!app) {
    throw new NotFoundError('App not found')
  }
  
  // Check if user already liked this app
  const existingLike = await db.appLike.findUnique({
    where: {
      userId_appId: {
        userId: user.id,
        appId: app.id
      }
    }
  })
  
  if (existingLike) {
    // Unlike - remove like
    await db.appLike.delete({
      where: { id: existingLike.id }
    })
    
    // Decrement like count
    await db.app.update({
      where: { id: app.id },
      data: { likes: { decrement: 1 } }
    })
    
    return success({
      liked: false,
      message: 'Like removed'
    })
    
  } else {
    // Like - add like
    await db.appLike.create({
      data: {
        userId: user.id,
        appId: app.id
      }
    })
    
    // Increment like count
    await db.app.update({
      where: { id: app.id },
      data: { likes: { increment: 1 } }
    })
    
    // Create notification for app owner (if not same user)
    const appWithOwner = await db.app.findUnique({
      where: { id: app.id },
      select: { ownerId: true }
    })
    
    if (appWithOwner && appWithOwner.ownerId !== user.id) {
      await db.notification.create({
        data: {
          userId: appWithOwner.ownerId,
          type: 'app_liked',
          title: 'Your app was liked!',
          message: `${user.displayName || user.username} liked your app "${app.name}"`,
          metadata: {
            appId: app.id,
            likedBy: user.id
          }
        }
      }).catch(console.error) // Ignore notification failures
    }
    
    return success({
      liked: true,
      message: 'App liked!'
    })
  }
})

// GET /api/apps/[id]/like - Check if user has liked this app
export const GET = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request)
  const { id } = params
  
  const where = id.length === 25 ? { id } : { slug: id }
  
  const app = await db.app.findUnique({
    where,
    select: { id: true }
  })
  
  if (!app) {
    throw new NotFoundError('App not found')
  }
  
  const like = await db.appLike.findUnique({
    where: {
      userId_appId: {
        userId: user.id,
        appId: app.id
      }
    }
  })
  
  return success({
    liked: !!like,
    likedAt: like?.createdAt || null
  })
})