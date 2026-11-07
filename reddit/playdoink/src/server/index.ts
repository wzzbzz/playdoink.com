import express from "express";
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
} from "../shared/types/api";
import {
  createServer,
  context,
  getServerPort,
  reddit,
  redis,
} from "@devvit/web/server";
import { createPost } from "./core/post";

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get< 
  { postId: string },
  InitResponse | { status: string; message: string }
>("/api/init", async (_req, res): Promise<void> => {
  const { postId } = context;

  if (!postId) {
    console.error("API Init Error: postId not found in devvit context");
    res.status(400).json({
      status: "error",
      message: "postId is required but missing from context",
    });
    return;
  }

  try {
    const [username, highestStreak] = await Promise.all([
      reddit.getCurrentUsername(),
      redis.get(`user:${postId}:highest_streak`)
    ]);

    res.json({
      type: "init",
      postId: postId,
      username: username ?? "anonymous",
      highest_streak: highestStreak ? parseInt(highestStreak) : 0
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = "Unknown error during initialization";
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    res.status(400).json({ status: "error", message: errorMessage });
  }
});

router.post<
  { postId: string },
  IncrementResponse | { status: string; message: string },
  unknown
>("/api/increment", async (_req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: "error",
      message: "postId is required",
    });
    return;
  }

  res.json({
    count: await redis.incrBy("count", 1),
    postId,
    type: "increment",
  });
});

router.post<
  { postId: string },
  DecrementResponse | { status: string; message: string },
  unknown
>("/api/decrement", async (_req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: "error",
      message: "postId is required",
    });
    return;
  }

  res.json({
    count: await redis.incrBy("count", -1),
    postId,
    type: "decrement",
  });
});

router.post<
  { postId: string },
  { status: string; message: string; score?: number },
  { score: number }
>("/api/save-score", async (req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: "error",
      message: "postId is required",
    });
    return;
  }

  const { score } = req.body;
  if (typeof score !== 'number') {
    res.status(400).json({
      status: "error",
      message: "score must be a number",
    });
    return;
  }

  try {
    const username = await reddit.getCurrentUsername();
    const userId = username ?? "anonymous";
    
    // Save the user's score
    await redis.set(`user:${postId}:${userId}:score`, score.toString());
    
    // Add to leaderboard sorted set (score as the sort value)
    await redis.zAdd(`leaderboard:${postId}`, { member: userId, score: score });
    
    // Update highest streak if this score is higher
    const currentHighest = await redis.get(`user:${postId}:highest_streak`);
    const highestValue = currentHighest ? parseInt(currentHighest) : 0;
    
    if (score > highestValue) {
      await redis.set(`user:${postId}:highest_streak`, score.toString());
    }

    res.json({
      status: "success",
      message: "Score saved successfully",
      score: score,
    });
  } catch (error) {
    console.error(`Error saving score for post ${postId}:`, error);
    res.status(500).json({
      status: "error",
      message: "Failed to save score",
    });
  }
});

router.get<
  { postId: string },
  { status: string; leaderboard?: any[]; message?: string }
>("/api/leaderboard", async (req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: "error",
      message: "postId is required",
    });
    return;
  }

  try {
    // Get top 10 scores from the sorted set (descending order)
    const topScores = await redis.zRange(`leaderboard:${postId}`, 0, 9, { 
      reverse: true, 
      by: 'score' 
    });
    
    const currentUsername = await reddit.getCurrentUsername();
    const currentUserId = currentUsername ?? "anonymous";
    
    // Get current user's rank and score
    const currentUserScore = await redis.zScore(`leaderboard:${postId}`, currentUserId);
    const currentUserRank = currentUserScore 
      ? await redis.zRank(`leaderboard:${postId}`, currentUserId, { reverse: true })
      : null;

    // Format leaderboard
    const leaderboard = topScores.map((entry, index) => ({
      rank: index + 1,
      username: entry.member,
      score: entry.score,
      isCurrentUser: entry.member === currentUserId,
    }));

    // Add current user if not in top 10
    if (currentUserRank !== null && currentUserRank >= 10) {
      leaderboard.push({
        rank: currentUserRank + 1,
        username: currentUserId,
        score: currentUserScore!,
        isCurrentUser: true,
      });
    }

    res.json({
      status: "success",
      leaderboard: leaderboard,
    });
  } catch (error) {
    console.error(`Error fetching leaderboard:`, error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch leaderboard",
    });
  }
});

router.get<
  { postId: string },
  { status: string; data?: any; message?: string }
>("/api/debug/redis-keys", async (req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: "error",
      message: "postId is required",
    });
    return;
  }

  try {
    const pattern = req.query.pattern as string || `user:${postId}:*`;
    
    // Get some sample keys (Redis doesn't have a native "list all keys" that's safe in production)
    // So we'll just try to get common patterns
    const username = await reddit.getCurrentUsername();
    const userId = username ?? "anonymous";
    
    const debugData = {
      currentUser: userId,
      userScore: await redis.get(`user:${postId}:${userId}:score`),
      highestStreak: await redis.get(`user:${postId}:highest_streak`),
      count: await redis.get("count"),
      pattern: pattern,
    };

    res.json({
      status: "success",
      data: debugData,
    });
  } catch (error) {
    console.error(`Error fetching Redis data:`, error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Redis data",
    });
  }
});

router.post("/internal/on-app-install", async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: "success",
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: "error",
      message: "Failed to create post",
    });
  }
});

router.post("/internal/menu/post-create", async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: "error",
      message: "Failed to create post",
    });
  }
});

app.use(router);

const server = createServer(app);
server.on("error", (err) => console.error(`server error; ${err.stack}`));
server.listen(getServerPort());
