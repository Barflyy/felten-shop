import { NextResponse } from 'next/server';

// In-memory store for verification codes and rate limiting
// In production, use Redis or a database
const verificationCodes = new Map<string, { code: string; expires: number }>();
const rateLimits = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_MAX = 3; // Max 3 attempts per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  limit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - limit.count };
}

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const { email, action, code } = await request.json();

    // Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 1 heure.', rateLimited: true },
        { status: 429 }
      );
    }

    if (action === 'send') {
      // Generate and store verification code
      const verificationCode = generateCode();
      verificationCodes.set(email.toLowerCase(), {
        code: verificationCode,
        expires: Date.now() + CODE_EXPIRY,
      });

      // In production, send actual email via SendGrid, Resend, etc.
      // For now, we'll log it and return it in development
      console.log(`Verification code for ${email}: ${verificationCode}`);

      // Simulate email sending
      // In production, replace with actual email service
      const isDev = process.env.NODE_ENV === 'development';

      return NextResponse.json({
        success: true,
        message: 'Code de vérification envoyé',
        remaining: rateCheck.remaining,
        // Only include code in development for testing
        ...(isDev && { devCode: verificationCode }),
      });
    }

    if (action === 'verify') {
      const stored = verificationCodes.get(email.toLowerCase());

      if (!stored) {
        return NextResponse.json(
          { success: false, error: 'Aucun code envoyé pour cet email' },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expires) {
        verificationCodes.delete(email.toLowerCase());
        return NextResponse.json(
          { success: false, error: 'Code expiré. Demandez un nouveau code.' },
          { status: 400 }
        );
      }

      if (stored.code !== code) {
        return NextResponse.json(
          { success: false, error: 'Code incorrect' },
          { status: 400 }
        );
      }

      // Code is valid - clean up
      verificationCodes.delete(email.toLowerCase());

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Email vérifié avec succès',
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
