import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { InvoicesList } from "./invoicesList";
import { getInvoicesRepository } from "@/features/invoices";
import { InvoicesQueryKey, invoicesQueryKey } from "@/features/invoices/queries";

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
      const repo = await getInvoicesRepository();
      return repo.filter(query);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvoicesList />
    </HydrationBoundary>
  );
}
