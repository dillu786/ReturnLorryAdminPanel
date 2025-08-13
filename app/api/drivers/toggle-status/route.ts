import { NextRequest, NextResponse } from 'next/server'
import { toggleDriverStatus } from '@/app/actions/driver-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverId, isActive } = body

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      )
    }

    const result = await toggleDriverStatus(driverId, isActive)

    if (result.success) {
      return NextResponse.json(
        { message: `Driver ${isActive ? 'activated' : 'deactivated'} successfully` },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error toggling driver status:', error)
    return NextResponse.json(
      { error: 'Failed to update driver status' },
      { status: 500 }
    )
  }
} 