import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<any> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 0);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50
    );

    const user_id = session?.user.id || "";
    const threads = await prisma.thread.findMany({
      where: {
        discussion_id: id,
        isReply: false,
      },
      include: {
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
        _count: {
          select: {
            likes: {
              where: {
                liked: true,
              },
            },
          },
        },
        likes : {
          where : {
            user_id : user_id
          },
          select : {
            liked : true
          }
        }
      },
      orderBy: [
        {
          likes: {
            _count: "desc", // order by count of related likes descending
          },
        },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    const threadCount = await prisma.thread.count({
      where: {
        discussion_id: id,
        isReply : false
      },
    });

    const totalPages = Math.ceil(threadCount / limit);

    return NextResponse.json({
      data: threads,
      threadCount,
      totalPages,
      currentPage: page,
      message: "Threads fetched successfully",
    });
  } catch (error) {
    console.error("Error while fetching threads:", error);
    return NextResponse.json(
      { data: [], message: "Internal server error" },
      { status: 500 }
    );
  }
}
