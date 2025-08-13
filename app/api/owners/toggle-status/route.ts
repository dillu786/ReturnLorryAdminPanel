import { NextRequest, NextResponse } from 'next/server'
import { toggleOwnerStatus } from '@/app/actions/owner-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerId, isActive } = body

    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required' },
        { status: 400 }
      )
    }

    const result = await toggleOwnerStatus(ownerId, isActive)

    if (result.success) {
      return NextResponse.json(
        { message: `Owner ${isActive ? 'activated' : 'deactivated'} successfully` },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error toggling owner status:', error)
    return NextResponse.json(
      { error: 'Failed to update owner status' },
      { status: 500 }
    )
  }
} 