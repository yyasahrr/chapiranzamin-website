export type StaticService = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  pricingModel: "fixed" | "per_item" | "per_sqm" | "quote";
  basePrice: string;
  unitLabel: string;
  active: boolean;
  featured: boolean;
  wizardConfig: string;
  pricingConfig: string;
};

export const STATIC_SERVICES: StaticService[] = [
  {
    id: 1,
    slug: "banner-vinyl",
    name: "چاپ بنر و وینیل",
    category: "banner",
    description: "چاپ فضای داخلی و محیطی با کیفیت بالا",
    pricingModel: "per_sqm",
    basePrice: "185000",
    unitLabel: "متر مربع",
    active: true,
    featured: true,
    wizardConfig:
      '{"dimensions":true,"quantity":true,"material":true,"installation":true,"permit":true,"fileUpload":true,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":1,"max":100000,"allowCustom":true},"optionGroups":[{"key":"material_type","label":"نوع متریال","required":true,"options":[{"value":"vinyl","label":"وینیل","priceAdjustment":25000},{"value":"mesh","label":"مش","priceAdjustment":20000},{"value":"flex","label":"فلکس","priceAdjustment":35000}]}],"fieldPrices":{"installation":1800000,"permit":350000}}',
  },
  {
    id: 2,
    slug: "billboard",
    name: "بیلبورد شهری",
    category: "billboard",
    description: "چاپ، سازه و اکران بیلبورد",
    pricingModel: "quote",
    basePrice: "0",
    unitLabel: "پروژه",
    active: true,
    featured: true,
    wizardConfig:
      '{"dimensions":true,"quantity":false,"material":true,"installation":true,"permit":true,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":1,"max":100000,"allowCustom":true}}',
  },
  {
    id: 3,
    slug: "graphic-design",
    name: "طراحی گرافیک",
    category: "graphic_design",
    description: "طراحی پوستر، کمپین و هویت بصری",
    pricingModel: "fixed",
    basePrice: "2500000",
    unitLabel: "طرح",
    active: true,
    featured: true,
    wizardConfig:
      '{"dimensions":false,"quantity":true,"material":false,"installation":false,"permit":false,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":1,"max":100000,"allowCustom":true}}',
  },
  {
    id: 4,
    slug: "catalog-offset",
    name: "کاتالوگ افست",
    category: "catalog",
    description: "چاپ کاتالوگ سازمانی",
    pricingModel: "per_item",
    basePrice: "85000",
    unitLabel: "نسخه",
    active: true,
    featured: false,
    wizardConfig:
      '{"dimensions":false,"quantity":true,"material":true,"installation":false,"permit":false,"fileUpload":true,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":50,"max":100000,"allowCustom":true}}',
  },
  {
    id: 5,
    slug: "business-card",
    name: "کارت ویزیت",
    category: "other",
    description: "چاپ کارت ویزیت با انتخاب جنس، تیراژ و یک‌رو یا دورو",
    pricingModel: "per_item",
    basePrice: "5000",
    unitLabel: "عدد",
    active: true,
    featured: true,
    wizardConfig:
      '{"dimensions":false,"quantity":false,"material":false,"installation":false,"permit":false,"fileUpload":true,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":100,"max":100000,"allowCustom":true},"optionGroups":[{"key":"stock","label":"جنس کارت","required":true,"options":[{"value":"glossy","label":"گلاسه","priceAdjustment":0},{"value":"linen","label":"کتان","priceAdjustment":3000},{"value":"pvc","label":"PVC","priceAdjustment":6000}]},{"key":"run","label":"تیراژ","required":true,"options":[{"value":"1000","label":"۱٬۰۰۰ عدد","priceAdjustment":0},{"value":"2000","label":"۲٬۰۰۰ عدد","priceAdjustment":0},{"value":"5000","label":"۵٬۰۰۰ عدد","priceAdjustment":0}]},{"key":"sides","label":"نوع چاپ","required":true,"options":[{"value":"one","label":"یک‌رو","priceAdjustment":0},{"value":"two","label":"دورو","priceAdjustment":2000}]}]}',
  },
  {
    id: 6,
    slug: "signage",
    name: "تابلو و سازه",
    category: "signage",
    description: "تابلو فروشگاهی و سازمانی",
    pricingModel: "quote",
    basePrice: "0",
    unitLabel: "پروژه",
    active: true,
    featured: false,
    wizardConfig:
      '{"dimensions":true,"quantity":true,"material":true,"installation":true,"permit":false,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":1,"max":100000,"allowCustom":true}}',
  },
  {
    id: 7,
    slug: "installation",
    name: "نصب و اجرا",
    category: "other",
    description: "اعزام تیم نصب و اجرای سازه",
    pricingModel: "fixed",
    basePrice: "1800000",
    unitLabel: "نوبت",
    active: true,
    featured: false,
    wizardConfig:
      '{"dimensions":true,"quantity":true,"material":true,"installation":true,"permit":false,"description":true}',
    pricingConfig:
      '{"quantityRules":{"min":1,"max":100000,"allowCustom":true}}',
  },
];
