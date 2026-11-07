import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { serverApiClient } from "@/lib/orpc.server";
import { orpc } from "@/lib/orpc";
import PatientsList from "./patientsList";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search: string }>;
}) {
  const queryClient = new QueryClient();

  const search = (await searchParams).search || "";
  const input = { search, page: 0, pageSize: 10 };

  // Same query key the client uses, but fetched server-side with the visitor's cookies
  await queryClient.prefetchQuery({
    queryKey: orpc.patients.list.queryKey({ input }),
    queryFn: () => serverApiClient.patients.list(input),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PatientsList />
    </HydrationBoundary>
  );
}
