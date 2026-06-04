import dbConnect from "@/lib/db/mongoose"
import { NextResponse } from "next/server"
import User from "@/lib/models/userSchema"


export async function POST(request: Request) {
  const { name, email, password, confirmPassword } = await request.json();


  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { message: " All fields are required" },
      { status: 400 }
    );
  }


  if (confirmPassword !== password) {
    return NextResponse.json(
      { message: "Password do not match" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { message: "Password must be at least 6 character long" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exist" },
        { status: 400 }
      );
    }

    const newUser = new User({
      email,
      name,
      password: password
    });
    await newUser.save();
    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}