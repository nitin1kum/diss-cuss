import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { prisma } from "@/lib/prisma";

export async function GET(req : NextRequest,{params} : {params : {token : string}}) {
  try {
    const {token} = await params;
    const verify = jwt.verify(token,process.env.JWT_SECRET!) as {email : string};

    if(verify && verify.email){
      const verified = await prisma.user.update({
        where : {email : verify.email},
        data : {emailVerified : true}
      })

      return NextResponse.json("Email verified")
    }
    return NextResponse.json("Token not verified",{status : 400});
  } catch (error) {
    console.log("error verifying email - ",error);
    return NextResponse.json("Internal server error",{status : 500})
  }
}