import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    // Validate userId is a valid ObjectId format (24 hex characters)
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    })

    // Ensure backwards compatibility - provide default values for old addresses
    const transformedAddresses = addresses.map((addr) => ({
      ...addr,
      name: addr.name || '',
      phone: addr.phone || ''
    }))

    return NextResponse.json(transformedAddresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, label, name, phone, street, landmark, city, pincode, isDefault } = body

    if (!userId || !name || !phone || !street || !city || !pincode) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Validate userId is a valid ObjectId format (24 hex characters)
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 })
    }

    // If isDefault is true, unset other defaults
    if (isDefault) {
      // Find existing default addresses
      const defaultAddresses = await prisma.address.findMany({
        where: { userId, isDefault: true }
      })

      // Update them one by one to avoid transaction requirement of updateMany in some mongo configs
      for (const addr of defaultAddresses) {
        await prisma.address.update({
          where: { id: addr.id },
          data: { isDefault: false }
        })
      }
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: label || 'Home',
        name,
        phone,
        street,
        landmark: landmark || '',
        city,
        state: 'Delhi',
        pincode,
        isDefault: !!isDefault
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error('Error creating address:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 })
  }
}
