export type PricingModel = "fixed" | "per_item" | "per_sqm" | "quote";

export type PricingInput = {
  quantity: number;
  width: number | null;
  height: number | null;
  dimensionUnit: "cm" | "m";
};

export type PricingResult = {
  unitPrice: number;
  estimatedPrice: number;
};

export type PricingOption = {
  value: string;
  label: string;
  priceAdjustment: number;
};

export type PricingOptionGroup = {
  key: string;
  label: string;
  required: boolean;
  options: PricingOption[];
};

export type ResolvedPricingOption = PricingOption & {
  key: string;
  groupLabel: string;
};

export type PricingConfig = {
  optionGroups: PricingOptionGroup[];
  fieldPrices: { installation: number; permit: number };
  quantityRules: { min: number; max: number; allowCustom: boolean };
  calculationFactors: Record<
    "quantity" | "area" | "material" | "installation" | "permit",
    { enabled: boolean; price: number }
  >;
};

const MAX_QUANTITY = 100_000;
const MAX_DIMENSION = 100_000;
const MAX_PRICE = 9_000_000_000_000;
const DEFAULT_INSTALLATION_PRICE = 1_800_000;

export function normalizePositiveNumber(
  value: unknown,
  maximum: number
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > maximum) return null;
  return parsed;
}

export function normalizeQuantity(value: unknown): number | null {
  const quantity = Number(value);
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY
  ) {
    return null;
  }
  return quantity;
}

export function calculatePrice(
  model: PricingModel,
  basePriceValue: string | number,
  input: PricingInput,
  optionAdjustment = 0,
  flatAdjustment = 0
): PricingResult {
  const basePrice = Number(basePriceValue) + optionAdjustment;
  if (
    !Number.isFinite(basePrice) ||
    basePrice < 0 ||
    basePrice > MAX_PRICE ||
    model === "quote"
  ) {
    return { unitPrice: 0, estimatedPrice: 0 };
  }

  let estimatedPrice = basePrice;
  if (model === "per_item") estimatedPrice *= input.quantity;
  if (model === "per_sqm") {
    const width = input.width ?? 0;
    const height = input.height ?? 0;
    const area =
      input.dimensionUnit === "cm"
        ? (width * height) / 10_000
        : width * height;
    estimatedPrice *= area * input.quantity;
  }
  estimatedPrice += flatAdjustment;

  if (!Number.isFinite(estimatedPrice) || estimatedPrice > MAX_PRICE) {
    throw new Error("PRICE_OUT_OF_RANGE");
  }

  return {
    unitPrice: Math.round(basePrice),
    estimatedPrice: Math.round(estimatedPrice),
  };
}

