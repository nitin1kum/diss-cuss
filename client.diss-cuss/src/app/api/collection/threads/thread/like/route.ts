import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "User not authorized" },
        { status: 401 }
      );
    }

    const { liked, thread_id } = await req.json();

    if (liked === 0) {
      const like = await prisma.like.deleteMany({
        where: {
          user_id: session.user.id,
          thread_id: thread_id,
        },
      });

      if (like) {
        return NextResponse.json({ message: "Like removed successfully" });
      }
    } else {
      const like = await prisma.like.findFirst({
        where: {
          user_id: session.user.id,
          thread_id: thread_id,
        },
      });

      if (like) {
        const updatedLike = await prisma.like.update({
          where: {
            id: like.id,
          },
          data: {
            liked: liked === 1,
          },
        });

        if (updatedLike) {
          return NextResponse.json({ message: "Like updated successfully" });
        }
        return NextResponse.json(
          { message: "Error updating like" },
          { status: 400 }
        );
      }

      const newLike = await prisma.like.create({
        data: {
          liked: liked === 1,
          user_id: session.user.id,
          thread_id: thread_id,
        },
      });

      if (newLike) {
        return NextResponse.json({ message: "Like updated successfully" });
      }
    }

    return NextResponse.json(
      { message: "Unknown error occurred" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
