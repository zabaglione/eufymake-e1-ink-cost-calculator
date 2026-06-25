const CARTRIDGE_ML = 100;
const STORAGE_KEY = "eufymake-e1-calculator-settings-v1";
const DEFAULT_PRESET_ID = "japan";
const PRICE_KEYS = ["c", "m", "y", "k", "wStandard", "g", "wSoft"];

const PRESETS = {
  japan: {
    label: "Japan",
    currency: "JPY",
    prices: {
      c: 4990,
      m: 4990,
      y: 4990,
      k: 4990,
      wStandard: 4990,
      g: 4990,
      wSoft: 13990 / 3,
    },
  },
  us: {
    label: "United States",
    currency: "USD",
    prices: {
      c: 42.99,
      m: 42.99,
      y: 42.99,
      k: 42.99,
      wStandard: 42.99,
      g: 42.99,
      wSoft: 99.99 / 3,
    },
  },
  uk: {
    label: "United Kingdom",
    currency: "GBP",
    prices: {
      c: 34.99,
      m: 34.99,
      y: 34.99,
      k: 34.99,
      wStandard: 34.99,
      g: 34.99,
      wSoft: 104 / 3,
    },
  },
  europe: {
    label: "Europe",
    currency: "EUR",
    prices: {
      c: 42.99,
      m: 42.99,
      y: 42.99,
      k: 42.99,
      wStandard: 42.99,
      g: 42.99,
      wSoft: 128 / 3,
    },
  },
  canada: {
    label: "Canada",
    currency: "CAD",
    prices: {
      c: 59.99,
      m: 59.99,
      y: 59.99,
      k: 59.99,
      wStandard: 59.99,
      g: 59.99,
      wSoft: 139 / 3,
    },
  },
  australia: {
    label: "Australia",
    currency: "AUD",
    prices: {
      c: 79.99,
      m: 79.99,
      y: 79.99,
      k: 79.99,
      wStandard: 79.99,
      g: 79.99,
      wSoft: 189 / 3,
    },
  },
};

const INKS = [
  { id: "c", label: "Cyan", short: "C", swatch: "#00a9d8" },
  { id: "m", label: "Magenta", short: "M", swatch: "#c23a8d" },
  { id: "y", label: "Yellow", short: "Y", swatch: "#e2b51e" },
  { id: "k", label: "Black", short: "K", swatch: "#272b2e" },
  { id: "w", label: "White", short: "W", swatch: "#f8f4e8", priceKey: "wStandard" },
  { id: "g", label: "Glossy", short: "G", swatch: "#76a6a9" },
];

const WHITE_TYPES = {
  standard: { label: "W Standard", priceKey: "wStandard" },
  soft: { label: "W Soft", priceKey: "wSoft" },
};

const SAMPLE_JOB = {
  copies: 1,
  ink: {
    c: 0.27,
    m: 0.33,
    y: 0.26,
    k: 0.23,
    w: 2.23,
    g: 0,
  },
};

const form = document.querySelector("#calculatorForm");
const inkInputs = document.querySelector("#inkInputs");
const priceInputs = document.querySelector("#priceInputs");
const totalPrice = document.querySelector("#totalPrice");
const unitPrice = document.querySelector("#unitPrice");
const totalMl = document.querySelector("#totalMl");
const averageCost = document.querySelector("#averageCost");
const breakdownRows = document.querySelector("#breakdownRows");
const copiesInput = document.querySelector("#copies");
const regionPreset = document.querySelector("#regionPreset");
const applyPresetDefaults = document.querySelector("#applyPresetDefaults");
const sampleJob = document.querySelector("#sampleJob");

const formatterCache = new Map();

function readNumber(selector, fallback = 0) {
  const element = typeof selector === "string" ? document.querySelector(selector) : selector;
  const value = Number.parseFloat(element.value);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function getWhiteType() {
  return document.querySelector("input[name='whiteType']:checked").value;
}

function getPriceKey(ink) {
  if (ink.id !== "w") {
    return ink.id;
  }

  return WHITE_TYPES[getWhiteType()].priceKey;
}

function getCurrentPreset() {
  return PRESETS[regionPreset.value] || PRESETS[DEFAULT_PRESET_ID];
}

function formatPriceInput(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getMoneyFormatter(currency, precise = false) {
  const digits = precise || currency !== "JPY" ? 2 : 0;
  const cacheKey = `${currency}-${digits}`;

  if (!formatterCache.has(cacheKey)) {
    formatterCache.set(
      cacheKey,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }),
    );
  }

  return formatterCache.get(cacheKey);
}

function formatMoney(value, precise = false) {
  return getMoneyFormatter(getCurrentPreset().currency, precise).format(value);
}

function createField({ label, id, value, suffix, swatch, className }) {
  const wrapper = document.createElement("label");
  wrapper.className = `field ${className || ""}`.trim();
  if (swatch) {
    wrapper.classList.add("ink-field");
    wrapper.style.setProperty("--swatch", swatch);
  }

  const text = document.createElement("span");
  text.textContent = label;

  const input = document.createElement("input");
  input.id = id;
  input.type = "number";
  input.inputMode = "decimal";
  input.min = "0";
  input.step = suffix === "ml" || suffix === "jpy" ? "0.01" : "1";
  input.value = value;

  wrapper.append(text, input);
  return wrapper;
}

