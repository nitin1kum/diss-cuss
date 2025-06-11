export const threadTreeQuery = (
  depth: number
) => `WITH RECURSIVE thread_tree (
  id,
  content,
  html,
  parent_id,
  discussion_id,
  "createdAt",
  user_id,
  "isReply",
  username,
  image,
  like_count,
  replies_count,
  liked,
  depth
) AS (
  -- Level 1: the paginated top‐level IDs
  SELECT
    t.id,
    t.content,
    t.html,
    t.parent_id,
    t.discussion_id,
    t."createdAt",
    t.user_id,
    t."isReply",
    u.username,
    u.image,
    (
      SELECT COUNT(*) 
      FROM "Like" l 
      WHERE l.thread_id = t.id 
        AND l.liked = TRUE
    ) AS like_count,
    (
      SELECT COUNT(*) 
      FROM "Thread" r 
      WHERE r.parent_id = t.id
    ) AS replies_count,
    (
      SELECT l.liked
      FROM "Like" l
      WHERE l.thread_id = t.id
        AND l.user_id = $2
      LIMIT 1
    )::boolean AS liked,
    1 AS depth
  FROM "Thread" t
  JOIN "User" u 
    ON u.id = t.user_id
  WHERE t.id = ANY($1)

  UNION ALL

  -- Levels 2 & 3: fetch up to 3 children for each parent
  SELECT
    c.id,
    c.content,
    c.html,
    c.parent_id,
    c.discussion_id,
    c."createdAt",
    c.user_id,
    c."isReply",
    u2.username,
    u2.image,
    c.like_count,
    c.replies_count,
    (
      SELECT l.liked
      FROM "Like" l
      WHERE l.thread_id = c.id
        AND l.user_id = $2
      LIMIT 1
    )::boolean AS liked,
    p.depth + 1 AS depth
  FROM thread_tree p
  JOIN LATERAL (
    SELECT
      t2.id,
      t2.content,
      t2.html,
      t2.parent_id,
      t2.discussion_id,
      t2."createdAt",
      t2.user_id,
      t2."isReply",
      (
        SELECT COUNT(*) 
        FROM "Like" l 
        WHERE l.thread_id = t2.id 
          AND l.liked = TRUE
      ) AS like_count,
      (
        SELECT COUNT(*) 
        FROM "Thread" r 
        WHERE r.parent_id = t2.id
      ) AS replies_count
    FROM "Thread" t2
    WHERE t2.parent_id = p.id
    ORDER BY
      (CASE WHEN t2.user_id = $2 THEN 0 ELSE 1 END) ASC,
      (
        SELECT COUNT(*) 
        FROM "Like" l 
        WHERE l.thread_id = t2.id 
          AND l.liked = TRUE
      ) DESC,
      t2."createdAt" DESC
    LIMIT 3
  ) AS c ON TRUE
  JOIN "User" u2 
    ON u2.id = c.user_id
  WHERE p.depth < ${depth}
)
SELECT
  id,
  content,
  html,
  parent_id,
  discussion_id,
  "isReply",
  "createdAt",
  user_id,
  username,
  image,
  like_count,
  replies_count,
  liked,
  depth
FROM thread_tree
ORDER BY
  depth ASC,
  (CASE WHEN user_id = $2 THEN 0 ELSE 1 END) ASC,
  like_count DESC,
  "createdAt" DESC;
`;


export const topThreadQuery = `
SELECT t.id
      FROM "Thread" t
      WHERE t.discussion_id = $1
        AND t."isReply" = FALSE
      ORDER BY
        (CASE WHEN t.user_id = $2 THEN 1 ELSE 0 END) DESC,
        (
          SELECT COUNT(*) 
          FROM "Like" l 
          WHERE l.thread_id = t.id 
            AND l.liked = TRUE
        ) DESC,
        t."createdAt" DESC
      LIMIT $3
      OFFSET $4;
`;

export const topReplyQuery = `
SELECT t.id
      FROM "Thread" t
      WHERE t.parent_id = $1
      ORDER BY
        (CASE WHEN t.user_id = $2 THEN 1 ELSE 0 END) DESC,
        (
          SELECT COUNT(*) 
          FROM "Like" l 
          WHERE l.thread_id = t.id 
            AND l.liked = TRUE
        ) DESC,
        t."createdAt" DESC
      LIMIT $3
      OFFSET $4;
`;
