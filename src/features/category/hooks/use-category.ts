import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryApi } from "../api/category-api";
import { useToast } from "@/hooks/use-toast";
import type { CreateCategoryDto, UpdateCategoryDto } from "../types";

// ─── GET ALL CATEGORIES ────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await CategoryApi.getAll();
      return data;
    },
  });
}

// ─── GET CATEGORY BY ID ────────────────────────────────────────────────────

export function useCategoryById(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const { data } = await CategoryApi.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

// ─── CREATE CATEGORY ───────────────────────────────────────────────────────

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (dto: CreateCategoryDto) => {
      const { data } = await CategoryApi.create(dto);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category created successfully" });
    },

    onError: (error: any) => {
      toast({
        title: error?.response?.data?.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });
}

// ─── UPDATE CATEGORY ───────────────────────────────────────────────────────

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryDto;
    }) => {
      const res = await CategoryApi.update(id, data);
      return res.data;
    },

    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories", id] });
      toast({ title: "Category updated successfully" });
    },

    onError: (error: any) => {
      toast({
        title: error?.response?.data?.message || "Failed to update category",
        variant: "destructive",
      });
    },
  });
}

// ─── DEACTIVATE (DELETE) CATEGORY ─────────────────────────────────────────

export function useDeactivateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await CategoryApi.deactivate(id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deactivated" });
    },

    onError: (error: any) => {
      toast({
        title: error?.response?.data?.message || "Failed to deactivate category",
        variant: "destructive",
      });
    },
  });
}
