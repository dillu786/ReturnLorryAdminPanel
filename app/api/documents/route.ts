import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma/prisma";
import { getObjectSignedUrl } from "@/app/actions/s3-actions";

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get('Id');
    const url = await getObjectSignedUrl(imageId as string);
    return NextResponse.json(url);
    // Fetch both driver and owner documents 
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}