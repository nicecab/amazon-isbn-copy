# Amazon ISBN Copy

A Chrome extension that copies the ISBN-13 of a book on an Amazon product page to the clipboard with one click.

Supported sites: amazon.co.jp, amazon.com, amazon.co.uk

## Install

1. Clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repository directory.

## Usage

Open a book's product page and click the extension icon in the toolbar. The ISBN-13 from the product details is copied to the clipboard.

After a successful copy, a small "Copy success!" badge appears in the top-right corner for 2.5 seconds.

After editing the source, click the reload button for the extension on `chrome://extensions`, then reload the Amazon page.

## Development

Node.js and pnpm versions are pinned in `mise.toml`.

```bash
mise install
pnpm install
pnpm lint      # oxfmt --check and oxlint
pnpm lint:fix  # apply formatting and lint fixes
pnpm test      # Vitest with jsdom
```

## Files

- `manifest.json`: extension manifest (Manifest V3)
- `background.js`: service worker; sends a copy request to the active tab when the icon is clicked
- `content.js`: content script; reads the ISBN-13 via XPath and writes it to the clipboard

## Icon

Generated with Canva (https://www.canva.com/) `Text to Image` app.

## License

[MIT](LICENSE)
