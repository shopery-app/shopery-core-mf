import { BoxIcon, StoreIcon } from "../components/ui/icons";

// Presentation-only metadata (icon, blurb) keyed by the real ProductCategory
// enum values from the backend. The backend (GET /dropdowns/product-categories)
// remains the source of truth for which values exist — this just decorates them.
export const CATEGORY_META = {
  ELECTRONICS: { label: "Electronics", blurb: "Phones, audio & more" },
  FASHION: { label: "Fashion", blurb: "Clothing & accessories" },
  HOME: { label: "Home", blurb: "Furniture & living" },
  BEAUTY: { label: "Beauty", blurb: "Skincare & cosmetics" },
  SPORTS: { label: "Sports", blurb: "Gear & equipment" },
  TOYS: { label: "Toys", blurb: "Games & hobbies" },
};

export const CategoryIcon = BoxIcon;
export const ShopFallbackIcon = StoreIcon;
