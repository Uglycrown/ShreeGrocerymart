import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

// MSG91 SMS Service Integration
async function sendOTPViaMSG91(phoneNumber: string, otp: string) {
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID

  if (!authKey || !templateId) {
    console.log('MSG91 credentials not configured, using demo mode')
    return { success: true, message: 'Demo mode - OTP: ' + otp }
  }

  try {
    // MSG91 API v5 for OTP
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phoneNumber}&authkey=${authKey}&otp=${otp}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok && data.type === 'success') {
      return { success: true, message: 'OTP sent successfully' }
    } else {
      console.error('MSG91 Error:', data)
      return { success: false, message: data.message || 'Failed to send OTP' }
    }
  } catch (error) {
    console.error('Error sending OTP via MSG91:', error)
    return { success: false, message: 'Failed to send OTP' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber || phoneNumber.length !== 10) {
      return NextResponse.json(
        { message: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const db = await getDb()

    // Store OTP in database
    await db.collection('OTP').updateOne(
      { phoneNumber },
      {
        $set: {
          phoneNumber,
          otp,
          expiresAt,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Send OTP via MSG91
    const smsResult = await sendOTPViaMSG91(phoneNumber, otp)

    if (!smsResult.success) {
      return NextResponse.json(
        { message: smsResult.message },
        { status: 500 }
      )
    }

    console.log(`OTP sent to ${phoneNumber}: ${otp}`) // For development/demo

    return NextResponse.json({
      message: 'OTP sent successfully',
      // Return OTP only in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { demo_otp: otp }),
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json(
      { message: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
