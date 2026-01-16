import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const SEED_USER_EMAIL = "seed@example.com";
const SEED_TWITTER_ID = "tw_1001";
const SEED_TWITTER_HANDLE = "seedartist";
const SEED_TEZOS_ADDRESS = "tz1SeedWallet1111111111111111111111111";
const SEED_REPORT_PUBLIC_ID = "rpt_seed_1";
const SEED_REPORT_START_CODE = "vrf_seed_1";

const SEED_TWITTER_USERS = [
  { externalUserId: "tw_1001", handle: "seedartist", cursor: "seed-cursor-1" },
  {
    externalUserId: "tw_1002",
    handle: "tezoscreator",
    cursor: "seed-cursor-2",
  },
  { externalUserId: "tw_1003", handle: "nftbuilder", cursor: "seed-cursor-3" },
  { externalUserId: "tw_1004", handle: "mintmachine", cursor: "seed-cursor-4" },
  { externalUserId: "tw_1005", handle: "chainweaver", cursor: "seed-cursor-5" },
  { externalUserId: "tw_1006", handle: "artforged", cursor: "seed-cursor-6" },
  { externalUserId: "tw_1007", handle: "tezosbrush", cursor: "seed-cursor-7" },
  {
    externalUserId: "tw_1008",
    handle: "pixelfoundry",
    cursor: "seed-cursor-8",
  },
];

const SEED_TEZOS_WALLETS = [
  "tz1SeedWallet1111111111111111111111111",
  "tz1SeedWallet2222222222222222222222222",
  "tz1SeedWallet3333333333333333333333333",
  "tz1SeedWallet4444444444444444444444444",
  "tz1SeedWallet5555555555555555555555555",
  "tz1SeedWallet6666666666666666666666666",
];

const SEED_REPORTS = [
  {
    publicId: "rpt_seed_1",
    email: "seed@example.com",
    startGenerationCode: "vrf_seed_1",
    twitterExternalUserId: "tw_1001",
    tezosWalletAddress: "tz1SeedWallet1111111111111111111111111",
    workflowId: null,
    syncedTweetsAt: null,
    syncedBlockchainAt: null,
    workflowFailedAt: null,
    completedAt: null,
  },
  {
    publicId: "rpt_seed_2",
    email: "artist2@example.com",
    startGenerationCode: "vrf_seed_2",
    twitterExternalUserId: "tw_1002",
    tezosWalletAddress: "tz1SeedWallet2222222222222222222222222",
    workflowId: "wf_seed_2",
    syncedTweetsAt: "minus-3",
    syncedBlockchainAt: null,
    workflowFailedAt: null,
    completedAt: null,
  },
  {
    publicId: "rpt_seed_3",
    email: "artist3@example.com",
    startGenerationCode: "vrf_seed_3",
    twitterExternalUserId: "tw_1003",
    tezosWalletAddress: "tz1SeedWallet3333333333333333333333333",
    workflowId: "wf_seed_3",
    syncedTweetsAt: "minus-5",
    syncedBlockchainAt: "minus-4",
    workflowFailedAt: null,
    completedAt: "minus-1",
  },
  {
    publicId: "rpt_seed_4",
    email: "artist4@example.com",
    startGenerationCode: "vrf_seed_4",
    twitterExternalUserId: "tw_1004",
    tezosWalletAddress: "tz1SeedWallet4444444444444444444444444",
    workflowId: "wf_seed_4",
    syncedTweetsAt: "minus-2",
    syncedBlockchainAt: null,
    workflowFailedAt: "minus-1",
    completedAt: null,
  },
  {
    publicId: "rpt_seed_5",
    email: "artist5@example.com",
    startGenerationCode: "vrf_seed_5",
    twitterExternalUserId: "tw_1005",
    tezosWalletAddress: "tz1SeedWallet5555555555555555555555555",
    workflowId: "wf_seed_5",
    syncedTweetsAt: "minus-10",
    syncedBlockchainAt: "minus-9",
    workflowFailedAt: null,
    completedAt: "minus-8",
  },
  {
    publicId: "rpt_seed_6",
    email: "artist6@example.com",
    startGenerationCode: "vrf_seed_6",
    twitterExternalUserId: "tw_1006",
    tezosWalletAddress: "tz1SeedWallet6666666666666666666666666",
    workflowId: null,
    syncedTweetsAt: null,
    syncedBlockchainAt: null,
    workflowFailedAt: null,
    completedAt: null,
  },
  {
    publicId: "rpt_seed_7",
    email: "artist7@example.com",
    startGenerationCode: "vrf_seed_7",
    twitterExternalUserId: "tw_1007",
    tezosWalletAddress: "tz1SeedWallet1111111111111111111111111",
    workflowId: "wf_seed_7",
    syncedTweetsAt: "minus-6",
    syncedBlockchainAt: "minus-6",
    workflowFailedAt: null,
    completedAt: "minus-3",
  },
  {
    publicId: "rpt_seed_8",
    email: "artist8@example.com",
    startGenerationCode: "vrf_seed_8",
    twitterExternalUserId: "tw_1008",
    tezosWalletAddress: "tz1SeedWallet2222222222222222222222222",
    workflowId: "wf_seed_8",
    syncedTweetsAt: null,
    syncedBlockchainAt: null,
    workflowFailedAt: "minus-2",
    completedAt: null,
  },
];

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const addHours = (date: Date, hours: number) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000);

