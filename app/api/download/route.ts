import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const signedUrl = searchParams.get('key')
    const fileName = searchParams.get('name')

    if (!signedUrl) {
      return new NextResponse("URL is required", { status: 400 })
    }

    // Fetch the file directly from the signed URL
    const response = await fetch(signedUrl)
    if (!response.ok) {
      throw new Error("Failed to fetch file")
    }

    // Get the file content
    const fileBuffer = await response.arrayBuffer()

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${fileName || 'download'}"`)

    return new NextResponse(fileBuffer, {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error("[DOWNLOAD_ERROR]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 