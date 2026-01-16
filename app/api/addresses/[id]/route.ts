import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET a single address by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
            return NextResponse.json({ message: 'Invalid address ID' }, { status: 400 })
        }

        const address = await prisma.address.findUnique({
            where: { id }
        })

        if (!address) {
            return NextResponse.json({ message: 'Address not found' }, { status: 404 })
        }

        return NextResponse.json(address)
    } catch (error) {
        console.error('Error fetching address:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 })
    }
}

// UPDATE an address
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
            return NextResponse.json({ message: 'Invalid address ID' }, { status: 400 })
        }

        const { label, name, phone, street, landmark, city, pincode, isDefault } = body

        if (!name || !phone || !street || !city || !pincode) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Get the existing address to check the userId
        const existingAddress = await prisma.address.findUnique({
            where: { id }
        })

        if (!existingAddress) {
            return NextResponse.json({ message: 'Address not found' }, { status: 404 })
        }

        // If isDefault is true, unset other defaults for this user
        if (isDefault && !existingAddress.isDefault) {
            const defaultAddresses = await prisma.address.findMany({
                where: { userId: existingAddress.userId, isDefault: true }
            })

            for (const addr of defaultAddresses) {
                await prisma.address.update({
                    where: { id: addr.id },
                    data: { isDefault: false }
                })
            }
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                label: label || 'Home',
                name,
                phone,
                street,
                landmark: landmark || '',
                city,
                pincode,
                isDefault: !!isDefault
            }
        })

        return NextResponse.json(updatedAddress)
    } catch (error) {
        console.error('Error updating address:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 })
    }
}

// DELETE an address
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
            return NextResponse.json({ message: 'Invalid address ID' }, { status: 400 })
        }

        // Check if address exists
        const existingAddress = await prisma.address.findUnique({
            where: { id }
        })

        if (!existingAddress) {
            return NextResponse.json({ message: 'Address not found' }, { status: 404 })
        }

        await prisma.address.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Address deleted successfully' })
    } catch (error) {
        console.error('Error deleting address:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 })
    }
}
