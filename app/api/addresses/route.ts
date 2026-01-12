import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, label, street, landmark, city, pincode, isDefault } = body

    if (!userId || !street || !city || !pincode) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // If isDefault is true, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || 'Home',
        street,
        landmark,
        city,
        pincode,
        isDefault: !!isDefault
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error creating address:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
