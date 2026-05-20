import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { TransactionApi } from "../api/transaction-api";
import type { CreateTransactionDto, TransactionListResponse, TransactionQueryParams } from "../types";
import { useToast } from "@/hooks/use-toast";
import type { ApiErrorResponse } from "@/lib/api-error";

export function useTransactions(params?: TransactionQueryParams) {
  return useInfiniteQuery({
    queryKey: ["transactions", params],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await TransactionApi.getAll({
        ...params,
        page: pageParam,
      });

      return data;
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta;

      if (!meta?.hasNext) return undefined;

      return meta.page + 1;
    },
    initialPageParam: 1,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dto: CreateTransactionDto) => {
      const { data } = await TransactionApi.create(dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Transaction created" });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.log(error)
      toast({ title: error.response?.data?.message || "Failed to create transaction", variant: "destructive" });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (transactionId: string) => {
      await TransactionApi.deleteTrans(transactionId);
    },

    onSuccess: (_, transactionId) => {
      queryClient.setQueriesData(
        { queryKey: ["transactions"] },
        (oldData: InfiniteData<TransactionListResponse> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                data: page.data.data.filter(
                  (tx) => tx.id !== transactionId
                ),
              },
            })),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      toast({ title: "Transaction deleted" });
    },

    onError: () => {
      toast({
        title: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });
}
