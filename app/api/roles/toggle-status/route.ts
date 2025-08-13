import { NextRequest, NextResponse } from 'next/server'
import { toggleRoleStatus } from '@/app/actions/role-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roleId, isActive } = body

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      )
    }

    const result = await toggleRoleStatus(roleId, isActive, 'current-user-id')

    if (result.success) {
      return NextResponse.json(
        { message: `Role ${isActive ? 'activated' : 'deactivated'} successfully` },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error toggling role status:', error)
    return NextResponse.json(
      { error: 'Failed to update role status' },
      { status: 500 }
    )
  }
} 