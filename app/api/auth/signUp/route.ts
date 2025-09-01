import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/user";
import { connectionToDatabase } from "@/lib/mongodb";
import { Resend } from "resend";
import BlogOtpEmail from "@/app/pages/OTP/page"; // ⚠️ adjust path to your email component

// simple email validator
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1️⃣ Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields required" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password too short" }, { status: 400 });
    }

    // 2️⃣ Connect DB
    await connectionToDatabase();

    // 3️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // 4️⃣ Hash password + generate OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 5️⃣ Create & save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      OTP: otp,
      
    });
    await newUser.save();
    console.log("✅ User created:", newUser.email);

    // 6️⃣ Send OTP email using Resend
    const resend = new Resend(process.env.Resend_Email_API); // ⚠️ must match your .env key
    const { error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'delivered@resend.dev',   // use a test address
      subject: 'My Blog - Your OTP Code',
      react: BlogOtpEmail({ validationCode: otp }),
    });

    if (error) {
      console.error("❌ Email send error:", error);
      return NextResponse.json(
        { message: "User created but OTP email failed" },
        { status: 500 }
      );
    }

    // 7️⃣ Success
    return NextResponse.json(
      { message: "User created. OTP sent to email." },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Signup Error:", err.message || err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
