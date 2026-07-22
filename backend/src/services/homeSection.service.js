import homeSectionRepository from "../repositories/homeSection.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

const VALID_KEYS = Object.keys(homeSectionRepository.SECTION_DEFAULTS);

const getSection = async (key) => {
  if (!VALID_KEYS.includes(key)) throw new ApiError(400, "Invalid section key");
  const section = await homeSectionRepository.findByKey(key);
  return section ?? { key, title: homeSectionRepository.SECTION_DEFAULTS[key], productIds: [] };
};

const getAllSections = async () => {
  const sections = await homeSectionRepository.findAll();
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));

  
  return VALID_KEYS.map(
    (key) => byKey[key] ?? { key, title: homeSectionRepository.SECTION_DEFAULTS[key], productIds: [] }
  );
};

const setSection = async (key, productIds) => {
  if (!VALID_KEYS.includes(key)) throw new ApiError(400, "Invalid section key");

  
  const found = await Promise.all(productIds.map((id) => productRepository.findById(id)));
  const missingIndex = found.findIndex((p) => !p);
  if (missingIndex !== -1) {
    throw new ApiError(400, `Product not found: ${productIds[missingIndex]}`);
  }

  return homeSectionRepository.upsertProductIds(key, productIds);
};

export default { getSection, getAllSections, setSection };