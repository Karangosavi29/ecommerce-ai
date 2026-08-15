import { createChatCompletion } from "../utils/openai.js";
import { buildSearchSystemPrompt } from "./prompts/search.prompt.js";
import { buildAssistantSystemPrompt, buildSpecsSystemPrompt } from "./prompts/assistant.prompt.js";
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
  const recentUserText = [
    ...history.filter((h) => h.role === "user").map((h) => h.content),
    message,
  ]
    .slice(-4)
    .join("\n");

  const { products: candidateProducts } = await extractFiltersAndFetchProducts(recentUserText, {
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

export const generateProductDescription = async ({ name, category }) => {
  const systemPrompt = [
    "You write the 'About this item' section for an e-commerce product listing, in the style of Amazon's detailed item description.",
    "Given only a product name and category, output 5-8 lines, one per line, plain text.",
    "Mix short benefit-focused lines with a few more detailed technical or descriptive lines, like a real Amazon 'About this item' section — not just short marketing bullets.",
    "Each line should be a standalone phrase or sentence, NOT connected into paragraphs.",
    "No markdown, no bullet symbols like '-' or '*', no numbering, no headers, no emojis — just the plain text of each line, separated by newlines.",
    "You may reference specifics that are explicitly present in the product name (e.g. '55-inch', '7kg', '256GB', 'Ryzen 5') naturally within a line.",
    "Do not invent specific technical specifications, certifications, or exact measurements you cannot know for certain from the name alone.",
    "Keep every line honest and appealing — about the experience, benefit, or a real detail from the name — not fabricated facts.",
  ].join(" ");

  const userPrompt = `Product name: ${name}\nCategory: ${category}`;

  const description = await createChatCompletion({
    systemPrompt,
    userPrompt,
    json: false,
    maxTokens: 320,
  });

  return typeof description === "string" ? description.trim() : "";
};


export const generateProductSpecifications = async ({ name, category }) => {
  const systemPrompt = buildSpecsSystemPrompt();
  const userPrompt = `Product name: ${name}\nCategory: ${category}`;

  const result = await createChatCompletion({
    systemPrompt,
    userPrompt,
    json: true,
    maxTokens: 500,
  });

  const specs = Array.isArray(result?.specifications) ? result.specifications : [];

  return specs.filter(
    (s) => s && typeof s.key === "string" && typeof s.value === "string" && s.key.trim() && s.value.trim()
  );
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