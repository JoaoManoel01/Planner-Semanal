import fs from "node:fs/promises";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svg = await fs.readFile("build/icon.svg");

const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngs = await Promise.all(
  sizes.map(size => sharp(svg).resize(size, size).png().toBuffer())
);

const ico = await pngToIco(pngs);
await fs.writeFile("build/icon.ico", ico);

const png512 = await sharp(svg).resize(512, 512).png().toBuffer();
await fs.writeFile("build/icon.png", png512);

console.log("Ícones gerados: build/icon.ico e build/icon.png");
