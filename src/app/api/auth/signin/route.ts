import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create a simple session token (in production, use JWT)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
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
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}