export function parseFullPricingConfig(value: unknown): PricingConfig {
  const defaultQuantityRules = {
    min: 1,
    max: MAX_QUANTITY,
    allowCustom: true,
  };
  const emptyFactors: PricingConfig["calculationFactors"] = {
    quantity: { enabled: false, price: 0 },
    area: { enabled: false, price: 0 },
    material: { enabled: false, price: 0 },
    installation: { enabled: false, price: 0 },
    permit: { enabled: false, price: 0 },
  };
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return { optionGroups: [], fieldPrices: { installation: DEFAULT_INSTALLATION_PRICE, permit: 0 }, quantityRules: defaultQuantityRules, calculationFactors: emptyFactors };
    const object = parsed as Record<string, unknown>;
    const rawPrices =
      object.fieldPrices &&
      typeof object.fieldPrices === "object" &&
      !Array.isArray(object.fieldPrices)
        ? (object.fieldPrices as Record<string, unknown>)
        : {};
    const safePrice = (input: unknown) => {
      const price = Number(input ?? 0);
      return Number.isSafeInteger(price) && price >= 0 && price <= MAX_PRICE
        ? price
        : 0;
    };
    const fieldPrices = {
      installation:
        Object.prototype.hasOwnProperty.call(rawPrices, "installation")
          ? safePrice(rawPrices.installation)
          : DEFAULT_INSTALLATION_PRICE,
      permit: safePrice(rawPrices.permit),
    };
    const rawQuantityRules =
      object.quantityRules &&
      typeof object.quantityRules === "object" &&
      !Array.isArray(object.quantityRules)
        ? (object.quantityRules as Record<string, unknown>)
        : {};
    const rawMin = Number(rawQuantityRules.min);
    const rawMax = Number(rawQuantityRules.max);
    const min =
      Number.isSafeInteger(rawMin) && rawMin >= 1 && rawMin <= MAX_QUANTITY
        ? rawMin
        : 1;
    const max =
      Number.isSafeInteger(rawMax) && rawMax >= min && rawMax <= MAX_QUANTITY
        ? rawMax
        : MAX_QUANTITY;
    const quantityRules = {
      min,
      max,
      allowCustom: rawQuantityRules.allowCustom !== false,
    };
    const rawFactors =
      object.calculationFactors &&
      typeof object.calculationFactors === "object" &&
      !Array.isArray(object.calculationFactors)
        ? (object.calculationFactors as Record<string, unknown>)
        : {};
    const calculationFactors = Object.fromEntries(
      Object.keys(emptyFactors).map((key) => {
        const raw =
          rawFactors[key] &&
          typeof rawFactors[key] === "object" &&
          !Array.isArray(rawFactors[key])
            ? (rawFactors[key] as Record<string, unknown>)
            : {};
        return [key, { enabled: raw.enabled === true, price: safePrice(raw.price) }];
      })
    ) as PricingConfig["calculationFactors"];
    const groups = object.optionGroups;
    if (!Array.isArray(groups)) return { optionGroups: [], fieldPrices, quantityRules, calculationFactors };
    const optionGroups = groups.flatMap((raw): PricingOptionGroup[] => {
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
      const group = raw as Record<string, unknown>;
      const key = String(group.key ?? "").trim();
      const label = String(group.label ?? "").trim();
      if (!/^[a-zA-Z0-9_-]{1,40}$/.test(key) || !label || label.length > 80)
        return [];
      const options = Array.isArray(group.options)
        ? group.options.flatMap((entry): PricingOption[] => {
            if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
            const option = entry as Record<string, unknown>;
            const optionValue = String(option.value ?? "").trim();
            const optionLabel = String(option.label ?? "").trim();
            const adjustment = Number(option.priceAdjustment ?? 0);
            if (
              !/^[a-zA-Z0-9_-]{1,40}$/.test(optionValue) ||
              !optionLabel ||
              optionLabel.length > 80 ||
              !Number.isSafeInteger(adjustment) ||
              Math.abs(adjustment) > MAX_PRICE
            )
              return [];
            return [{ value: optionValue, label: optionLabel, priceAdjustment: adjustment }];
          })
        : [];
      if (options.length === 0 || options.length > 30) return [];
      return [{ key, label, required: group.required !== false, options }];
    }).slice(0, 20);
    return { optionGroups, fieldPrices, quantityRules, calculationFactors };
  } catch {
    return { optionGroups: [], fieldPrices: { installation: DEFAULT_INSTALLATION_PRICE, permit: 0 }, quantityRules: defaultQuantityRules, calculationFactors: emptyFactors };
  }
}

export function parsePricingConfig(value: unknown): PricingOptionGroup[] {
  return parseFullPricingConfig(value).optionGroups;
}

export function resolveFieldPrice(
  config: unknown,
  input: { requiresInstallationTeam?: boolean; requiresPermit?: boolean }
) {
  const parsed = parseFullPricingConfig(config);
  const installationPrice = parsed.calculationFactors.installation.enabled
    ? parsed.calculationFactors.installation.price
    : parsed.fieldPrices.installation;
  const permitPrice = parsed.calculationFactors.permit.enabled
    ? parsed.calculationFactors.permit.price
    : parsed.fieldPrices.permit;
  return (
    (input.requiresInstallationTeam ? installationPrice : 0) +
    (input.requiresPermit ? permitPrice : 0)
  );
}

