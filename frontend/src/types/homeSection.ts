import type { Product } from "@/types";
import type { HomeSectionKey } from "@/api/homeSections.api";

export interface HomeSection {
  key: HomeSectionKey;
  title: string;
  productIds: Product[]; 
}