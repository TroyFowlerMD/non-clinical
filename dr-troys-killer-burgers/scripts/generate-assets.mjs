import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

const root = process.cwd();
const sourceHero = path.join(root, "assets", "dr-troy-burger-hero-source.jpg");
const outputDir = path.join(root, "assets", "generated");
const canonicalUrl = "https://drtroyskillerburgers.vercel.app/";

await fs.mkdir(outputDir, { recursive: true });

const widths = [640, 960, 1280];

for (const width of widths) {
  await sharp(sourceHero)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(outputDir, `hero-${width}.webp`));

  await sharp(sourceHero)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .avif({ quality: 50, effort: 6 })
    .toFile(path.join(outputDir, `hero-${width}.avif`));
}

await sharp(sourceHero)
  .rotate()
  .resize({ width: 1280, withoutEnlargement: true })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(outputDir, "hero-1280.jpg"));

async function makeIcon(size, fileName) {
  const crop = await sharp(sourceHero)
    .rotate()
    .resize(size, size, { fit: "cover", position: "right" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#f3efe6"
    }
  })
    .composite([{ input: crop, left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(outputDir, fileName));
}

await makeIcon(192, "icon-192.png");
await makeIcon(512, "icon-512.png");
await makeIcon(192, "icon-maskable-192.png");
await makeIcon(512, "icon-maskable-512.png");
await makeIcon(180, "apple-touch-icon.png");

const qrSvg = await QRCode.toString(canonicalUrl, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 1,
  color: {
    dark: "#1f1f1f",
    light: "#ffffff"
  }
});

await fs.writeFile(path.join(outputDir, "qr-canonical.svg"), qrSvg, "utf8");

const metadata = await sharp(sourceHero).metadata();
console.log(
  `Generated hero, icons, and QR assets from ${metadata.width}x${metadata.height} source image.`
);
