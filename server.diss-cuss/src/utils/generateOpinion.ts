import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function generateMovieComments(
  movieTitle: string,
  movieOverview: string
): Promise<string[]> {
  const prompt = `
You're in a movie discussion forum. The movie is titled "${movieTitle}".
Its description is: "${movieOverview}".

Write 10 *different*, realistic user comments:
- Each comment must sound like a real person (Reddit/Twitter-style)
- Must refer to something in the movie (plot, characters, themes, emotions)
- Should vary in tone (funny, critical, emotional, sarcastic, deep, casual)
- Keep each comment 1–2 sentences
- Avoid generic takes ("good movie", "boring", etc.)
- Output a plain JSON array of 10 unique string comments.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a sarcastic, insightful movie nerd who hangs out on Reddit and writes spicy but smart takes.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.9,
    max_tokens: 600,
  });

  const content = response.choices[0]?.message?.content?.trim();
  try {
    const comments = JSON.parse(content || "");
    if (!Array.isArray(comments) || comments.length !== 10)
      throw new Error("Not a valid 10-item array.");
    return comments;
  } catch (err) {
    console.error("Groq response parse error:", content);
    throw new Error("Failed to parse Groq output as a JSON array of comments.");
  }
}
