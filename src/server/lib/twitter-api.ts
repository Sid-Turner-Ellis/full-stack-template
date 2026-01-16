import axios, { type AxiosResponse } from "axios";

import { env } from "~/env";

const TWITTER_API_BASE_URL = "https://api.twitterapi.io";

type TwitterApiTweet = {
  id: string;
  createdAt: string;
  url?: string;
  twitterUrl?: string;
  likeCount: number;
  retweetCount: number;
  quoteCount: number;
  replyCount: number;
  viewCount: number;
  isReply: boolean;
} & Record<string, unknown>;

export type TwitterApiUserInfo = {
  id: string;
  name: string;
  userName: string;
  location: string;
  url: string | null;
  description: string;
  entities: Record<string, unknown>;
  protected: boolean;
  isVerified: boolean;
  isBlueVerified: boolean;
  verifiedType: string | null;
  followers: number;
  following: number;
  favouritesCount: number;
  statusesCount: number;
  mediaCount: number;
  createdAt: string;
  coverPicture: string | null;
  profilePicture: string | null;
  canDm: boolean;
  affiliatesHighlightedLabel: Record<string, unknown>;
  isAutomated: boolean;
  automatedBy: string | null;
  pinnedTweetIds: string[];
};

type TwitterApiTweetsResponse = {
  pin_tweet: Record<string, unknown> | null;
  tweets: TwitterApiTweet[];
  has_next_page: boolean;
  next_cursor: string | null;
};

export type TwitterApiTweetsPage = {
  cursor: string | null;
  data: TwitterApiTweetsResponse;
};

export type TwitterApiLatestTweetsResponse = TwitterApiTweetsResponse;

const createTwitterApiClient = () => {
  const client = axios.create({
    baseURL: TWITTER_API_BASE_URL,
    headers: {
      "X-API-Key": env.TWITTER_API_KEY,
    },
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const data = response.data as
        | ({
            status?: string;
            msg?: string;
            code?: number;
            data?: unknown;
          } & Record<string, unknown>)
        | undefined;

      if (data?.status && data.status !== "success") {
        throw new Error(data.msg || "Twitter API error");
      }

      if (data?.status) {
        const { status, msg, code, data: payload, ...rest } = data;

        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          return {
            ...response,
            data: { ...(payload as Record<string, unknown>), ...rest },
          };
        }

        return {
          ...response,
          data: payload ?? response.data,
        };
      }

      return {
        ...response,
        data: data?.data ?? response.data,
      };
    },
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { error?: number; message?: string }
          | undefined;

        if (data?.message) {
          return Promise.reject(
            new Error(
              data.error
                ? `Twitter API error ${data.error}: ${data.message}`
                : data.message,
            ),
          );
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

const getUserInfo = async (userName: string) => {
  const client = createTwitterApiClient();

  const { data } = await client.get<TwitterApiUserInfo>("/twitter/user/info", {
    params: { userName },
  });

  await new Promise((res, rej) => {
    setTimeout(() => {
      res(true);
    }, 2000);
  });

  return data;
};

const getLatestTweets = async ({
  twitterUserId,
  cursor,
}: {
  twitterUserId: string;
  cursor?: string | null;
}) => {
  // TODO: add rate limit / retry / backoff handling here
  const client = createTwitterApiClient();
  const params: Record<string, string> = { userId: twitterUserId };

  if (cursor && cursor.length > 0) {
    params.cursor = cursor;
  }

  const { data } = await client.get<TwitterApiTweetsResponse>(
    "/twitter/user/last_tweets",
    { params },
  );

  return data;
};

export const twitterApiService = {
  getUserInfo,
  getLatestTweets,
  createClient: createTwitterApiClient,
};
