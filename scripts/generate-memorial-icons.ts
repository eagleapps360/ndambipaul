import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const rootDir = process.cwd();
const projectSource = path.join(rootDir, "public/images/pa-ndambi-main-portrait.png");
const fallbackSource = "/mnt/data/WhatsApp_Image_2026-06-11_at_7.07.41_AM-removebg-preview.png";
const background = "#f8f7f3";
const gold = "#c9a44c";
const crop = { left: 28, top: 54, width: 280, height: 280 };
const logoCanvasSize = 1024;
const subjectSize = 852;
const subjectOffset = { left: 86, top: 86 };
const circleDiameter = 924;
const circleStroke = 22;

function makeCircleMaskSvg(size: number) {
  const radius = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white" />
    </svg>`,
  );
}

function makeCircleStrokeSvg(size: number, stroke: number) {
  const radius = size / 2 - stroke / 2;
  const half = size / 2;
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${half}" cy="${half}" r="${radius}" fill="none" stroke="${gold}" stroke-width="${stroke}" />
    </svg>`,
  );
}

function makeSquareBorderSvg(size: number, stroke: number) {
  const inset = stroke / 2;
  const rectSize = size - stroke;
  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${inset}" y="${inset}" width="${rectSize}" height="${rectSize}" rx="${size * 0.24}" fill="none" stroke="${gold}" stroke-width="${stroke}" />
    </svg>`,
  );
}

async function resolveSourceImage() {
  try {
    await stat(projectSource);
    return projectSource;
  } catch {
    await stat(fallbackSource);
    return fallbackSource;
  }
}

function buildIco(images: Array<{ size: number; data: Buffer }>) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const entries: Buffer[] = [];
  const payloads: Buffer[] = [];
  let offset = 6 + images.length * 16;

  for (const image of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 0);
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.data.length;
    entries.push(entry);
    payloads.push(image.data);
  }

  return Buffer.concat([header, ...entries, ...payloads]);
}

async function main() {
  const sourcePath = await resolveSourceImage();
  await mkdir(path.join(rootDir, "public/icons"), { recursive: true });

  const source = sharp(sourcePath).ensureAlpha();
  const extractedSubject = await source.extract(crop).resize(subjectSize, subjectSize, { fit: "contain", kernel: sharp.kernel.lanczos3 }).png().toBuffer();

  const squareLogo = await sharp({
    create: {
      width: logoCanvasSize,
      height: logoCanvasSize,
      channels: 4,
      background,
    },
  })
    .composite([{ input: extractedSubject, left: subjectOffset.left, top: subjectOffset.top }])
    .png()
    .toBuffer();

  const circleInterior = await sharp({
    create: {
      width: logoCanvasSize,
      height: logoCanvasSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${logoCanvasSize}" height="${logoCanvasSize}" viewBox="0 0 ${logoCanvasSize} ${logoCanvasSize}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${logoCanvasSize / 2}" cy="${logoCanvasSize / 2}" r="${circleDiameter / 2}" fill="${background}" />
          </svg>`,
        ),
      },
      { input: extractedSubject, left: subjectOffset.left, top: subjectOffset.top },
    ])
    .png()
    .toBuffer();

  const circleLogo = await sharp(circleInterior)
    .composite([{ input: makeCircleMaskSvg(logoCanvasSize), blend: "dest-in" }, { input: makeCircleStrokeSvg(logoCanvasSize, circleStroke) }])
    .png()
    .toBuffer();

  const iconMaster = await sharp({
    create: {
      width: logoCanvasSize,
      height: logoCanvasSize,
      channels: 4,
      background,
    },
  })
    .composite([
      { input: circleInterior },
      { input: makeCircleStrokeSvg(logoCanvasSize, circleStroke) },
      { input: makeSquareBorderSvg(logoCanvasSize, 18) },
    ])
    .png()
    .toBuffer();

  const outputs = [
    { file: "public/images/pa-ndambi-logo-square.png", buffer: squareLogo },
    { file: "public/images/pa-ndambi-logo-circle.png", buffer: circleLogo },
    { file: "public/icons/icon-512.png", buffer: await sharp(iconMaster).resize(512, 512).png().toBuffer() },
    { file: "public/icons/icon-192.png", buffer: await sharp(iconMaster).resize(192, 192).png().toBuffer() },
    { file: "public/icons/apple-touch-icon.png", buffer: await sharp(iconMaster).resize(180, 180).png().toBuffer() },
    { file: "app/icon.png", buffer: await sharp(iconMaster).resize(512, 512).png().toBuffer() },
    { file: "app/apple-icon.png", buffer: await sharp(iconMaster).resize(180, 180).png().toBuffer() },
  ];

  for (const output of outputs) {
    await writeFile(path.join(rootDir, output.file), output.buffer);
  }

  const faviconImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      data: await sharp(iconMaster).resize(size, size).png().toBuffer(),
    })),
  );
  await writeFile(path.join(rootDir, "app/favicon.ico"), buildIco(faviconImages));

  console.log(
    JSON.stringify(
      {
        sourcePath,
        crop,
        generatedFiles: outputs.map((output) => output.file).concat("app/favicon.ico"),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
