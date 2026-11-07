import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getServicesRepository } from "@/features/services";
import { servicesQueryKey } from "@/features/services/queries";
import ServiceList from "./servicesList";

export default async function Page() {
  const queryClient = new QueryClient();
  const query = { page: 0, pageSize: 10 };

  await queryClient.prefetchQuery({
    queryKey: servicesQueryKey(query),
    queryFn: async () => {
      const repo = await getServicesRepository();
      return repo.filter(query);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServiceList />
    </HydrationBoundary>
  );
}
