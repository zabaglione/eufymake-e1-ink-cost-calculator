# eufymake-e1-ink-cost-calculator

A lightweight browser-based ink cost calculator for the eufyMake E1 UV printer.

Enter the estimated ink usage shown before printing, select the white ink type,
and the app calculates the total ink cost from per-cartridge prices.

## Features

- Supports C, M, Y, K, W, G, and W Soft ink cost calculation
- Includes regional price presets for Japan, United States, United Kingdom, Europe, Canada, and Australia
- Defaults to Japan pricing
- Stores the selected region, custom prices, and white ink type in `localStorage`
- Runs as a static site with no backend, login, or build step
- Works with GitHub Pages

## Usage

Open `index.html` in a browser, or publish the repository with GitHub Pages.

1. Choose a region preset.
2. Enter the estimated ink amount for each color in milliliters.
3. Select `W Standard` or `W Soft`.
4. Adjust prices manually if needed.

The app automatically remembers custom price settings in the same browser.

## Price Presets

The presets are based on publicly available store prices as of 2026-06-25.
Actual prices, discounts, tax handling, and availability may change.

W Soft prices are normalized to a per-100 ml value based on the available kit price.

## Privacy

This app does not use a server or account system. Saved settings are kept only in
the browser's `localStorage`.

## License

MIT License. See [LICENSE](LICENSE).
