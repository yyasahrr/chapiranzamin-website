import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePrice,
  normalizePositiveNumber,
  normalizeQuantity,
  parsePricingConfig,
  resolvePricingOptions,
  resolveFieldPrice,
  calculateConfiguredPrice,
  resolvePricingQuantity,
  quantityWithinConfiguredRange,
} from "../src/lib/pricing.ts";

test("fixed pricing returns the configured amount", () => {
  assert.deepEqual(
    calculatePrice("fixed", "2500000", {
      quantity: 4,
      width: null,
      height: null,
      dimensionUnit: "cm",
    }),
    { unitPrice: 2_500_000, estimatedPrice: 2_500_000 }
  );
});

test("business card options produce 5000 one-sided and 7000 two-sided", () => {
  const config = {
    optionGroups: [
      {
        key: "stock",
        label: "نوع کارت",
        required: true,
        options: [{ value: "glossy", label: "گلاسه", priceAdjustment: 0 }],
      },
      {
        key: "sides",
        label: "نوع چاپ",
        required: true,
        options: [
          { value: "one", label: "یک‌رو", priceAdjustment: 0 },
          { value: "two", label: "دورو", priceAdjustment: 2000 },
        ],
      },
    ],
  };
  assert.equal(parsePricingConfig(config).length, 2);
  const one = resolvePricingOptions(config, { stock: "glossy", sides: "one" });
  const two = resolvePricingOptions(config, { stock: "glossy", sides: "two" });
  assert.equal(one.valid, true);
  assert.equal(two.adjustment, 2000);
  const input = { quantity: 1, width: null, height: null, dimensionUnit: "cm" as const };
  assert.equal(calculatePrice("fixed", 5000, input, one.adjustment).estimatedPrice, 5000);
  assert.equal(calculatePrice("fixed", 5000, input, two.adjustment).estimatedPrice, 7000);
});

test("business card run selection prices all 5000 cards", () => {
  const config = {
    optionGroups: [
      {
        key: "stock",
        label: "جنس",
        required: true,
        options: [{ value: "linen", label: "کتان", priceAdjustment: 3000 }],
      },
      {
        key: "run",
        label: "تیراژ",
        required: true,
        options: [{ value: "5000", label: "۵۰۰۰ عدد", priceAdjustment: 0 }],
      },
      {
        key: "sides",
        label: "چاپ",
        required: true,
        options: [{ value: "one", label: "یک‌رو", priceAdjustment: 0 }],
      },
    ],
  };
  const resolved = resolvePricingOptions(config, {
    stock: "linen",
    run: "5000",
    sides: "one",
  });
  const quantity = resolvePricingQuantity(resolved.resolved, 1);
  assert.equal(quantity, 5000);
  assert.equal(
    calculateConfiguredPrice(
      "per_item",
      5000,
      { quantity, width: null, height: null, dimensionUnit: "cm" },
      config,
      resolved.adjustment
    ).estimatedPrice,
    40_000_000
  );
});

test("custom run is allowed only inside the configured quantity range", () => {
  const config = JSON.stringify({
    quantityRules: { min: 100, max: 10_000, allowCustom: true },
    optionGroups: [
      {
        key: "run",
        label: "تیراژ",
        required: true,
        options: [{ value: "1000", label: "۱۰۰۰", priceAdjustment: 0 }],
      },
    ],
  });
  const custom = resolvePricingOptions(config, { run: "__custom__" });
  assert.equal(custom.valid, true);
  assert.equal(resolvePricingQuantity(custom.resolved, 750), 750);
  assert.equal(quantityWithinConfiguredRange(config, 750), true);
  assert.equal(quantityWithinConfiguredRange(config, 99), false);
  assert.equal(quantityWithinConfiguredRange(config, 10_001), false);
});

test("pricing options reject missing, unknown, and injected selections", () => {
  const config = {
    optionGroups: [{
      key: "sides",
      label: "نوع چاپ",
      required: true,
      options: [{ value: "two", label: "دورو", priceAdjustment: 2000 }],
    }],
  };
  assert.equal(resolvePricingOptions(config, {}).valid, false);
  assert.equal(resolvePricingOptions(config, { sides: "fake" }).valid, false);
  assert.equal(resolvePricingOptions(config, { sides: "two", price: "-9999" }).valid, false);
});

test("installation and permit are trusted flat adjustments", () => {
  const config = {
    optionGroups: [],
    fieldPrices: { installation: 1_800_000, permit: 350_000 },
  };
  const adjustment = resolveFieldPrice(config, {
    requiresInstallationTeam: true,
    requiresPermit: true,
  });
  assert.equal(adjustment, 2_150_000);
  assert.equal(
    calculatePrice(
      "per_item",
      5_000,
      { quantity: 2, width: null, height: null, dimensionUnit: "cm" },
      2_000,
      adjustment
    ).estimatedPrice,
    2_164_000
  );
});

test("installation is never silently free when no custom price exists", () => {
  assert.equal(
    resolveFieldPrice({}, { requiresInstallationTeam: true }),
    1_800_000
  );
});

test("combined factors price quantity, area, material, installation and permit", () => {
  const config = {
    optionGroups: [],
    fieldPrices: { installation: 0, permit: 0 },
    calculationFactors: {
      quantity: { enabled: true, price: 1_000 },
      area: { enabled: true, price: 50_000 },
      material: { enabled: true, price: 20_000 },
      installation: { enabled: true, price: 100_000 },
      permit: { enabled: true, price: 30_000 },
    },
  };
  const result = calculateConfiguredPrice(
    "fixed",
    10_000,
    {
      quantity: 2,
      width: 200,
      height: 100,
      dimensionUnit: "cm",
      material: "وینیل",
      requiresInstallationTeam: true,
      requiresPermit: true,
    },
    config,
    5_000
  );
  // 10k base + 5k option + 2k quantity + 200k area + 20k material + 100k install + 30k permit
  assert.equal(result.estimatedPrice, 367_000);
});

test("per item pricing multiplies by quantity", () => {
  assert.equal(
    calculatePrice("per_item", 85_000, {
      quantity: 100,
      width: null,
      height: null,
      dimensionUnit: "cm",
    }).estimatedPrice,
    8_500_000
  );
});

test("square meter pricing converts centimeters", () => {
  assert.equal(
    calculatePrice("per_sqm", 200_000, {
      quantity: 2,
      width: 200,
      height: 100,
      dimensionUnit: "cm",
    }).estimatedPrice,
    800_000
  );
});

test("quote pricing never exposes an invented estimate", () => {
  assert.deepEqual(
    calculatePrice("quote", 999_999, {
      quantity: 1,
      width: 1,
      height: 1,
      dimensionUnit: "m",
    }),
    { unitPrice: 0, estimatedPrice: 0 }
  );
});

test("numeric input rejects unsafe, negative and excessive values", () => {
  assert.equal(normalizeQuantity(0), null);
  assert.equal(normalizeQuantity(1.5), null);
  assert.equal(normalizeQuantity(100_001), null);
  assert.equal(normalizeQuantity(10), 10);
  assert.equal(normalizePositiveNumber("Infinity", 100), null);
  assert.equal(normalizePositiveNumber(-1, 100), null);
  assert.equal(normalizePositiveNumber(101, 100), null);
  assert.equal(normalizePositiveNumber("12.5", 100), 12.5);
});
