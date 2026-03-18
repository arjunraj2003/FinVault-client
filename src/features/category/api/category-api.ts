import axiosInstance from "@/lib/axios";
import type {
  CategoryListResponse,
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types";

export class CategoryApi {
  // GET /api/v1/category
  static getAll() {
    return axiosInstance.get<CategoryListResponse>("/category");
  }

  // POST /api/v1/category
  static create(data: CreateCategoryDto) {
    return axiosInstance.post<CategoryResponse>("/category", data);
  }

  // GET /api/v1/category/:id
  static getById(id: string) {
    return axiosInstance.get<CategoryResponse>(`/category/${id}`);
  }

  // PATCH /api/v1/category/:id
  static update(id: string, data: UpdateCategoryDto) {
    return axiosInstance.patch<CategoryResponse>(`/category/${id}`, data);
  }

  // DELETE /api/v1/category/:id  (deactivate)
  static deactivate(id: string) {
    return axiosInstance.delete<CategoryResponse>(`/category/${id}`);
  }
}
