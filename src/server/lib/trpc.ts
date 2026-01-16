import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { QueryClient } from "@tanstack/react-query";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { DEFAULT_QUERY_CLIENT_CONFIG } from "~/shared/lib/react-query";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const createQueryClient = () => new QueryClient(DEFAULT_QUERY_CLIENT_CONFIG);

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: serverApi, HydrateClient } =
  createHydrationHelpers<AppRouter>(caller, getQueryClient);
