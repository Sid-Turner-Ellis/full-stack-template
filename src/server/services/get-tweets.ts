import type { JsonObject } from "@prisma/client/runtime/library";

import { db } from "~/server/lib/db";
import {
  twitterApiService,
  type TwitterApiLatestTweetsResponse,
} from "~/server/lib/twitter-api";

const storeTweetsPage = async ({
  twitterUserId,
  cursor,
  responseData,
}: {
  twitterUserId: string;
  cursor: string;
  responseData: TwitterApiLatestTweetsResponse;
}) => {
  const fetchedAt = new Date();

  await db.latestTweetsQuery.upsert({
    where: {
      cursor_twitterUserId: {
        cursor,
        twitterUserId,
      },
    },
    create: {
      cursor,
      twitterUserId,
      fetchedAt,
      responseData: responseData as unknown as JsonObject,
    },
    update: {
      fetchedAt,
      responseData: responseData as unknown as JsonObject,
    },
  });

  for (const tweet of responseData.tweets) {
    await db.tweet.upsert({
      where: { tweetId: tweet.id },
      create: {
        twitterUserId,
        latestTweetsQueryCursor: cursor,
        tweetId: tweet.id,
        tweetUrl: tweet.url ?? tweet.twitterUrl ?? null,
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        quoteCount: tweet.quoteCount,
        replyCount: tweet.replyCount,
        viewCount: tweet.viewCount,
        tweetCreatedAt: new Date(tweet.createdAt),
      },
      update: {
        latestTweetsQueryCursor: cursor,
        tweetUrl: tweet.url ?? tweet.twitterUrl ?? null,
        likeCount: tweet.likeCount,
        retweetCount: tweet.retweetCount,
        quoteCount: tweet.quoteCount,
        replyCount: tweet.replyCount,
        viewCount: tweet.viewCount,
        tweetCreatedAt: new Date(tweet.createdAt),
      },
    });
  }
};

const getCachedTweetsPage = async ({
  twitterUserId,
  cursor,
}: {
  twitterUserId: string;
  cursor: string;
}) => {
  const existing = await db.latestTweetsQuery.findUnique({
    where: {
      cursor_twitterUserId: {
        cursor,
        twitterUserId,
      },
    },
    select: {
      responseData: true,
    },
  });

  if (!existing) {
    return null;
  }

  return existing.responseData as unknown as TwitterApiLatestTweetsResponse;
};

export const getTweets = async ({
  twitterUserId,
  limit,
  from,
}: {
  twitterUserId: string;
  limit?: number;
  from?: Date;
}) => {
  const twitterUser = await db.twitterUser.findUnique({
    where: { id: twitterUserId },
    select: { id: true, externalUserId: true },
  });

  if (!twitterUser) {
    throw new Error(`Twitter user not found for id ${twitterUserId}`);
  }

  const tweets: TwitterApiLatestTweetsResponse["tweets"] = [];

  let cursor: string | null = null;
  let hasNextPage = true;
  let oldestTweetCreatedAt: number | null = null;

  while (true) {
    let cached: TwitterApiLatestTweetsResponse | null = null;
    if (cursor !== null && cursor.length > 0) {
      const cursorValue: string = cursor;
      cached = await getCachedTweetsPage({
        twitterUserId: twitterUser.id,
        cursor: cursorValue,
      });
    }

    const pageData: TwitterApiLatestTweetsResponse = cached
      ? cached
      : await twitterApiService.getLatestTweets({
          twitterUserId: twitterUser.externalUserId,
          cursor: cursor !== null && cursor.length > 0 ? cursor : undefined,
        });

    if (!cached && cursor !== null && cursor.length > 0) {
      const cursorValue: string = cursor;
      await storeTweetsPage({
        twitterUserId: twitterUser.id,
        cursor: cursorValue,
        responseData: pageData,
      });
    }

    tweets.push(...pageData.tweets);

    for (const tweet of pageData.tweets) {
      const createdAt = new Date(tweet.createdAt).getTime();
      if (Number.isNaN(createdAt)) continue;
      oldestTweetCreatedAt =
        oldestTweetCreatedAt === null
          ? createdAt
          : Math.min(oldestTweetCreatedAt, createdAt);
    }

    if (typeof limit === "number" && limit > 0 && tweets.length >= limit) {
      break;
    }

    if (
      from instanceof Date &&
      oldestTweetCreatedAt !== null &&
      oldestTweetCreatedAt < from.getTime()
    ) {
      break;
    }

    hasNextPage = pageData.has_next_page;
    cursor = pageData.next_cursor;

    if (!hasNextPage || !cursor || cursor.length === 0) {
      break;
    }
  }

  const filteredTweets =
    from instanceof Date
      ? tweets.filter(
          (tweet) => new Date(tweet.createdAt).getTime() >= from.getTime(),
        )
      : tweets;

  const sortedTweets = filteredTweets
    .slice()
    .sort(
      (
        a: TwitterApiLatestTweetsResponse["tweets"][number],
        b: TwitterApiLatestTweetsResponse["tweets"][number],
      ) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const limitedTweets =
    typeof limit === "number" && limit > 0
      ? sortedTweets.slice(0, limit)
      : sortedTweets;

  return { tweets: limitedTweets };
};