export function calculateConfiguredPrice(
  model: PricingModel,
  basePrice: string | number,
  input: PricingInput & {
    material?: string | null;
    requiresInstallationTeam?: boolean;
    requiresPermit?: boolean;
  },
  config: unknown,
  optionAdjustment = 0
): PricingResult {
  const parsed = parseFullPricingConfig(config);
  const factors = parsed.calculationFactors;
  if (!Object.values(factors).some((factor) => factor.enabled))
    return calculatePrice(
      model,
      basePrice,
      input,
      optionAdjustment,
      resolveFieldPrice(config, input)
    );
  if (model === "quote") return { unitPrice: 0, estimatedPrice: 0 };
  let estimatedPrice = Number(basePrice) + optionAdjustment;
  if (factors.quantity.enabled)
    estimatedPrice += factors.quantity.price * input.quantity;
  if (factors.area.enabled) {
    const width = input.width ?? 0;
    const height = input.height ?? 0;
    const area =
      input.dimensionUnit === "cm"
        ? (width * height) / 10_000
        : width * height;
    estimatedPrice += factors.area.price * area * input.quantity;
  }
  if (factors.material.enabled && input.material)
    estimatedPrice += factors.material.price;
  if (factors.installation.enabled && input.requiresInstallationTeam)
    estimatedPrice += factors.installation.price;
  if (factors.permit.enabled && input.requiresPermit)
    estimatedPrice += factors.permit.price;
  if (!Number.isFinite(estimatedPrice) || estimatedPrice < 0 || estimatedPrice > MAX_PRICE)
    throw new Error("PRICE_OUT_OF_RANGE");
  return {
    unitPrice: Math.round(Number(basePrice)),
    estimatedPrice: Math.round(estimatedPrice),
  };
}

export function resolvePricingOptions(
  config: unknown,
  selections: Record<string, string>
): { valid: boolean; adjustment: number; resolved: ResolvedPricingOption[] } {
  const parsed = parseFullPricingConfig(config);
  const groups = parsed.optionGroups;
  const resolved: ResolvedPricingOption[] = [];
  for (const group of groups) {
    const selected = selections[group.key];
    if (!selected) {
      if (group.required) return { valid: false, adjustment: 0, resolved: [] };
      continue;
    }
    if (
      group.key === "run" &&
      selected === "__custom__" &&
      parsed.quantityRules.allowCustom
    ) {
      resolved.push({
        key: group.key,
        groupLabel: group.label,
        value: "__custom__",
        label: "تیراژ دلخواه",
        priceAdjustment: 0,
      });
      continue;
    }
    const option = group.options.find((entry) => entry.value === selected);
    if (!option) return { valid: false, adjustment: 0, resolved: [] };
    resolved.push({ ...option, key: group.key, groupLabel: group.label });
  }
  const knownKeys = new Set(groups.map((group) => group.key));
  if (Object.keys(selections).some((key) => !knownKeys.has(key)))
    return { valid: false, adjustment: 0, resolved: [] };
  return {
    valid: true,
    adjustment: resolved.reduce((sum, option) => sum + option.priceAdjustment, 0),
    resolved,
  };
}

export function resolvePricingQuantity(
  resolved: ResolvedPricingOption[],
  fallback: number
) {
  const run = resolved.find(
    (option) => option.key === "run" && /^\d{1,6}$/.test(option.value)
  );
  return run ? normalizeQuantity(run.value) ?? fallback : fallback;
}

export function quantityWithinConfiguredRange(config: unknown, quantity: number) {
  const rules = parseFullPricingConfig(config).quantityRules;
  return (
    Number.isSafeInteger(quantity) &&
    quantity >= rules.min &&
    quantity <= rules.max
  );
}

export const PRICING_LIMITS = {
  maxQuantity: MAX_QUANTITY,
  maxDimension: MAX_DIMENSION,
  maxPrice: MAX_PRICE,
} as const;

export const ORDER_ADDON_PRICES = {
  needsDesign: 500_000,
  needsInstallation: 1_800_000,
  needsPermitFollowup: 350_000,
} as const;
