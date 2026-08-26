import axiosClient from "@/api/axiosClient";
import type { Product } from "@/types";


export interface AISearchFilters {
  keyword?: string;
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  useCase?: string;
}

export interface AISearchResponse {
  filters: AISearchFilters;
  products: Product[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantResponse {
  message: string;
  needsMoreInfo: boolean;
  products: Product[];
  state?: AssistantState;
  quickReplies?: QuickReply[];
}

export const aiSearch = async (
  query: string,
  opts?: { page?: number; limit?: number }
): Promise<AISearchResponse> => {
  const res = await axiosClient.post("/ai/search", { query, ...opts });
  return res.data as AISearchResponse;
};


export const generateProductDescription = async (
  name: string,
  category: string
): Promise<{ description: string }> => {
  const res = await axiosClient.post("/ai/product-description", { name, category });
  return res.data as { description: string };
};

export interface ProductSpecification {
  key: string;
  value: string;
}

export const generateProductSpecifications = async (
  name: string,
  category: string
): Promise<{ specifications: ProductSpecification[] }> => {
  const res = await axiosClient.post("/ai/product-specifications", { name, category });
  return res.data as { specifications: ProductSpecification[] };
};


export interface AssistantState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  features?: string[];
  awaiting?: "budget" | "broaden_budget" | "category" | "confirmation" | null;
  lastSearchHadResults?: boolean;
}

export interface QuickReply {
  label: string;
  value: string;
}



export const askAssistant = async (
  message: string,
  history: AssistantTurn[] = [],
  state: AssistantState = {}
): Promise<AssistantResponse> => {
  const res = await axiosClient.post("/ai/assistant", { message, history, state });
  return res.data as AssistantResponse;
};