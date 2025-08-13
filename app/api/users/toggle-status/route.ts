import { NextRequest, NextResponse } from 'next/server'
import { toggleUserStatus } from '@/app/actions/user-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!['activate', 'deactivate', 'block'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be activate, deactivate, or block' },
        { status: 400 }
      )
    }

    const result = await toggleUserStatus(userId, action as 'activate' | 'deactivate' | 'block')

    if (result.success) {
      return NextResponse.json(
        { message: `User ${action === 'activate' ? 'activated' : action === 'deactivate' ? 'deactivated' : 'blocked'} successfully` },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
} 