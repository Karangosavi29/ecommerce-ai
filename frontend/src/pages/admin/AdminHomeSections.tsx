import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Zap, Star, TrendingUp, Save } from "lucide-react";
import { getAllHomeSections, updateHomeSection, type HomeSectionKey } from "@/api/homeSections.api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductPicker } from "@/components/admin/ProductPicker";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import type { Product, ApiErrorResponse } from "@/types";

interface SectionState {
  key: HomeSectionKey;
  title: string;
  icon: typeof Zap;
  products: Product[];
  isSaving: boolean;
}

const SECTION_META: Record<HomeSectionKey, { title: string; icon: typeof Zap }> = {
  flashSale: { title: "Flash Sale", icon: Zap },
  featured: { title: "Featured Products", icon: Star },
  bestSellers: { title: "Best Sellers", icon: TrendingUp },
};

const unwrap = (res: any) => res.data?.data ?? res.data;
const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr.response?.data?.message || fallback;
};

export default function AdminHomeSections() {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<HomeSectionKey>("flashSale");

  useEffect(() => {
    getAllHomeSections()
      .then((res) => {
        const data = unwrap(res) as { key: HomeSectionKey; productIds: Product[] }[];
        const mapped: SectionState[] = (Object.keys(SECTION_META) as HomeSectionKey[]).map((key) => {
          const match = data.find((s) => s.key === key);
          return {
            key,
            title: SECTION_META[key].title,
            icon: SECTION_META[key].icon,
            products: match?.productIds ?? [],
            isSaving: false,
          };
        });
        setSections(mapped);
      })
      .catch(() => toast.error("Failed to load home sections"))
      .finally(() => setIsLoading(false));
  }, []);

  const activeSection = sections.find((s) => s.key === activeKey);

  const handleProductsChange = (products: Product[]) => {
    setSections((prev) => prev.map((s) => (s.key === activeKey ? { ...s, products } : s)));
  };

  const handleSave = async () => {
    if (!activeSection) return;
    setSections((prev) => prev.map((s) => (s.key === activeKey ? { ...s, isSaving: true } : s)));
    try {
      await updateHomeSection(
        activeKey,
        activeSection.products.map((p) => p._id)
      );
      toast.success(`${activeSection.title} updated`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save section"));
    } finally {
      setSections((prev) => prev.map((s) => (s.key === activeKey ? { ...s, isSaving: false } : s)));
    }
  };

  if (isLoading) return <Spinner fullScreen />;

  return (
    <div className="container py-8">
      <AdminPageHeader
        title="Homepage Sections"
        description="Manually curate which products appear in Flash Sale, Featured, and Best Sellers."
      />

      {/* Section tabs */}
      <div className="mb-6 flex gap-2 border-b border-border">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActiveKey(section.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeKey === section.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <section.icon className="h-4 w-4" />
            {section.title}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
              {section.products.length}
            </span>
          </button>
        ))}
      </div>

      {activeSection && (
        <div className="max-w-2xl">
          <ProductPicker
            selected={activeSection.products}
            onChange={handleProductsChange}
            maxItems={20}
          />

          <Button onClick={handleSave} disabled={activeSection.isSaving} className="mt-5 gap-1.5">
            <Save className="h-4 w-4" />
            {activeSection.isSaving ? "Saving..." : `Save ${activeSection.title}`}
          </Button>
        </div>
      )}
    </div>
  );
}