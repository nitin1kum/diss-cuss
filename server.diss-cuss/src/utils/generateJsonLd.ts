import { prisma } from "../lib/prisma";
import { handleError } from "./handleError";

export async function generateJsonLd(discussion_id: string) {
  try {
    const popularThreads = await prisma.thread.findMany({
      where: {
        discussion_id: discussion_id,
        isReply: false,
      },
      orderBy: { likes: { _count: "desc" } },
      skip: 1,
      take: 3,
      select: {
        id: true,
        content: true,
        user: { select: { username: true } },
        _count: { select: { likes: true } },
        discussion: {
          select: { name: true, imdb_id: true },
        },
      },
    });

    if (popularThreads.length !== 0) {
      const mainThread = popularThreads[0];
      const mainSnippet = mainThread.content;

      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          headline: `${mainThread.user.username}'s top post`,
          articleBody: mainSnippet,
          author: { "@type": "Person", name: mainThread.user.username },
          url: `${process.env.NEXTBASE_URL}/discussion/${mainThread.discussion.imdb_id}`,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: mainThread._count.likes,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "DiscussionForum",
          name: `${mainThread.discussion.name} – Popular Threads`,
          url: `${process.env.NEXTBASE_URL}/discussion/${mainThread.discussion.imdb_id}`,
          discussionForumPosting: popularThreads.map((t) => ({
            "@type": "DiscussionForumPosting",
            headline: `${t.user.username}'s thread snippet`,
            articleBody: t.content.slice(0, 80),
            author: { "@type": "Person", name: t.user.username },
            url: `${process.env.NEXTBASE_URL}/discussion/${mainThread.discussion.imdb_id}?thread=${t.id}`,
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: t._count.likes,
            },
          })),
        },
      ];
      return jsonLd;
    }

    return [];
  } catch (error) {
    handleError(error,"Error generating jsonLD - ")
    return [];
  }
}
