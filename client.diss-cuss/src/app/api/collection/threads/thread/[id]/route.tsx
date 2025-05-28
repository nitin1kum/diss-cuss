import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user_id = session?.user.id || "";
    const thread = await prisma.thread.findMany({
      where: {
        parent_id: id,
        isReply: true,
      },
      include: {
        _count: {
          select: {
            likes: {
              where: {
                liked: true,
              },
            },
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        likes : {
          where : {
            user_id
          },
          select : {
            liked : true
          }
        }
      },
    });

    return NextResponse.json({
      thread,
      message: "Thread fetched successfully",
    });
  } catch (error) {
    console.error("Error while fetching thread :", error);
    return NextResponse.json(
      { data: [], message: "Internal server error" },
      { status: 500 }
    );
  }
}
