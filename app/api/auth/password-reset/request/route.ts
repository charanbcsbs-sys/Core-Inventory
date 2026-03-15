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
        console.log(`Sending OTP email to ${user.email}...`);
        const result = await sendEmailViaBrevo({
          to: { email: user.email, name: user.name },
          subject: emailContent.subject,
          htmlContent: emailContent.htmlContent,
          textContent: emailContent.textContent,
        });
        if (!result.success) {
          console.error("❌ Failed to send OTP email via Brevo:", result.error);
        } else {
          console.log("✅ OTP email sent successfully to", user.email);
        }
      } else {
        console.warn("⚠️ Brevo is not configured! OTP code for", email, "is:", otp);
        console.log("Check your .env for BREVO_API_KEY and BREVO_SENDER_EMAIL.");
      }
    } catch (emailErr) {
      console.error("Email send error (non-fatal):", emailErr);
    }

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
      // In development, we return the OTP to allow testing without email config
      ...(process.env.NODE_ENV === "development" && { _dev_otp: otp }),
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
