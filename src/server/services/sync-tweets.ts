import type { JsonObject } from "@prisma/client/runtime/library";

import { db } from "~/server/lib/db";
import { twitterApiService } from "~/server/lib/twitter-api";

export const syncTweets = async (id: string) => {
  const twitterUserId = id;

  if (!twitterUserId) {
    return { tweetCount: 0, storedCount: 0 };
  }

  const twitterUser = await db.twitterUser.findUnique({
    where: { id: twitterUserId },
    select: { id: true, twitterUserId: true },
  });

  if (!twitterUser) {
    throw new Error(`Twitter user not found for id ${twitterUserId}`);
  }

  const latestStoredTweet = await db.tweet.findFirst({
    where: { twitterUserId: twitterUser.id },
    select: { tweetCreatedAt: true },
    orderBy: { tweetCreatedAt: "desc" },
  });

  const ignoreBefore = latestStoredTweet
    ? new Date(latestStoredTweet.tweetCreatedAt.getTime() - 60 * 60 * 1000)
    : undefined;

  console.info("sync-tweets.ignore-before", {
    twitterUserId: twitterUser.twitterUserId,
    latestStoredTweet: latestStoredTweet?.tweetCreatedAt.toISOString(),
    ignoreBefore: ignoreBefore?.toISOString(),
  });

  const { tweets } = await twitterApiService.getTweetsForUser({
    twitterUserId: twitterUser.twitterUserId,
    includeReplies: false,
    maxItems: 100,
    ignoreBefore,
  });

  const tweetRecords = tweets.map((tweet) => ({
    twitterUserId: twitterUser.id,
    tweetId: tweet.id,
    tweetUrl: tweet.url ?? tweet.twitterUrl ?? null,
    tweetData: tweet as JsonObject,
    likeCount: tweet.likeCount,
    retweetCount: tweet.retweetCount,
    quoteCount: tweet.quoteCount,
    replyCount: tweet.replyCount,
    viewCount: tweet.viewCount,
    tweetCreatedAt: new Date(tweet.createdAt),
  }));

  let storedCount = 0;

  for (const tweet of tweetRecords) {
    await db.tweet.upsert({
      where: { tweetId: tweet.tweetId },
      create: tweet,
      update: {
        tweetData: tweet.tweetData,
        tweetUrl: tweet.tweetUrl,
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        quoteCount: tweet.quoteCount,
        replyCount: tweet.replyCount,
        viewCount: tweet.viewCount,
        tweetCreatedAt: tweet.tweetCreatedAt,
      },
    });
    storedCount += 1;
  }

  return {
    twitterUserId: twitterUser.twitterUserId,
    tweetCount: tweets.length,
    storedCount,
  };
};
