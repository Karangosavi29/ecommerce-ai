import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import homeSectionService from "../services/homeSection.service.js";

const getAllHomeSections = asyncHandler(async (req, res) => {
  const sections = await homeSectionService.getAllSections();
  return res.status(200).json(new ApiResponse(200, sections, "Home sections fetched successfully"));
});

const getHomeSection = asyncHandler(async (req, res) => {
  const section = await homeSectionService.getSection(req.params.key);
  return res.status(200).json(new ApiResponse(200, section, "Home section fetched successfully"));
});

const updateHomeSection = asyncHandler(async (req, res) => {
  const section = await homeSectionService.setSection(req.params.key, req.body.productIds);
  return res.status(200).json(new ApiResponse(200, section, "Home section updated successfully"));
});

export { getAllHomeSections, getHomeSection, updateHomeSection };