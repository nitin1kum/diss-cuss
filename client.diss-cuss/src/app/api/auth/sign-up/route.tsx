import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; 
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod'

const schema = z.object({
  username : z.string().min(3,{message : "Username should have length more than 3"}),
  email : z.string().email("Invalid email address"),
  password : z.string().min(8, "Password must be at least 8 characters"),
})

// WIP : add email verification system

// const mailTransport = nodemailer.createTransport({
//   service : "gmail",
//   auth : {
//     auth: {
//       user: process.env.GMAIL_USER, // Your Gmail address
//       pass: process.env.GMAIL_APP_PASSWORD, // App-specific password
//     },
//   }
// })

export async function POST(req:NextRequest) {
  try {
    const {username,email,password} =schema.parse( await req.json());

    const user = await prisma.user.findUnique({
      where : {
        email
      }
    })

    if(user){
      return NextResponse.json({message : "Email already registered"},{status : 400})
    }

    const hashedPwd = await bcrypt.hash(password,16);

    const newUser = await prisma.user.create({
      data : {
        username,
        email,
        password : hashedPwd
      }
    })

    if(newUser){

      return NextResponse.json({message : "User created successfully"},{status : 201})
    }

    return NextResponse.json({message : "Oops! Some unknown error occurred"},{status : 400})
  } catch (error) {
    console.log("error while signing up - ",error);
    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors.map((e) => ({ field: e.path[0], message: e.message })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json({message : "Internal Server Error"},{status : 500});
  }
}