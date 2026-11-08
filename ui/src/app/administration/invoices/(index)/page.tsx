import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { InvoicesList } from "./invoicesList";
import { InvoicesQueryKey, invoicesQueryKey } from "@/lib/queries/invoices";
import { serverApi } from "@/lib/api/server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<InvoicesQueryKey>;
}) {
  const queryClient = new QueryClient();

  const query = { ...await searchParams, page: 0, pageSize: 25 };
  await queryClient.prefetchQuery({
    queryKey: invoicesQueryKey(query),
    queryFn: async () => {
      const api = await serverApi();
      return api.invoices.filter(query);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvoicesList />
    </HydrationBoundary>
  );
}
