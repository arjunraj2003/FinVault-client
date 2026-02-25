import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountApi } from "../api/account-api";
import type { CreateAccountDto } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await AccountApi.getAccounts();
      return data.data;
    },
  });
}

export function useBalance(accountId: string) {
  return useQuery({
    queryKey: ["balance", accountId],
    queryFn: async () => {
      const { data } = await AccountApi.getBalance(accountId);
      return data;
    },
    enabled: !!accountId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dto: CreateAccountDto) => {
      const { data } = await AccountApi.create(dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({ title: "Account created", description: "Your new account is ready." });
    },
    onError: () => {
      toast({ title: "Failed to create account", variant: "destructive" });
    },
  });
}
