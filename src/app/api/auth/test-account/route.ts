import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER'
      }
    })

    // Create a simple session token (in production, use JWT)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    const response = NextResponse.json({
      message: 'Test account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      sessionToken
    })

    // Set session token in HTTP-only cookie
    response.cookies.set('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Error creating test account:', error)
    return NextResponse.json(
      { error: 'Failed to create test account' },
      { status: 500 }
    )
  }
}