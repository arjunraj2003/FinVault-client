  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { BudgetApi } from "../api/budget-api";
  import { useToast } from "@/hooks/use-toast";
  import { CreateBudgetDto, UpdateBudgetDto } from "../types";


  // GET ALL BUDGETS
  export function useBudgets() {
    return useQuery({
      queryKey: ["budgets"],
      queryFn: async () => {
        const { data } = await BudgetApi.getAll();
        return data;
      },
    });
  }


  // CREATE BUDGET
  export function useCreateBudget() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
      mutationFn: async (dto: CreateBudgetDto) => {
        const { data } = await BudgetApi.create(dto);
        return data;
      },

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });

        toast({ title: "Budget created successfully" });
      },

      onError: (error: any) => {
        toast({
          title: error?.response?.data?.message || "Budget creation failed",
          variant: "destructive",
        });
      },
    });
  }


  // UPDATE BUDGET
  export function useUpdateBudget() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
      mutationFn: async ({
        budgetId,
        data,
      }: {
        budgetId: string;
        data: UpdateBudgetDto;
      }) => {
        const res = await BudgetApi.update(budgetId, data);
        return res.data;
      },

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({queryKey:["budget-progress"]});

        toast({ title: "Budget updated" });
      },

      onError: (error: any) => {
        toast({
          title: error?.response?.data?.message || "Update failed",
          variant: "destructive",
        });
      },
    });
  }


  // DELETE BUDGET
  export function useDeleteBudget() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
      mutationFn: async (budgetId: string) => {
        await BudgetApi.delete(budgetId);
      },

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });

        toast({ title: "Budget deleted" });
      },

      onError: () => {
        toast({
          title: "Failed to delete budget",
          variant: "destructive",
        });
      },
    });
  }


  // BUDGET PROGRESS
  export function useBudgetProgress(budgetId: string) {
    return useQuery({
      queryKey: ["budget-progress", budgetId],
      queryFn: async () => {
        const { data } = await BudgetApi.getProgress(budgetId);
        return data;
      },
      enabled: !!budgetId,
    });
  }