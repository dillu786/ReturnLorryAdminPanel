import { NextRequest, NextResponse } from 'next/server'
import { updateRideStatus } from '@/app/actions/ride-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rideId, status } = body

    if (!rideId) {
      return NextResponse.json(
        { error: 'Ride ID is required' },
        { status: 400 }
      )
    }

    if (!['COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be COMPLETED or CANCELLED' },
        { status: 400 }
      )
    }

    const result = await updateRideStatus(rideId, status as 'COMPLETED' | 'CANCELLED')

    if (result.success) {
      return NextResponse.json(
        { message: `Ride ${status === 'COMPLETED' ? 'completed' : 'cancelled'} successfully` },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error updating ride status:', error)
    return NextResponse.json(
      { error: 'Failed to update ride status' },
      { status: 500 }
    )
  }
} 