async function main() {
  const now = new Date();

  const user = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: { name: "Seed User" },
    create: {
      email: SEED_USER_EMAIL,
      name: "Seed User",
    },
  });

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "seed",
        providerAccountId: "seed-account",
      },
    },
    update: {
      userId: user.id,
      type: "credentials",
    },
    create: {
      userId: user.id,
      type: "credentials",
      provider: "seed",
      providerAccountId: "seed-account",
    },
  });

  await prisma.session.upsert({
    where: { sessionToken: "seed-session-token" },
    update: {
      userId: user.id,
      expires: addDays(now, 30),
    },
    create: {
      sessionToken: "seed-session-token",
      userId: user.id,
      expires: addDays(now, 30),
    },
  });

  const existingPost = await prisma.post.findFirst({
    where: { name: "Welcome Post", createdById: user.id },
  });

  if (!existingPost) {
    await prisma.post.create({
      data: {
        name: "Welcome Post",
        createdById: user.id,
      },
    });
  }

  const twitterUsers = await Promise.all(
    SEED_TWITTER_USERS.map(async (seedUser) => {
      const twitterUser = await prisma.twitterUser.upsert({
        where: { externalUserId: seedUser.externalUserId },
        update: {
          handle: seedUser.handle,
          userInfoData: {
            id: seedUser.externalUserId,
            userName: seedUser.handle,
          },
        },
        create: {
          handle: seedUser.handle,
          externalUserId: seedUser.externalUserId,
          userInfoData: {
            id: seedUser.externalUserId,
            userName: seedUser.handle,
          },
        },
      });

      const latestTweetsQuery = await prisma.latestTweetsQuery.upsert({
        where: {
          cursor_twitterUserId: {
            cursor: seedUser.cursor,
            twitterUserId: twitterUser.id,
          },
        },
        update: {
          fetchedAt: now,
          responseData: { source: "seed", cursor: seedUser.cursor },
        },
        create: {
          cursor: seedUser.cursor,
          twitterUserId: twitterUser.id,
          fetchedAt: now,
          responseData: { source: "seed", cursor: seedUser.cursor },
        },
      });

      return { twitterUser, latestTweetsQuery };
    }),
  );

  const tweetsPerUser = 48;

  for (const { twitterUser, latestTweetsQuery } of twitterUsers) {
    for (let index = 0; index < tweetsPerUser; index += 1) {
      const tweetId = `tweet_${twitterUser.externalUserId}_${index + 1}`;
      const likeCount = 3 + (index % 7) * 4;
      const retweetCount = 1 + (index % 5);
      const quoteCount = index % 4;
      const replyCount = 1 + (index % 6);
      const viewCount = 120 + index * 41 + (index % 9) * 7;
      const tweetCreatedAt = addHours(now, -((index + 1) * 6));

      await prisma.tweet.upsert({
        where: { tweetId },
        update: {
          twitterUserId: twitterUser.id,
          latestTweetsQueryCursor: latestTweetsQuery.cursor,
          tweetUrl: `https://x.com/${twitterUser.handle}/status/${index + 1}`,
          likeCount,
          retweetCount,
          quoteCount,
          replyCount,
          viewCount,
          tweetCreatedAt,
        },
        create: {
          twitterUserId: twitterUser.id,
          latestTweetsQueryCursor: latestTweetsQuery.cursor,
          tweetId,
          tweetUrl: `https://x.com/${twitterUser.handle}/status/${index + 1}`,
          likeCount,
          retweetCount,
          quoteCount,
          replyCount,
          viewCount,
          tweetCreatedAt,
        },
      });
    }
  }

  const tezosWallets = await Promise.all(
    SEED_TEZOS_WALLETS.map((address) =>
      prisma.tezosWallet.upsert({
        where: { address },
        update: { address },
        create: { address },
      }),
    ),
  );

  const resolveReportDate = (value: string | null) => {
    if (!value) return null;
    if (value === "now") return now;
    if (value.startsWith("minus-")) {
      const days = Number(value.replace("minus-", ""));
      if (Number.isFinite(days)) {
        return addDays(now, -days);
      }
    }
    return null;
  };

  for (const seedReport of SEED_REPORTS) {
    const reportTwitterUser = twitterUsers.find(
      (item) =>
        item.twitterUser.externalUserId === seedReport.twitterExternalUserId,
    );
    const reportWallet = tezosWallets.find(
      (wallet) => wallet.address === seedReport.tezosWalletAddress,
    );

    if (!reportTwitterUser || !reportWallet) {
      continue;
    }

    await prisma.report.upsert({
      where: { publicId: seedReport.publicId },
      update: {
        email: seedReport.email,
        startGenerationCode: seedReport.startGenerationCode,
        twitterUserId: reportTwitterUser.twitterUser.id,
        tezosWalletId: reportWallet.id,
        showFullReport: false,
        workflowId: seedReport.workflowId,
        syncedTweetsAt: resolveReportDate(seedReport.syncedTweetsAt),
        syncedBlockchainAt: resolveReportDate(seedReport.syncedBlockchainAt),
        workflowFailedAt: resolveReportDate(seedReport.workflowFailedAt),
        completedAt: resolveReportDate(seedReport.completedAt),
      },
      create: {
        publicId: seedReport.publicId,
        email: seedReport.email,
        startGenerationCode: seedReport.startGenerationCode,
        twitterUserId: reportTwitterUser.twitterUser.id,
        tezosWalletId: reportWallet.id,
        showFullReport: false,
        workflowId: seedReport.workflowId,
        syncedTweetsAt: resolveReportDate(seedReport.syncedTweetsAt),
        syncedBlockchainAt: resolveReportDate(seedReport.syncedBlockchainAt),
        workflowFailedAt: resolveReportDate(seedReport.workflowFailedAt),
        completedAt: resolveReportDate(seedReport.completedAt),
      },
    });
  }

  await prisma.verificationToken.upsert({
    where: { token: "seed-token" },
    update: {
      identifier: SEED_USER_EMAIL,
      expires: addDays(now, 1),
    },
    create: {
      identifier: SEED_USER_EMAIL,
      token: "seed-token",
      expires: addDays(now, 1),
    },
  });

  console.info("Seeded database with sample data.");
  console.info("Report public id:", SEED_REPORT_PUBLIC_ID);
  console.info("Report start generation code:", SEED_REPORT_START_CODE);
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
