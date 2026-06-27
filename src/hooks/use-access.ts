import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAccess } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";

export function useAccess() {
  const { user } = useAuth();
  const fn = useServerFn(getMyAccess);
  const q = useQuery({
    queryKey: ["my-access", user?.id],
    queryFn: () => fn(),
    enabled: !!user,
    staleTime: 60_000,
  });
  return {
    isLoading: q.isLoading,
    role: q.data?.role ?? "user",
    isMaster: q.data?.isMaster ?? false,
    isAdmin: q.data?.isAdmin ?? false,
    isTechnician: q.data?.role === "technician",
    companyId: q.data?.companyId ?? null,
    companyName: q.data?.companyName ?? null,
    allowedFeatures: q.data?.allowedFeatures ?? null,
    planType: q.data?.planType ?? "basic",
  };
}
