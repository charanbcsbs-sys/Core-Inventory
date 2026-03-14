import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Find latest valid OTP for this email
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    try {
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      });
    } catch (updateErr) {
      console.error("User update error:", updateErr);
      return NextResponse.json(
        { error: "Failed to update password. User might not exist." },
        { status: 404 }
      );
    }

    // Delete all OTPs for this email to prevent reuse
    await prisma.passwordReset.deleteMany({
      where: { email }
    });

    return NextResponse.json({
      message: "Password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("Password reset verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
