import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { servicesQueryKey } from "@/lib/queries/services";
import ServiceList from "./servicesList";
import { serverApi } from "@/lib/api/server";

export default async function Page() {
  const queryClient = new QueryClient();
  const query = { page: 0, pageSize: 10 };

  await queryClient.prefetchQuery({
    queryKey: servicesQueryKey(query),
    queryFn: async () => {
      const api = await serverApi();
      return api.services.filter(query);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServiceList />
    </HydrationBoundary>
  );
}
