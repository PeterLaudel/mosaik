import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getPatientsRepository } from "@/features/patients";
import { patientsQueryKey } from "@/features/patients/queries";
import PatientsList from "./patientsList";

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
      const repo = await getPatientsRepository();
      return repo.filter(query);
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PatientsList />
    </HydrationBoundary>
  );
}
