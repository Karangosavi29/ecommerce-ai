import { motion } from "framer-motion";
import { PLACEHOLDER_BRANDS } from "@/components/home/placeholderData";

export function TopBrands() {
  return (
    <section className="border-y border-border bg-card/50 py-10 sm:py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 sm:mb-8"
        >
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Trusted names
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Top Brands
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PLACEHOLDER_BRANDS.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-soft-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {brand.initials}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}