function renderPresetOptions() {
  Object.entries(PRESETS).forEach(([id, preset]) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${preset.label} (${preset.currency})`;
    regionPreset.append(option);
  });
}

function renderInputs() {
  const defaultPrices = PRESETS[DEFAULT_PRESET_ID].prices;

  INKS.forEach((ink) => {
    inkInputs.append(
      createField({
        label: `${ink.short} ml`,
        id: `ink-${ink.id}`,
        value: "0",
        suffix: "ml",
        swatch: ink.swatch,
      }),
    );
  });

  const priceFields = [
    ...INKS.filter((ink) => ink.id !== "w").map((ink) => ({
      key: ink.id,
      label: `${ink.short} per 100 ml`,
      swatch: ink.swatch,
      value: defaultPrices[ink.id],
    })),
    {
      key: "wStandard",
      label: "W Standard per 100 ml",
      swatch: "#f8f4e8",
      value: defaultPrices.wStandard,
    },
    {
      key: "wSoft",
      label: "W Soft per 100 ml",
      swatch: "#bfe5d3",
      value: defaultPrices.wSoft,
    },
  ];

  priceFields.forEach((field) => {
    priceInputs.append(
      createField({
        label: field.label,
        id: `price-${field.key}`,
        value: formatPriceInput(field.value),
        suffix: "jpy",
        swatch: field.swatch,
      }),
    );
  });
}

function readPrices() {
  return PRICE_KEYS.reduce((prices, key) => {
    prices[key] = readNumber(`#price-${key}`);
    return prices;
  }, {});
}

function writePrices(prices) {
  PRICE_KEYS.forEach((key) => {
    const input = document.querySelector(`#price-${key}`);
    if (input && Number.isFinite(Number(prices[key]))) {
      input.value = formatPriceInput(Number(prices[key]));
    }
  });
}

function applyPresetPrices(presetId = regionPreset.value) {
  const preset = PRESETS[presetId] || PRESETS[DEFAULT_PRESET_ID];
  regionPreset.value = presetId in PRESETS ? presetId : DEFAULT_PRESET_ID;
  writePrices(preset.prices);
}

function saveSettings() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        presetId: regionPreset.value,
        whiteType: getWhiteType(),
        prices: readPrices(),
      }),
    );
  } catch (error) {
    return false;
  }

  return true;
}

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function restoreSettings() {
  const settings = loadSettings();
  if (!settings) {
    applyPresetPrices(DEFAULT_PRESET_ID);
    return;
  }

  regionPreset.value = settings.presetId in PRESETS ? settings.presetId : DEFAULT_PRESET_ID;
  if (settings.whiteType in WHITE_TYPES) {
    document.querySelector(`input[name='whiteType'][value='${settings.whiteType}']`).checked = true;
  }
  if (settings.prices) {
    writePrices({ ...getCurrentPreset().prices, ...settings.prices });
  } else {
    applyPresetPrices(regionPreset.value);
  }
}

function calculate() {
  const copies = readNumber(copiesInput, 1);
  const rows = INKS.map((ink) => {
    const ml = readNumber(`#ink-${ink.id}`) * copies;
    const price = readNumber(`#price-${getPriceKey(ink)}`);
    const cost = (ml / CARTRIDGE_ML) * price;

    return {
      ...ink,
      ml,
      cost,
      label: ink.id === "w" ? WHITE_TYPES[getWhiteType()].label : ink.label,
      swatch: ink.id === "w" && getWhiteType() === "soft" ? "#bfe5d3" : ink.swatch,
    };
  });

  const sumCost = rows.reduce((sum, row) => sum + row.cost, 0);
  const sumMl = rows.reduce((sum, row) => sum + row.ml, 0);
  const singlePrint = copies > 0 ? sumCost / copies : 0;
  const avgCost = sumMl > 0 ? sumCost / sumMl : 0;

  totalPrice.textContent = formatMoney(sumCost);
  unitPrice.textContent = `${formatMoney(singlePrint)} per print`;
  totalMl.textContent = `${sumMl.toFixed(2)} ml`;
  averageCost.textContent = formatMoney(avgCost, true);

  breakdownRows.replaceChildren(
    ...rows.map((row) => {
      const line = document.createElement("div");
      line.className = "breakdown-row";
      line.setAttribute("role", "row");
      line.style.setProperty("--swatch", row.swatch);

      const name = document.createElement("span");
      name.className = "ink-name";
      name.setAttribute("role", "cell");
      name.textContent = row.label;

      const ml = document.createElement("span");
      ml.setAttribute("role", "cell");
      ml.textContent = row.ml.toFixed(2);

      const cost = document.createElement("span");
      cost.setAttribute("role", "cell");
      cost.textContent = formatMoney(row.cost);

      line.append(name, ml, cost);
      return line;
    }),
  );
}

function applyDefaultPrices() {
  applyPresetPrices(regionPreset.value);
  calculate();
  saveSettings();
}

function applySample() {
  copiesInput.value = String(SAMPLE_JOB.copies);
  Object.entries(SAMPLE_JOB.ink).forEach(([id, value]) => {
    document.querySelector(`#ink-${id}`).value = String(value);
  });
  calculate();
}

renderInputs();
renderPresetOptions();
restoreSettings();
calculate();

form.addEventListener("input", () => {
  calculate();
  saveSettings();
});
form.addEventListener("reset", () => {
  window.setTimeout(() => {
    renderFreshDefaults();
    calculate();
    saveSettings();
  }, 0);
});
regionPreset.addEventListener("change", applyDefaultPrices);
applyPresetDefaults.addEventListener("click", applyDefaultPrices);
sampleJob.addEventListener("click", applySample);

function renderFreshDefaults() {
  regionPreset.value = DEFAULT_PRESET_ID;
  document.querySelector("input[name='whiteType'][value='standard']").checked = true;
  document.querySelectorAll("[id^='ink-']").forEach((input) => {
    input.value = "0";
  });
  applyPresetPrices(DEFAULT_PRESET_ID);
}
