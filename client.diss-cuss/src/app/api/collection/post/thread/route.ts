import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const MAX_SIZE = 5 * 1024 * 1024; //5mb

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const reader = req.body?.getReader();
    let totalSize = 0;
    let chunks: Uint8Array[] = [];

    if (!reader) {
      return NextResponse.json({ message: "No body found" }, { status: 400 });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_SIZE) {
        return NextResponse.json(
          { message: "Payload too large" },
          { status: 413 }
        );
      }

      chunks.push(value);
    }

    const fullBody = Buffer.concat(chunks);
    const { content, discussion_id } = JSON.parse(fullBody.toString()) as {
      content: string;
      discussion_id: string;
    };

    const thread = await prisma.thread.create({
      data: {
        discussion_id,
        user_id: session.user.id,
        content,
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
        likes: {
          where: {
            user_id: session.user.id,
          },
          select: {
            liked: true,
          },
        },
      },
    });

    if (thread) {
      return NextResponse.json({
        message: "Thread Posted Successfully",
        data: thread,
      });
    }
    return NextResponse.json(
      { message: "Coudln't post thread!!" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 413 }
    );
  }
}
