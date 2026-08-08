import { createChatCompletion } from "../utils/openai.js";
import { buildSearchSystemPrompt } from "./prompts/search.prompt.js";
import { buildAssistantSystemPrompt } from "./prompts/assistant.prompt.js";
import productService from "./product.service.js";
import { ApiError } from "../utils/ApiError.js";


const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const ASSISTANT_CANDIDATE_LIMIT = 10;



const extractFiltersAndFetchProducts = async (text, { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) => {
  let categories = [];
  try {
    const { data } = await productService.getCategories();
    categories = data || [];
  } catch {
    // Non-fatal — proceed without hints.
  }

  const systemPrompt = buildSearchSystemPrompt({ categories });
  let extracted = {};
  try {
    extracted = await createChatCompletion({ systemPrompt, userPrompt: text, json: true });
  } catch {
    extracted = {};
  }

  const filters = stripEmptyValues(extracted);
  const listParams = mapAIFiltersToListProducts(filters, { page, limit });

  const { products, pagination, appliedParams } = await fetchProductsWithFallback(filters, listParams);

  return { filters, appliedFilters: appliedParams, products, pagination };
};


const fetchProductsWithFallback = async (filters, listParams) => {
  const { data } = await productService.listProducts(listParams);
  let products = data.products;
  let pagination = data.pagination;
  let appliedParams = listParams;

  if (products.length === 0 && listParams.search && filters.keyword) {
    const keywordOnlyParams = { ...listParams, search: filters.keyword };
    const keywordOnly = await productService.listProducts(keywordOnlyParams);
    if (keywordOnly.data.products.length > 0) {
      products = keywordOnly.data.products;
      pagination = keywordOnly.data.pagination;
      appliedParams = keywordOnlyParams;
    }
  }

  if (products.length === 0 && appliedParams.category) {
    const { category, ...paramsWithoutCategory } = appliedParams;
    const fallback = await productService.listProducts(paramsWithoutCategory);
    if (fallback.data.products.length > 0) {
      products = fallback.data.products;
      pagination = fallback.data.pagination;
      appliedParams = paramsWithoutCategory;
    }
  }

  return { products, pagination, appliedParams };
};


const mapAIFiltersToListProducts = (filters, { page, limit }) => {
  const searchParts = [
    filters.keyword,
    filters.brand,
    filters.color,
    filters.size,
    ...(filters.features || []),
    filters.useCase,
  ].filter(Boolean);

  const params = { page, limit };

  if (searchParts.length) params.search = searchParts.join(" ");
  if (filters.category) params.category = filters.category;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;

  return params;
};


export const searchProductsWithAI = async (query, { page, limit } = {}) => {
  return extractFiltersAndFetchProducts(query, { page, limit });
};


export const runProductAssistant = async (message, history = []) => {
  const conversationText = [...history.map((h) => h.content), message].join("\n");

  const { products: candidateProducts } = await extractFiltersAndFetchProducts(conversationText, {
    page: DEFAULT_PAGE,
    limit: ASSISTANT_CANDIDATE_LIMIT,
  });

  const systemPrompt = buildAssistantSystemPrompt(candidateProducts);
  const conversationPrompt = [
    ...history.map((h) => `${h.role}: ${h.content}`),
    `user: ${message}`,
  ].join("\n");

  const result = await createChatCompletion({
    systemPrompt,
    userPrompt: conversationPrompt,
    json: true,
  });

  const recommendedIds = new Set(result.recommendedProductIds || []);
  const recommendedProducts = candidateProducts.filter((p) =>
    recommendedIds.has(String(p._id))
  );

  return {
    message: result.reply,
    needsMoreInfo: Boolean(result.needsMoreInfo),
    products: recommendedProducts,
  };
};


const stripEmptyValues = (obj = {}) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string" && !value.trim()) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }
  return cleaned;
};

export const assertConfigured = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(503, "AI features are not configured on this server.");
  }
};