import { HomeSection } from "../models/homeSection.model.js";

const SECTION_DEFAULTS = {
  flashSale: "Flash Sale",
  featured: "Featured Products",
  bestSellers: "Best Sellers",
};

const findByKey = (key) => HomeSection.findOne({ key }).populate("productIds");

const findAll = () => HomeSection.find({}).populate("productIds");

const upsertProductIds = (key, productIds) =>
  HomeSection.findOneAndUpdate(
    { key },
    { key, title: SECTION_DEFAULTS[key], productIds },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("productIds");

export default { findByKey, findAll, upsertProductIds, SECTION_DEFAULTS };