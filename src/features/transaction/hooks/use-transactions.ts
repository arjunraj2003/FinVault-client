import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionApi } from "../api/transaction-api";
import type {  CreateTransactionDto } from "../types";
import { useToast } from "@/hooks/use-toast";

export function useTransactions(params?: any) {
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
      toast({ title: "Transaction created" });
    },
    onError: (error:any) => {
      console.log(error)
      toast({ title:`${error?.response?.data?.message}`, variant: "destructive" });
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
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                data: page.data.data.filter(
                  (tx: any) => tx.id !== transactionId
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