import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { patientsQueryKey } from "@/lib/queries/patients";
import PatientsList from "./patientsList";
import { serverApi } from "@/lib/api/server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search: string }>;
}) {
  const queryClient = new QueryClient();

  const search = (await searchParams).search || "";
  const query = { search, page: 0, pageSize: 10 };

  await queryClient.prefetchQuery({
    queryKey: patientsQueryKey(query),
    queryFn: async () => {
      const api = await serverApi();
      return api.patients.filter(query);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PatientsList />
    </HydrationBoundary>
  );
}
