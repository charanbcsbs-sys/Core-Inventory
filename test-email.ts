import { sendEmailViaBrevo } from "./lib/email/brevo";

async function testEmail() {
  console.log("Testing Brevo email sending...");
  const result = await sendEmailViaBrevo({
    to: { email: "t6726137@gmail.com", name: "Test User" },
    subject: "Test Email from Stockly",
    htmlContent: "<h1>Success!</h1><p>This is a test email.</p>",
    textContent: "Success! This is a test email.",
  });

  if (result.success) {
    console.log("✅ Email sent successfully! MessageID:", result.messageId);
  } else {
    console.error("❌ Failed to send email:", result.error);
  }
}

testEmail();
