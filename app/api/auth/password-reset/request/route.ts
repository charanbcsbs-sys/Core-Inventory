import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found - security: avoid email enumeration
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP using Prisma
    // We don't use a transaction here, so it works on standalone MongoDB
    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email via Brevo
    try {
      const { generatePasswordResetEmail } = await import("@/lib/email/templates");
      const { sendEmailViaBrevo } = await import("@/lib/email/brevo");
      const { isBrevoConfigured } = await import("@/lib/email/brevo");

      if (isBrevoConfigured()) {
        const emailContent = generatePasswordResetEmail(otp);
        const result = await sendEmailViaBrevo({
          to: { email: user.email, name: user.name },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
        });
        if (!result.success) {
          console.error("Failed to send OTP email:", result.error);
        }
      } else {
        console.warn("Brevo is not configured. OTP code (for testing):", otp);
      }
    } catch (emailErr) {
      console.error("Email send error (non-fatal):", emailErr);
    }

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
