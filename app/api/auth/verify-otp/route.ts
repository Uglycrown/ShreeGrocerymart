import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const otpRecord = await db.collection('OTP').findOne({ phoneNumber })

    if (!otpRecord) {
      return NextResponse.json(
        { message: 'OTP not found. Please request a new one.' },
        { status: 400 }
      )
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    let user = await db.collection('User').findOne({ phoneNumber })

    if (!user) {
      const newUser = {
        _id: new ObjectId(),
        phoneNumber,
        name: '',
        email: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection('User').insertOne(newUser)
      user = newUser
    }

    await db.collection('OTP').deleteOne({ phoneNumber })

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json(
      { message: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
