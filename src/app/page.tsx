"use client";

import { useState } from "react";
import livePrices from "@/data/live-prices.json";
import { defaultKeywords, siteDescription, siteName, siteUrl } from "@/lib/site";

type CategoryId = "cpu" | "motherboard" | "gpu" | "ram" | "ssd" | "cooler" | "psu" | "case";
type MarketId = "amazon" | "joybuy" | "aliexpress" | "bestbuy" | "official";

type Offer = {
  id: string;
  market: MarketId;
  title: string;
  price: number;
  currency: "USD" | "GBP" | "EUR";
  note: string;
  url: string;
};

type Part = {
  id: string;
  category: CategoryId;
  name: string;
  brand: string;
  summary: string;
  tags: string[];
  specs: Record<string, number | string | string[]>;
  offers: Offer[];
};

type Preset = {
  id: string;
  name: string;
  parts: Record<CategoryId, string>;
};

type LivePriceEntry = {
  price: number;
  currency: Offer["currency"];
  note: string;
  checkedAt: string;
  url: string;
  autoRefresh: boolean;
  lastError?: string;
};

const usdToGbp = 0.7465;
const eurToGbp = 0.8575;
const baseSnapshotDate = "2026-04-09";
const livePriceFeed = livePrices as { lastCheckedAt: string; offers: Record<string, LivePriceEntry> };
const snapshotDate = livePriceFeed.lastCheckedAt?.slice(0, 10) || baseSnapshotDate;

const marketMeta: Record<MarketId, { label: string; color: string }> = {
  amazon: { label: "Amazon", color: "#ffb703" },
  joybuy: { label: "Joybuy", color: "#8be0d2" },
  aliexpress: { label: "AliExpress", color: "#ff6b35" },
  bestbuy: { label: "Best Buy", color: "#7bd1ff" },
  official: { label: "Фирменный магазин", color: "#8da9c4" },
};

const categories: { id: CategoryId; title: string; description: string }[] = [
  { id: "cpu", title: "Процессор", description: "Добавлены популярные DIY-процессоры AMD Ryzen и Intel Core / Core Ultra для игр, творчества и универсальных сборок." },
  { id: "motherboard", title: "Материнская плата", description: "Добавлены материнские платы для платформ AM5, LGA1700 и LGA1851, чтобы можно было свободно выбирать решения AMD или Intel." },
  { id: "gpu", title: "Видеокарта", description: "Расширен список популярных видеокарт MSI, ASUS, Gigabyte, Palit, GALAX и других брендов — от 1080p до 4K." },
  { id: "ram", title: "Оперативная память", description: "Добавлены популярные комплекты DDR5 от Corsair, Crucial, Kingston и G.SKILL, сочетающие цену и внешний вид." },
  { id: "ssd", title: "SSD-накопитель", description: "Добавлены распространённые NVMe SSD от Samsung, WD, Crucial, Lexar и других брендов, включая варианты PCIe 4.0 и Gen5." },
  { id: "cooler", title: "Охлаждение", description: "Добавлены 360-мм СЖО и популярные красивые решения охлаждения с указанием поддержки AM5, LGA1700 и LGA1851." },
  { id: "psu", title: "Блок питания", description: "Добавлены блоки питания от 550W до 850W для сборок от начального до высокопроизводительного уровня." },
  { id: "case", title: "Корпус", description: "Добавлены популярные корпуса MSI, NZXT, Lian Li и других брендов с хорошим воздушным потоком, чтобы удобно подбирать их по форм-фактору платы и длине видеокарты." },
];

const catalogParts: Part[] = [
  {
    id: "cpu-9600",
    category: "cpu",
    name: "Ryzen 5 9600",
    brand: "AMD",
    summary: "Шестиядерный процессор AM5 среднего бюджета, хорошо подходящий для игровых сборок в 1080p / 1440p.",
    tags: ["AM5", "6 ядер", "65W"],
    specs: { socket: "AM5", tdp: 65 },
    offers: [
      {
        id: "cpu-9600-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 199,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10040765",
      },
    ],
  },
  {
    id: "cpu-7800x3d",
    category: "cpu",
    name: "Ryzen 7 7800X3D",
    brand: "AMD",
    summary: "Классический игровой CPU с 8 ядрами и 16 потоками, который до сих пор остаётся популярным выбором с отличным соотношением цены и производительности.",
    tags: ["AM5", "8 ядер", "120W"],
    specs: { socket: "AM5", tdp: 120 },
    offers: [
      {
        id: "cpu-7800x3d-amazon",
        market: "amazon",
        title: "Отслеживание цены",
        price: 384,
        currency: "USD",
        note: "Снимок Camel",
        url: "https://camelcamelcamel.com/popular?bn=electronics&deal=0&p=1",
      },
      {
        id: "cpu-7800x3d-aliexpress",
        market: "aliexpress",
        title: "Снимок цены на площадке",
        price: 323.96,
        currency: "USD",
        note: "PriceArchive",
        url: "https://no.pricearchive.org/aliexpress.com/item/1005009732232580",
      },
    ],
  },
  {
    id: "cpu-9700x",
    category: "cpu",
    name: "Ryzen 7 9700X",
    brand: "AMD",
    summary: "Новое поколение 8-ядерного Ryzen, подходящее для многозадачности, творчества и игр с высокой частотой кадров.",
    tags: ["AM5", "8 ядер", "65W"],
    specs: { socket: "AM5", tdp: 65 },
    offers: [
      {
        id: "cpu-9700x-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 295.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10040779",
      },
    ],
  },
  {
    id: "cpu-9800x3d",
    category: "cpu",
    name: "Ryzen 7 9800X3D",
    brand: "AMD",
    summary: "Более продвинутый игровой процессор серии X3D, хорошо подходящий для связки с видеокартами высокого класса.",
    tags: ["AM5", "8 ядер", "Высокий класс"],
    specs: { socket: "AM5", tdp: 120 },
    offers: [
      {
        id: "cpu-9800x3d-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 419.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10040780",
      },
      {
        id: "cpu-9800x3d-amazon",
        market: "amazon",
        title: "Отслеживание цены",
        price: 419.95,
        currency: "USD",
        note: "Снимок Camel",
        url: "https://camelcamelcamel.com/popular?deal=0",
      },
    ],
  },
  {
    id: "cpu-14600k",
    category: "cpu",
    name: "Core i5-14600K",
    brand: "Intel",
    summary: "Популярный процессор Intel среднего-высокого уровня, подходящий для игр и смешанных задач вроде стриминга.",
    tags: ["LGA1700", "14 ядер", "125W"],
    specs: { socket: "LGA1700", tdp: 125 },
    offers: [
      {
        id: "cpu-14600k-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 259.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/intel-core-i5-14600k-14th-gen-14-core-20-thread-4-0ghz-5-3ghz-turbo-socket-lga-1700-unlocked-desktop-processor-multi/JXZRJ55778/sku/6560423",
      },
    ],
  },
  {
    id: "cpu-265k",
    category: "cpu",
    name: "Core Ultra 7 265K",
    brand: "Intel",
    summary: "Высокопроизводительный процессор для платформы LGA1851, подходящий для новых платформ и производительных рабочих сборок.",
    tags: ["LGA1851", "20 ядер", "125W"],
    specs: { socket: "LGA1851", tdp: 125 },
    offers: [
      {
        id: "cpu-265k-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 399.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/intel-core-ultra-7-265k-20-cores-20-threads-4-6ghz-5-5-ghz-turbo-socket-lga-1851-unlocked-desktop-processor-multi/JXZRJ5534X/sku/6602214",
      },
    ],
  },
  {
    id: "mobo-b650",
    category: "motherboard",
    name: "MAG B650 Tomahawk WIFI",
    brand: "MSI",
    summary: "Очень распространённая ATX-плата для платформы AM5, хорошо подходящая для сбалансированных сборок.",
    tags: ["AM5", "ATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b650-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 153.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-mag-b650-tomahawk-wifi-amd/10369430",
      },
    ],
  },
  {
    id: "mobo-b850",
    category: "motherboard",
    name: "B850 Gaming Plus WIFI6E",
    brand: "MSI",
    summary: "Более современная материнская плата AM5, хорошо подходящая для сборок на Ryzen 9000.",
    tags: ["AM5", "ATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b850-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 129.98,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-b850-gaming-plus-wifi6e-moederbord/10368777",
      },
    ],
  },
  {
    id: "mobo-colorful-b650me",
    category: "motherboard",
    name: "BATTLE-AX B650M-E WIFI V14",
    brand: "Colorful",
    summary: "Более бюджетная материнская плата AM5 формата mATX, подходящая для снижения общей стоимости сборки.",
    tags: ["AM5", "mATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "mATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-colorful-b650me-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 99.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10038553",
      },
    ],
  },
  {
    id: "mobo-colorful-frozen",
    category: "motherboard",
    name: "CVN B650M GAMING FROZEN V14",
    brand: "Colorful",
    summary: "Эффектная белая материнская плата AM5, хорошо подходящая для белых тематических корпусов.",
    tags: ["AM5", "mATX", "DDR5", "Белая"],
    specs: { socket: "AM5", formFactor: "mATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-colorful-frozen-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 129.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10038549",
      },
    ],
  },
  {
    id: "mobo-z790",
    category: "motherboard",
    name: "Z790 Gaming Plus WIFI",
    brand: "MSI",
    summary: "Популярная DDR5-плата для LGA1700, хорошо подходящая для i5-14600K и других востребованных процессоров Intel.",
    tags: ["LGA1700", "ATX", "DDR5"],
    specs: { socket: "LGA1700", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-z790-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 189.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/msi-z790-gaming-plus-wifi-socket-lga-1700-intel-z790-atx-ddr5-wi-fi-6e-motherboard-black/10734966.p?skuId=10734966",
      },
    ],
  },
  {
    id: "mobo-b860",
    category: "motherboard",
    name: "B860M Gaming X WIFI6E DDR5",
    brand: "Gigabyte",
    summary: "Материнская плата mATX для платформы Core Ultra, подходящая для более новых DIY-сборок на Intel.",
    tags: ["LGA1851", "mATX", "DDR5"],
    specs: { socket: "LGA1851", formFactor: "mATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b860-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 185,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10369387",
      },
    ],
  },
  {
    id: "gpu-5060-msi",
    category: "gpu",
    name: "GeForce RTX 5060 8G VENTUS 2X OC",
    brand: "MSI",
    summary: "Популярная двухвентиляторная видеокарта для 1080p / 1440p, подходящая для сбалансированных сборок.",
    tags: ["8GB", "145W", "Два вентилятора"],
    specs: { boardPower: 145, lengthMm: 227 },
    offers: [
      {
        id: "gpu-5060-msi-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 259.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-geforce-rtx-5060-8g-ventus/10369534",
      },
    ],
  },
  {
    id: "gpu-5060ti-galax",
    category: "gpu",
    name: "RTX 5060 Ti 8GB 二手渠道价",
    brand: "GALAX",
    summary: "Используется для сравнения цен на вторичном рынке и подходит как ориентир для бюджетных сборок.",
    tags: ["8GB", "180W", "Б/у"],
    specs: { boardPower: 180, lengthMm: 250 },
    offers: [
      {
        id: "gpu-5060ti-galax-aliexpress",
        market: "aliexpress",
        title: "Снимок цены на площадке",
        price: 230.12,
        currency: "USD",
        note: "PriceArchive",
        url: "https://www.pricearchive.org/aliexpress.com/item/1005009678410256",
      },
    ],
  },
  {
    id: "gpu-5060-palit",
    category: "gpu",
    name: "GeForce RTX 5060 Dual 8GB GDDR7",
    brand: "Palit",
    summary: "Ещё один распространённый вариант новой видеокарты начального уровня, подходящий для бюджетных игровых сборок.",
    tags: ["8GB", "145W", "Dual"],
    specs: { boardPower: 145, lengthMm: 249 },
    offers: [
      {
        id: "gpu-5060-palit-joybuy",
        market: "joybuy",
        title: "Снимок акционной цены",
        price: 291.99,
        currency: "GBP",
        note: "Акционная страница Joybuy",
        url: "https://www.joybuy.co.uk/cms/unleash-the-ultimate-gaming-power",
      },
    ],
  },
  {
    id: "gpu-5070-gigabyte",
    category: "gpu",
    name: "GeForce RTX 5070 WINDFORCE OC SFF 12G",
    brand: "Gigabyte",
    summary: "Популярная видеокарта, лучше подходящая для 1440p на высоких настройках, при этом более удобная по длине.",
    tags: ["12GB", "250W", "SFF"],
    specs: { boardPower: 250, lengthMm: 282 },
    offers: [
      {
        id: "gpu-5070-gigabyte-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 508.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10425580",
      },
    ],
  },
  {
    id: "gpu-5070-msi",
    category: "gpu",
    name: "GeForce RTX 5070 12G GAMING TRIO OC",
    brand: "MSI",
    summary: "Трёхвентиляторная видеокарта среднего-высокого уровня для 1440p / 4K, подходящая для производительных систем.",
    tags: ["12GB", "250W", "Три вентилятора"],
    specs: { boardPower: 250, lengthMm: 338 },
    offers: [
      {
        id: "gpu-5070-msi-joybuy",
        market: "joybuy",
        title: "Снимок акционной цены",
        price: 655,
        currency: "GBP",
        note: "Акционная страница Joybuy",
        url: "https://www.joybuy.co.uk/cms/unleash-the-ultimate-gaming-power",
      },
    ],
  },
  {
    id: "gpu-5070ti-asus",
    category: "gpu",
    name: "TUF Gaming GeForce RTX 5070 Ti OC 16GB",
    brand: "ASUS",
    summary: "Видеокарта более высокого класса с 16GB памяти, подходящая для высокоуровневых игровых систем в 1440p и 4K.",
    tags: ["16GB", "300W", "TUF"],
    specs: { boardPower: 300, lengthMm: 329 },
    offers: [
      {
        id: "gpu-5070ti-asus-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 1037.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/asus-tuf-gaming-nvidia-geforce-rtx-5070-ti-oc-edition-16gb-gddr7-pci-express-5-0-graphics-card-black/6614743/openbox",
      },
    ],
  },
  {
    id: "ram-crucial",
    category: "ram",
    name: "Crucial Pro DDR5 32GB 6000",
    brand: "Crucial",
    summary: "Комплект 32GB DDR5 с хорошим соотношением цены и качества, подходящий для сборок с упором на бюджет.",
    tags: ["32GB", "DDR5-6000"],
    specs: { memoryType: "DDR5" },
    offers: [
      {
        id: "ram-crucial-aliexpress",
        market: "aliexpress",
        title: "Снимок цены на площадке",
        price: 53.79,
        currency: "USD",
        note: "PriceArchive",
        url: "https://www.pricearchive.org/aliexpress.com/item/1005009608027098",
      },
    ],
  },
  {
    id: "ram-corsair",
    category: "ram",
    name: "Vengeance RGB DDR5 32GB 6000",
    brand: "Corsair",
    summary: "Очень распространённая RGB-память среднего класса, хорошо подходящая для эффектных сборок.",
    tags: ["32GB", "DDR5-6000", "RGB"],
    specs: { memoryType: "DDR5" },
    offers: [
      {
        id: "ram-corsair-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 436.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/memory/cmh32gx5m2b6000c40/vengeance-rgb-32gb-2x16gb-ddr5-dram-6000mhz-c40-memory-kit-black-cmh32gx5m2b6000c40",
      },
    ],
  },
  {
    id: "ram-kingston",
    category: "ram",
    name: "FURY Beast RGB DDR5 32GB 6000",
    brand: "Kingston",
    summary: "Популярный игровой комплект RGB-памяти, подходящий как для платформ Intel, так и AMD.",
    tags: ["32GB", "DDR5-6000", "RGB"],
    specs: { memoryType: "DDR5" },
    offers: [
      {
        id: "ram-kingston-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 474.21,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/kingston-fury-beast-32gb-2x16gb-6000mt-s-ddr5-cl30-rgb-expo-dimm-desktop-memory-black/JCKR7VQLZ2/sku/6593818",
      },
    ],
  },
  {
    id: "ram-gskill",
    category: "ram",
    name: "Trident Z5 Neo RGB DDR5 32GB 6000",
    brand: "G.SKILL",
    summary: "Популярная премиальная RGB-память, часто используемая в высокопроизводительных сборках на Ryzen.",
    tags: ["32GB", "DDR5-6000", "EXPO"],
    specs: { memoryType: "DDR5" },
    offers: [
      {
        id: "ram-gskill-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 538.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/g-skill-trident-z5-neo-rgb-ddr5-6000-32gb-2x16gb-amd-expo-ram-black/J36V4SLWGX/sku/11247645",
      },
    ],
  },
  {
    id: "ssd-990pro",
    category: "ssd",
    name: "990 PRO 1TB",
    brand: "Samsung",
    summary: "Классический высокопроизводительный SSD PCIe 4.0, хорошо подходящий для игр и системного диска.",
    tags: ["1TB", "PCIe 4.0"],
    specs: { capacityTb: 1 },
    offers: [
      {
        id: "ssd-990pro-amazon",
        market: "amazon",
        title: "Отслеживание цены",
        price: 199.99,
        currency: "USD",
        note: "Снимок Camel",
        url: "https://camelcamelcamel.com/popular?bn=electronics&deal=0&p=1",
      },
    ],
  },
  {
    id: "ssd-t500",
    category: "ssd",
    name: "T500 2TB",
    brand: "Crucial",
    summary: "Популярный SSD PCIe 4.0 на 2TB, хорошо подходящий для библиотеки игр и крупных рабочих файлов.",
    tags: ["2TB", "PCIe 4.0"],
    specs: { capacityTb: 2 },
    offers: [
      {
        id: "ssd-t500-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 244.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/crucial-t500-2tb-internal-ssd-pcie-gen-4x4-nvme-m-2/JX8PSKCCKY/sku/6566097",
      },
    ],
  },
  {
    id: "ssd-sn850x",
    category: "ssd",
    name: "WD_BLACK SN850X 2TB",
    brand: "Western Digital",
    summary: "Очень распространённый NVMe SSD на 2TB для игровых сборок, сочетающий вместимость и высокую скорость.",
    tags: ["2TB", "PCIe 4.0"],
    specs: { capacityTb: 2 },
    offers: [
      {
        id: "ssd-sn850x-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 369.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/searchpage.jsp?id=pcat17071&st=wd_black+sn850x+2tb",
      },
    ],
  },
  {
    id: "ssd-arespro",
    category: "ssd",
    name: "ARES PRO 2TB Gen5 NVMe",
    brand: "Lexar",
    summary: "Более премиальный Gen5 SSD, подходящий для конфигураций с упором на максимальную последовательную скорость.",
    tags: ["2TB", "Gen5"],
    specs: { capacityTb: 2 },
    offers: [
      {
        id: "ssd-arespro-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 249.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/lexar-ares-pro-2tb-gen5-nvme/10498802",
      },
    ],
  },
  {
    id: "cooler-msi",
    category: "cooler",
    name: "MAG CoreLiquid I360",
    brand: "MSI",
    summary: "Распространённая 360-мм система жидкостного охлаждения, подходящая для мощных видеокарт и CPU с высоким тепловыделением.",
    tags: ["360-мм СЖО", "ARGB"],
    specs: { supportedSockets: ["AM5", "LGA1700", "LGA1851"], radiatorMm: 360 },
    offers: [
      {
        id: "cooler-msi-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 94.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-mag-coreliquid-i360-computer-case/10368873",
      },
    ],
  },
  {
    id: "cooler-thermalright",
    category: "cooler",
    name: "Levita Vision 360",
    brand: "Thermalright",
    summary: "Вариант 360-мм СЖО с ценой с AliExpress, хорошо подходящий для белых и панорамных корпусов.",
    tags: ["360-мм СЖО", "LCD"],
    specs: { supportedSockets: ["AM5", "LGA1700"], radiatorMm: 360 },
    offers: [
      {
        id: "cooler-thermalright-aliexpress",
        market: "aliexpress",
        title: "Снимок цены на площадке",
        price: 256.63,
        currency: "USD",
        note: "PriceArchive",
        url: "https://ms.pricearchive.org/aliexpress.com/item/1005010588582324",
      },
    ],
  },
  {
    id: "cooler-corsair",
    category: "cooler",
    name: "iCUE LINK H150i RGB",
    brand: "Corsair",
    summary: "Премиальная 360-мм СЖО, подходящая для эффектной подсветки и платформ Intel / AMD среднего и высокого уровня.",
    tags: ["360-мм СЖО", "RGB"],
    specs: { supportedSockets: ["AM5", "LGA1700", "LGA1851"], radiatorMm: 360 },
    offers: [
      {
        id: "cooler-corsair-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 239.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/cpu-coolers/cw-9061008-ww/icue-link-h150i-rgb-liquid-cpu-cooler-cw-9061008-ww",
      },
    ],
  },
  {
    id: "cooler-nzxt",
    category: "cooler",
    name: "Kraken 360 RGB",
    brand: "NZXT",
    summary: "Популярная красивая 360-мм СЖО, хорошо подходящая для дорогих демонстрационных корпусов.",
    tags: ["360-мм СЖО", "LCD", "RGB"],
    specs: { supportedSockets: ["AM5", "LGA1700", "LGA1851"], radiatorMm: 360 },
    offers: [
      {
        id: "cooler-nzxt-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 219.99,
        currency: "USD",
        note: "Официальный магазин NZXT",
        url: "https://nzxt.com/en-US/product/kraken-360-rgb",
      },
    ],
  },
  {
    id: "psu-550",
    category: "psu",
    name: "MAG A550BN",
    brand: "MSI",
    summary: "Распространённый блок питания на 550W для начальных сборок, подходящий для бюджетных конфигураций с не слишком прожорливыми видеокартами.",
    tags: ["550W", "80 Plus"],
    specs: { wattage: 550 },
    offers: [
      {
        id: "psu-550-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 44.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-550w-atx-standard-power-supply/10368857",
      },
    ],
  },
  {
    id: "psu-650",
    category: "psu",
    name: "MAG A650GL",
    brand: "MSI",
    summary: "Распространённый полностью модульный блок питания на 650W для систем среднего уровня.",
    tags: ["650W", "Полностью модульный"],
    specs: { wattage: 650 },
    offers: [
      {
        id: "psu-650-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 69.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-650w-atx-fully-modular-power/10369658",
      },
    ],
  },
  {
    id: "psu-750",
    category: "psu",
    name: "MAG A750GL PCIE5",
    brand: "MSI",
    summary: "Надёжный вариант на 750W для систем с видеокартами уровня RTX 5070.",
    tags: ["750W", "ATX 3.0"],
    specs: { wattage: 750 },
    offers: [
      {
        id: "psu-750-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 99.98,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-750w-atx-fully-modular-power/10368859",
      },
    ],
  },
  {
    id: "psu-850-white",
    category: "psu",
    name: "MAG A850GL PCIE5 WHITE",
    brand: "MSI",
    summary: "Блок питания на 850W для белых тематических корпусов и конфигураций с мощными видеокартами.",
    tags: ["850W", "ATX 3.0", "Белый"],
    specs: { wattage: 850 },
    offers: [
      {
        id: "psu-850-white-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 109.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-850w-atx-fully-modular-power/10368861",
      },
    ],
  },
  {
    id: "psu-rm850e",
    category: "psu",
    name: "RM850e",
    brand: "Corsair",
    summary: "Популярный блок питания Corsair на 850W, хорошо подходящий для производительных конфигураций Intel и AMD.",
    tags: ["850W", "ATX 3.1"],
    specs: { wattage: 850 },
    offers: [
      {
        id: "psu-rm850e-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 124.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/psu/cp-9020296-na/rme-series-rm850e-fully-modular-low-noise-atx-power-supply-cp-9020296-na",
      },
    ],
  },
  {
    id: "case-forge",
    category: "case",
    name: "MAG Forge 120A Airflow",
    brand: "MSI",
    summary: "Популярный корпус начального уровня с хорошим воздушным потоком, подходящий для бюджетных ATX / mATX DIY-сборок.",
    tags: ["ATX", "Воздушный поток"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 330, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-forge-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 47.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/msi-mag-forge-120a-airflow-midi/10369706",
      },
    ],
  },
  {
    id: "case-velox",
    category: "case",
    name: "VELox 300R Airflow PZ",
    brand: "MSI",
    summary: "Среднеразмерный корпус с хорошим воздушным потоком, лучше подходящий для мощных видеокарт и 360-мм СЖО.",
    tags: ["ATX", "Усиленный воздушный поток", "360-мм СЖО"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 400, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-velox-joybuy",
        market: "joybuy",
        title: "Снимок текущей цены",
        price: 99.99,
        currency: "GBP",
        note: "Joybuy UK",
        url: "https://www.joybuy.co.uk/dp/10369056",
      },
    ],
  },
  {
    id: "case-h5",
    category: "case",
    name: "H5 Flow",
    brand: "NZXT",
    summary: "Популярный среднеразмерный корпус с хорошим воздушным потоком, подходящий для большинства массовых сборок.",
    tags: ["ATX", "Усиленный воздушный поток"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 365, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-h5-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 74.99,
        currency: "USD",
        note: "Официальный магазин NZXT",
        url: "https://nzxt.com/en-US/product/h5-flow",
      },
    ],
  },
  {
    id: "case-h7",
    category: "case",
    name: "H7 Flow",
    brand: "NZXT",
    summary: "Более просторный корпус с хорошим воздушным потоком, подходящий для длинных видеокарт и конфигураций с большим количеством вентиляторов.",
    tags: ["ATX", "Усиленный воздушный поток", "Средне-высокий класс"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 410, maxRadiatorMm: 420 },
    offers: [
      {
        id: "case-h7-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 129.99,
        currency: "USD",
        note: "Официальный магазин NZXT",
        url: "https://nzxt.com/en-US/product/h7-flow",
      },
    ],
  },
  {
    id: "case-lancool216",
    category: "case",
    name: "LANCOOL 216",
    brand: "Lian Li",
    summary: "Очень распространённый в DIY-сообществе корпус с хорошим воздушным потоком, подходящий для мощных видеокарт и крупных вентиляторов.",
    tags: ["ATX", "Воздушный поток", "Два больших вентилятора"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 392, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-lancool216-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 99.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/searchpage.jsp?id=pcat17071&st=lian+li+lancool+216",
      },
    ],
  },
];

const extraParts: Part[] = [
  {
    id: "cpu-7600x",
    category: "cpu",
    name: "Ryzen 5 7600X",
    brand: "AMD",
    summary: "Популярный шестиядерный процессор AM5, подходящий для игровых сборок с упором на цену и производительность.",
    tags: ["AM5", "6 ядер", "105W"],
    specs: { socket: "AM5", tdp: 105 },
    offers: [
      {
        id: "cpu-7600x-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 190.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/searchpage.jsp?id=pcat17071&st=amd+ryzen+5+7600x",
      },
    ],
  },
  {
    id: "cpu-14700k",
    category: "cpu",
    name: "Core i7-14700K",
    brand: "Intel",
    summary: "Высокопроизводительный процессор для игр и творчества, подходящий для более продвинутых сборок на Intel.",
    tags: ["LGA1700", "20 ядер", "125W"],
    specs: { socket: "LGA1700", tdp: 125 },
    offers: [
      {
        id: "cpu-14700k-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 403.74,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/intel-core-i7-14700k-14th-gen-20-core-28-thread-4-3ghz-5-6ghz-turbo-socket-lga-1700-unlocked-desktop-processor-multi/JXZRJ557C2/sku/11232138",
      },
    ],
  },
  {
    id: "cpu-9900x",
    category: "cpu",
    name: "Ryzen 9 9900X",
    brand: "AMD",
    summary: "12-ядерный процессор для высокоуровневой работы и многозадачности, подходящий для флагманских систем.",
    tags: ["AM5", "12 ядер", "120W"],
    specs: { socket: "AM5", tdp: 120 },
    offers: [
      {
        id: "cpu-9900x-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 439,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/product/amd-ryzen-9-9900x-12-core-24-thread-4-4-ghz-5-6-ghz-max-boost-socket-am5-120w-unlocked-desktop-processor-silver/JXKQHH5XS4",
      },
    ],
  },
  {
    id: "mobo-b650-aorus",
    category: "motherboard",
    name: "B650 AORUS ELITE AX",
    brand: "Gigabyte",
    summary: "Популярная AM5 ATX-плата, хорошо подходящая для средне-высоких сборок на Ryzen.",
    tags: ["AM5", "ATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b650-aorus-bestbuy",
        market: "bestbuy",
        title: "Текущая продажа",
        price: 149.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/gigabyte-b650-aorus-elite-ax-socket-am5-amd-b650-atx-ddr5-wi-fi-6e-motherboard-black/6523178.p",
      },
    ],
  },
  {
    id: "gpu-rx9060xt",
    category: "gpu",
    name: "RX 9060 XT 16GB GAMING OC",
    brand: "Gigabyte",
    summary: "Популярный вариант видеокарты AMD, подходящий для более гибких по бюджету конфигураций в 1440p.",
    tags: ["16GB", "182W", "AMD"],
    specs: { boardPower: 182, lengthMm: 281 },
    offers: [
      {
        id: "gpu-rx9060xt-joybuy",
        market: "joybuy",
        title: "Снимок акционной цены",
        price: 399,
        currency: "GBP",
        note: "Акционная страница Joybuy",
        url: "https://www.joybuy.co.uk/cms/unleash-the-ultimate-gaming-power",
      },
    ],
  },
  {
    id: "gpu-5080-msi",
    category: "gpu",
    name: "GeForce RTX 5080 16G GAMING TRIO OC",
    brand: "MSI",
    summary: "Видеокарта более высокого класса для 4K, подходящая для флагманских сборок.",
    tags: ["16GB", "360W", "Флагман"],
    specs: { boardPower: 360, lengthMm: 338 },
    offers: [
      {
        id: "gpu-5080-msi-joybuy",
        market: "joybuy",
        title: "Снимок акционной цены",
        price: 1284.99,
        currency: "GBP",
        note: "Акционная страница Joybuy",
        url: "https://www.joybuy.co.uk/cms/unleash-the-ultimate-gaming-power",
      },
    ],
  },
  {
    id: "gpu-5080-asus",
    category: "gpu",
    name: "TUF-RTX 5080 O16G-GAMING",
    brand: "ASUS",
    summary: "Топовая видеокарта серии TUF, подходящая для мощных и строгих по стилю сборок.",
    tags: ["16GB", "360W", "TUF"],
    specs: { boardPower: 360, lengthMm: 348 },
    offers: [
      {
        id: "gpu-5080-asus-joybuy",
        market: "joybuy",
        title: "Снимок акционной цены",
        price: 1419.99,
        currency: "GBP",
        note: "Акционная страница Joybuy",
        url: "https://www.joybuy.co.uk/cms/unleash-the-ultimate-gaming-power",
      },
    ],
  },
  {
    id: "ssd-mp600elite",
    category: "ssd",
    name: "MP600 ELITE 2TB",
    brand: "Corsair",
    summary: "Популярный SSD PCIe 4.0 на 2TB от Corsair, подходящий для библиотеки игр и повседневной работы.",
    tags: ["2TB", "PCIe 4.0"],
    specs: { capacityTb: 2 },
    offers: [
      {
        id: "ssd-mp600elite-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 439.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/data-storage/cssd-f2000gbmp600enh/mp600-elite-2tb-pcie-gen4-x4-nvme-1-4-m-2-ssd-cssd-f2000gbmp600enh",
      },
    ],
  },
  {
    id: "cooler-nautilus",
    category: "cooler",
    name: "NAUTILUS 360 RS ARGB",
    brand: "Corsair",
    summary: "Более лаконичная 360-мм СЖО Corsair, подходящая для массовых высокопроизводительных сборок.",
    tags: ["360-мм СЖО", "ARGB"],
    specs: { supportedSockets: ["AM5", "LGA1700", "LGA1851"], radiatorMm: 360 },
    offers: [
      {
        id: "cooler-nautilus-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 129.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/cpu-coolers/cw-9060093-ww/nautilus-360-rs-argb-liquid-cpu-cooler-cw-9060093-ww",
      },
    ],
  },
  {
    id: "psu-rm750e",
    category: "psu",
    name: "RM750e",
    brand: "Corsair",
    summary: "Популярный блок питания на 750W, подходящий для RTX 5070 и массовых производительных систем.",
    tags: ["750W", "ATX 3.1"],
    specs: { wattage: 750 },
    offers: [
      {
        id: "psu-rm750e-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 114.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/psu/cp-9020262-na/rme-series-rm750e-fully-modular-low-noise-atx-power-supply-cp-9020262-na",
      },
    ],
  },
  {
    id: "psu-rm1000e",
    category: "psu",
    name: "RM1000e",
    brand: "Corsair",
    summary: "Блок питания на 1000W для флагманских видеокарт и платформ с высоким энергопотреблением.",
    tags: ["1000W", "ATX 3.1"],
    specs: { wattage: 1000 },
    offers: [
      {
        id: "psu-rm1000e-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 189.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/psu/cp-9020250-na/rme-series-rm1000e-fully-modular-low-noise-atx-power-supply-cp-9020250-na",
      },
    ],
  },
  {
    id: "case-h6",
    category: "case",
    name: "H6 Flow",
    brand: "NZXT",
    summary: "Корпус с двухкамерной конструкцией и хорошим воздушным потоком, подходящий для демонстрационных сборок и лучшего охлаждения видеокарты.",
    tags: ["ATX", "Двухкамерный", "Усиленный воздушный поток"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 365, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-h6-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 99.99,
        currency: "USD",
        note: "Официальный магазин NZXT",
        url: "https://nzxt.com/en-US/product/h6-flow",
      },
    ],
  },
  {
    id: "case-h9",
    category: "case",
    name: "H9 Flow",
    brand: "NZXT",
    summary: "Более крупный панорамный двухкамерный корпус, подходящий для флагманского охлаждения и демонстрационных систем.",
    tags: ["ATX", "Двухкамерный", "Флагман"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 435, maxRadiatorMm: 420 },
    offers: [
      {
        id: "case-h9-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 119.99,
        currency: "USD",
        note: "Официальный магазин NZXT",
        url: "https://nzxt.com/en-US/product/h9-flow",
      },
    ],
  },
  {
    id: "case-3500x",
    category: "case",
    name: "3500X ARGB",
    brand: "Corsair",
    summary: "Стеклянный демонстрационный корпус, подходящий для белых тематических и эффектных RGB-сборок.",
    tags: ["ATX", "ARGB", "Панорамный"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 410, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-3500x-official",
        market: "official",
        title: "Цена фирменного магазина",
        price: 119.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/p/pc-cases/cc-9011278-ww/3500x-argb-mid-tower-pc-case-cc-9011278-ww",
      },
    ],
  },
  {
    id: "mobo-b650-steellegend",
    category: "motherboard",
    name: "B650 Steel Legend WiFi",
    brand: "ASRock",
    summary: "Бело-серебристая ATX-плата AM5 для аккуратных игровых и рабочих сборок среднего уровня.",
    tags: ["AM5", "ATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b650-steellegend-newegg",
        market: "amazon",
        title: "Снимок цены на рынке",
        price: 189.99,
        currency: "USD",
        note: "Снимок цены ASRock",
        url: "https://www.asrock.com/mb/AMD/B650%20Steel%20Legend%20WiFi/",
      },
    ],
  },
  {
    id: "mobo-b650-tufplus",
    category: "motherboard",
    name: "TUF Gaming B650-PLUS WIFI",
    brand: "ASUS",
    summary: "Сбалансированная AM5 ATX-плата с хорошим питанием и стабильной поддержкой BIOS.",
    tags: ["AM5", "ATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b650-tufplus-bestbuy",
        market: "bestbuy",
        title: "Текущее предложение",
        price: 219.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/searchpage.jsp?st=TUF+Gaming+B650-PLUS+WIFI",
      },
    ],
  },
  {
    id: "mobo-x870-eagle",
    category: "motherboard",
    name: "X870 Eagle WIFI7",
    brand: "Gigabyte",
    summary: "Плата нового поколения AM5 с более быстрыми сетевыми возможностями, лучшей поддержкой памяти и ориентацией на премиальные сборки.",
    tags: ["AM5", "ATX", "WiFi 7"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-x870-eagle-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 249.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=X870+Eagle+WIFI7",
      },
    ],
  },
  {
    id: "mobo-z890-pro-rs",
    category: "motherboard",
    name: "Z890 Pro RS WiFi",
    brand: "ASRock",
    summary: "Плата для платформы Intel Core Ultra, ориентированная на рабочие и многоядерные настольные сборки.",
    tags: ["LGA1851", "ATX", "DDR5"],
    specs: { socket: "LGA1851", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-z890-pro-rs-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 239.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Z890+Pro+RS+WiFi",
      },
    ],
  },
  {
    id: "gpu-7800xt-sapphire",
    category: "gpu",
    name: "Radeon RX 7800 XT Pulse",
    brand: "Sapphire",
    summary: "Надёжный вариант Radeon для 1440p с высокой обычной производительностью и тихой системой охлаждения.",
    tags: ["1440p", "16GB", "AMD"],
    specs: { performanceTier: "high", vramGb: 16, powerDraw: 263 },
    offers: [
      {
        id: "gpu-7800xt-sapphire-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 499.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Sapphire+RX+7800+XT+Pulse",
      },
    ],
  },
  {
    id: "gpu-9070xt-xfx",
    category: "gpu",
    name: "Radeon RX 9070 XT MERC",
    brand: "XFX",
    summary: "Топовый вариант Radeon для уверенной игры в 1440p Ultra и начального уровня 4K.",
    tags: ["1440p Ultra", "16GB", "RDNA 4"],
    specs: { performanceTier: "flagship", vramGb: 16, powerDraw: 300 },
    offers: [
      {
        id: "gpu-9070xt-xfx-aliexpress",
        market: "aliexpress",
        title: "Снимок цены на площадке",
        price: 689.99,
        currency: "USD",
        note: "Снимок AliExpress",
        url: "https://www.aliexpress.com/wholesale?SearchText=XFX+RX+9070+XT+MERC",
      },
    ],
  },
  {
    id: "gpu-5070-zotac",
    category: "gpu",
    name: "GeForce RTX 5070 Twin Edge OC",
    brand: "ZOTAC",
    summary: "Компактная видеокарта NVIDIA с более сильным рейтрейсингом и лучшей совместимостью с небольшими корпусами.",
    tags: ["1440p", "12GB", "Компактная"],
    specs: { performanceTier: "high", vramGb: 12, powerDraw: 250 },
    offers: [
      {
        id: "gpu-5070-zotac-bestbuy",
        market: "bestbuy",
        title: "Текущее предложение",
        price: 649.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/searchpage.jsp?st=RTX+5070+Twin+Edge+OC",
      },
    ],
  },
  {
    id: "gpu-5060ti-pny",
    category: "gpu",
    name: "GeForce RTX 5060 Ti VERTO Dual",
    brand: "PNY",
    summary: "Видеокарта NVIDIA среднего уровня для киберспорта и 1440p на высоких настройках при более ограниченном бюджете.",
    tags: ["1080p+", "16GB", "Два вентилятора"],
    specs: { performanceTier: "mid", vramGb: 16, powerDraw: 180 },
    offers: [
      {
        id: "gpu-5060ti-pny-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 449.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=PNY+RTX+5060+Ti+VERTO+Dual",
      },
    ],
  },
  {
    id: "ram-tforce-delta",
    category: "ram",
    name: "T-Force Delta RGB DDR5 32GB 6000",
    brand: "TeamGroup",
    summary: "Популярный RGB-комплект DDR5 для игровых сборок, где важны и скорость, и более выразительный внешний вид.",
    tags: ["32GB", "DDR5-6000", "RGB"],
    specs: { capacityGb: 32, speed: 6000, memoryType: "DDR5" },
    offers: [
      {
        id: "ram-tforce-delta-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 109.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=T-Force+Delta+RGB+DDR5+32GB+6000",
      },
    ],
  },
  {
    id: "ram-xpg-lancer",
    category: "ram",
    name: "XPG Lancer Blade DDR5 32GB 6000",
    brand: "ADATA",
    summary: "Низкопрофильный комплект DDR5, который легче помещается под крупные воздушные кулеры и в компактные сборки.",
    tags: ["32GB", "DDR5-6000", "Низкопрофильная"],
    specs: { capacityGb: 32, speed: 6000, memoryType: "DDR5" },
    offers: [
      {
        id: "ram-xpg-lancer-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 99.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=XPG+Lancer+Blade+DDR5+32GB+6000",
      },
    ],
  },
  {
    id: "ram-viper-venom",
    category: "ram",
    name: "Viper Venom DDR5 32GB 6400",
    brand: "Patriot",
    summary: "Более высокочастотный комплект DDR5 для пользователей, которым нужен дополнительный запас производительности на подходящих платформах.",
    tags: ["32GB", "DDR5-6400", "Производительность"],
    specs: { capacityGb: 32, speed: 6400, memoryType: "DDR5" },
    offers: [
      {
        id: "ram-viper-venom-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 114.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Patriot+Viper+Venom+DDR5+32GB+6400",
      },
    ],
  },
  {
    id: "ssd-mp44",
    category: "ssd",
    name: "MP44 2TB",
    brand: "TeamGroup",
    summary: "Выгодный SSD PCIe 4.0 для библиотек игр и быстрой повседневной работы.",
    tags: ["2TB", "PCIe 4.0", "Выгодно"],
    specs: { capacityTb: 2, interface: "PCIe 4.0" },
    offers: [
      {
        id: "ssd-mp44-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 129.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=TeamGroup+MP44+2TB",
      },
    ],
  },
  {
    id: "ssd-s70-blade",
    category: "ssd",
    name: "XPG Gammix S70 Blade 2TB",
    brand: "ADATA",
    summary: "Быстрый SSD PCIe 4.0 с тонким радиатором, полезный для настольных ПК и совместного использования с консолями.",
    tags: ["2TB", "PCIe 4.0", "Тонкий радиатор"],
    specs: { capacityTb: 2, interface: "PCIe 4.0" },
    offers: [
      {
        id: "ssd-s70-blade-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 139.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=XPG+Gammix+S70+Blade+2TB",
      },
    ],
  },
  {
    id: "ssd-p41",
    category: "ssd",
    name: "Platinum P41 2TB",
    brand: "SK hynix",
    summary: "Премиальный SSD PCIe 4.0, известный высокой стабильной производительностью и хорошей энергоэффективностью.",
    tags: ["2TB", "PCIe 4.0", "Премиум"],
    specs: { capacityTb: 2, interface: "PCIe 4.0" },
    offers: [
      {
        id: "ssd-p41-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 154.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=SK+hynix+Platinum+P41+2TB",
      },
    ],
  },
  {
    id: "cooler-ak620",
    category: "cooler",
    name: "AK620 Digital",
    brand: "DeepCool",
    summary: "Двухбашенный воздушный кулер для массовых игровых CPU, подходящий тем, кто предпочитает тихую работу вместо СЖО.",
    tags: ["Воздушный", "Двухбашенный", "AM5"],
    specs: { coolerType: "air", maxRadiatorMm: 0 },
    offers: [
      {
        id: "cooler-ak620-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 79.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=DeepCool+AK620+Digital",
      },
    ],
  },
  {
    id: "cooler-pureloop",
    category: "cooler",
    name: "Pure Loop 2 FX 360",
    brand: "be quiet!",
    summary: "Тихая 360-мм СЖО для многоядерных CPU и пользователей, которым нужен более низкий уровень шума под нагрузкой.",
    tags: ["360mm", "СЖО", "Тихая"],
    specs: { coolerType: "liquid", maxRadiatorMm: 360 },
    offers: [
      {
        id: "cooler-pureloop-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 149.9,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Pure+Loop+2+FX+360",
      },
    ],
  },
  {
    id: "cooler-hyper622",
    category: "cooler",
    name: "Hyper 622 Halo",
    brand: "Cooler Master",
    summary: "RGB-кулер с двумя башнями, хорошо подходящий для сбалансированных игровых сборок и корпусов со стеклянной боковой панелью.",
    tags: ["Воздушный", "ARGB", "Двухбашенный"],
    specs: { coolerType: "air", maxRadiatorMm: 0 },
    offers: [
      {
        id: "cooler-hyper622-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 59.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Hyper+622+Halo",
      },
    ],
  },
  {
    id: "psu-focus-gx850",
    category: "psu",
    name: "FOCUS GX-850",
    brand: "Seasonic",
    summary: "Надёжный блок питания 850W уровня Gold с достаточным запасом для топовых видеокарт и будущих апгрейдов.",
    tags: ["850W", "ATX 3.0", "Gold"],
    specs: { wattage: 850 },
    offers: [
      {
        id: "psu-focus-gx850-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 149.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Seasonic+FOCUS+GX-850",
      },
    ],
  },
  {
    id: "psu-purepower12m",
    category: "psu",
    name: "Pure Power 12 M 750W",
    brand: "be quiet!",
    summary: "Блок питания с поддержкой ATX 3.x для более тихих сборок среднего и высокого уровня с современными разъёмами для видеокарт.",
    tags: ["750W", "ATX 3.x", "Тихий"],
    specs: { wattage: 750 },
    offers: [
      {
        id: "psu-purepower12m-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 119.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Pure+Power+12+M+750W",
      },
    ],
  },
  {
    id: "psu-mwe850v3",
    category: "psu",
    name: "MWE Gold 850 V3",
    brand: "Cooler Master",
    summary: "Простой и выгодный блок питания на 850W для более мощных апгрейдов видеокарты без лишних переплат.",
    tags: ["850W", "Gold", "Выгодно"],
    specs: { wattage: 850 },
    offers: [
      {
        id: "psu-mwe850v3-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 109.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=MWE+Gold+850+V3",
      },
    ],
  },
  {
    id: "case-fractal-north",
    category: "case",
    name: "North",
    brand: "Fractal Design",
    summary: "Очень популярный корпус с хорошим воздушным потоком и более тёплым дизайном передней панели в мебельном стиле.",
    tags: ["ATX", "Воздушный поток", "Деревянная передняя панель"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 355, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-fractal-north-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 139.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Fractal+North",
      },
    ],
  },
  {
    id: "case-air903",
    category: "case",
    name: "AIR 903 MAX",
    brand: "Montech",
    summary: "Просторный корпус среднего размера с хорошим воздушным потоком и выгодной комплектацией вентиляторами для практичных игровых сборок.",
    tags: ["ATX", "Воздушный поток", "Выгодно"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 400, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-air903-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 74.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Montech+AIR+903+MAX",
      },
    ],
  },
  {
    id: "case-y40",
    category: "case",
    name: "Y40",
    brand: "HYTE",
    summary: "Демонстрационный корпус, созданный для панорамного обзора и более эффектной визуальной подачи.",
    tags: ["ATX", "Демонстрационный", "Панорамный"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 422, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-y40-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 129.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=HYTE+Y40",
      },
    ],
  },
  {
    id: "case-xtpro",
    category: "case",
    name: "XT Pro Ultra",
    brand: "Phanteks",
    summary: "Аккуратный корпус с высоким воздушным потоком, гибкой поддержкой радиаторов и более удобным пространством для кабелей.",
    tags: ["ATX", "Воздушный поток", "Удобный для сборки"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 415, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-xtpro-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 89.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Phanteks+XT+Pro+Ultra",
      },
    ],
  },
  {
    id: "cpu-285k",
    category: "cpu",
    name: "Core Ultra 9 285K",
    brand: "Intel",
    summary: "Топовый настольный процессор Core Ultra для тяжёлой работы, стриминга и флагманских гибридных сборок.",
    tags: ["LGA1851", "24 ядра", "125W"],
    specs: { socket: "LGA1851", tdp: 125 },
    offers: [
      {
        id: "cpu-285k-bestbuy",
        market: "bestbuy",
        title: "Текущее предложение",
        price: 589.99,
        currency: "USD",
        note: "Best Buy",
        url: "https://www.bestbuy.com/site/searchpage.jsp?st=Core+Ultra+9+285K",
      },
    ],
  },
  {
    id: "mobo-n7-b650e",
    category: "motherboard",
    name: "N7 B650E",
    brand: "NZXT",
    summary: "Материнская плата AM5 с цельным аккуратным дизайном для белых или минималистичных сборок, где важна визуальная целостность.",
    tags: ["AM5", "ATX", "DDR5"],
    specs: { socket: "AM5", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-n7-b650e-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 269.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=NZXT+N7+B650E",
      },
    ],
  },
  {
    id: "mobo-b860-strix",
    category: "motherboard",
    name: "ROG Strix B860-F Gaming WiFi",
    brand: "ASUS",
    summary: "Материнская плата Intel среднего-высокого уровня для новых сборок на Core Ultra с более богатым набором функций и выразительным дизайном.",
    tags: ["LGA1851", "ATX", "DDR5"],
    specs: { socket: "LGA1851", formFactor: "ATX", memoryType: "DDR5" },
    offers: [
      {
        id: "mobo-b860-strix-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 259.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=ROG+Strix+B860-F+Gaming+WiFi",
      },
    ],
  },
  {
    id: "gpu-9070xt-powercolor",
    category: "gpu",
    name: "Radeon RX 9070 XT Hellhound",
    brand: "PowerColor",
    summary: "Известная партнёрская версия Radeon, рассчитанная на 1440p с высокой частотой и начальный уровень 4K.",
    tags: ["1440p Ultra", "16GB", "AMD"],
    specs: { performanceTier: "flagship", vramGb: 16, powerDraw: 304 },
    offers: [
      {
        id: "gpu-9070xt-powercolor-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 699.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=PowerColor+RX+9070+XT+Hellhound",
      },
    ],
  },
  {
    id: "ram-dominator-titanium",
    category: "ram",
    name: "Dominator Titanium RGB DDR5 32GB 6400",
    brand: "Corsair",
    summary: "Премиальный RGB-комплект DDR5 для демонстрационных сборок и игровых систем с более высокой частотой памяти.",
    tags: ["32GB", "DDR5-6400", "Премиум RGB"],
    specs: { capacityGb: 32, speed: 6400, memoryType: "DDR5" },
    offers: [
      {
        id: "ram-dominator-titanium-official",
        market: "official",
        title: "Фирменный магазин",
        price: 174.99,
        currency: "USD",
        note: "Официальный магазин Corsair",
        url: "https://www.corsair.com/us/en/s/dominator-titanium-ddr5-memory",
      },
    ],
  },
  {
    id: "ram-ares-rgb",
    category: "ram",
    name: "ARES RGB DDR5 32GB 6400",
    brand: "Lexar",
    summary: "Быстрый RGB-комплект DDR5 для пользователей, которым нужны более высокие частоты и более компактный профиль модулей.",
    tags: ["32GB", "DDR5-6400", "RGB"],
    specs: { capacityGb: 32, speed: 6400, memoryType: "DDR5" },
    offers: [
      {
        id: "ram-ares-rgb-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 119.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Lexar+ARES+RGB+DDR5+32GB+6400",
      },
    ],
  },
  {
    id: "ssd-firecuda530r",
    category: "ssd",
    name: "FireCuda 530R 2TB",
    brand: "Seagate",
    summary: "Высококлассный SSD PCIe 4.0, настроенный для больших игровых библиотек и длительных операций передачи данных.",
    tags: ["2TB", "PCIe 4.0", "Высокий класс"],
    specs: { capacityTb: 2, interface: "PCIe 4.0" },
    offers: [
      {
        id: "ssd-firecuda530r-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 169.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=FireCuda+530R+2TB",
      },
    ],
  },
  {
    id: "ssd-p44pro",
    category: "ssd",
    name: "P44 Pro 2TB",
    brand: "Solidigm",
    summary: "Быстрый премиальный SSD с высокой случайной производительностью для игровых и рабочих сценариев.",
    tags: ["2TB", "PCIe 4.0", "Премиум"],
    specs: { capacityTb: 2, interface: "PCIe 4.0" },
    offers: [
      {
        id: "ssd-p44pro-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 159.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Solidigm+P44+Pro+2TB",
      },
    ],
  },
  {
    id: "cooler-liquid-freezer-iii",
    category: "cooler",
    name: "Liquid Freezer III 360",
    brand: "Arctic",
    summary: "Популярная СЖО с отличной тепловой эффективностью и хорошей ценностью для более мощных CPU.",
    tags: ["360mm", "СЖО", "Высокая производительность"],
    specs: { coolerType: "liquid", maxRadiatorMm: 360 },
    offers: [
      {
        id: "cooler-liquid-freezer-iii-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 139.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Arctic+Liquid+Freezer+III+360",
      },
    ],
  },
  {
    id: "cooler-phantom-spirit",
    category: "cooler",
    name: "Phantom Spirit 120 SE",
    brand: "Thermalright",
    summary: "Очень выгодный двухбашенный воздушный кулер, который до сих пор широко рекомендуют для игровых процессоров.",
    tags: ["Воздушный", "Двухбашенный", "Выгодно"],
    specs: { coolerType: "air", maxRadiatorMm: 0 },
    offers: [
      {
        id: "cooler-phantom-spirit-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 37.9,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Thermalright+Phantom+Spirit+120+SE",
      },
    ],
  },
  {
    id: "psu-leadex-vii",
    category: "psu",
    name: "Leadex VII XG 1000W",
    brand: "Super Flower",
    summary: "Мощный блок питания уровня Gold с сильной репутацией для флагманских видеокарт и будущих апгрейдов.",
    tags: ["1000W", "ATX 3.1", "Gold"],
    specs: { wattage: 1000 },
    offers: [
      {
        id: "psu-leadex-vii-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 189.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Super+Flower+Leadex+VII+XG+1000W",
      },
    ],
  },
  {
    id: "psu-toughpower-gfa3",
    category: "psu",
    name: "Toughpower GF A3 850W",
    brand: "Thermaltake",
    summary: "Современный блок питания с поддержкой ATX 3 для игровых сборок высокого уровня с разумной ценой.",
    tags: ["850W", "ATX 3.0", "Gold"],
    specs: { wattage: 850 },
    offers: [
      {
        id: "psu-toughpower-gfa3-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 124.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Toughpower+GF+A3+850W",
      },
    ],
  },
  {
    id: "case-c8",
    category: "case",
    name: "C8",
    brand: "Antec",
    summary: "Панорамный двухкамерный корпус для демонстрационных сборок с длинными видеокартами и несколькими радиаторами.",
    tags: ["ATX", "Панорамный", "Двухкамерный"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 440, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-c8-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 109.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=Antec+C8",
      },
    ],
  },
  {
    id: "case-lightbase-600",
    category: "case",
    name: "Light Base 600 LX",
    brand: "be quiet!",
    summary: "Премиальный демонстрационный корпус для более тихих систем высокого уровня с широкой гибкостью охлаждения.",
    tags: ["ATX", "Демонстрационный", "Премиум"],
    specs: { supportedFormFactors: ["ATX", "mATX", "Mini-ITX"], maxGpuLengthMm: 400, maxRadiatorMm: 360 },
    offers: [
      {
        id: "case-lightbase-600-amazon",
        market: "amazon",
        title: "Снимок цены",
        price: 169.99,
        currency: "USD",
        note: "Снимок Amazon",
        url: "https://www.amazon.com/s?k=be+quiet+Light+Base+600+LX",
      },
    ],
  }
];

const parts: Part[] = [...catalogParts, ...extraParts].map((part) => ({
  ...part,
  offers: part.offers.map((offer) => {
    const liveEntry = livePriceFeed.offers[offer.id];
    if (!liveEntry) {
      return offer;
    }

    return {
      ...offer,
      price: liveEntry.price ?? offer.price,
      currency: liveEntry.currency ?? offer.currency,
      note: liveEntry.note ?? offer.note,
      url: liveEntry.url ?? offer.url,
    };
  }),
}));

const presets: Preset[] = [
  {
    id: "balanced",
    name: "Сбалансированная массовая сборка",
    parts: {
      cpu: "cpu-9600",
      motherboard: "mobo-colorful-b650me",
      gpu: "gpu-5060-msi",
      ram: "ram-crucial",
      ssd: "ssd-990pro",
      cooler: "cooler-msi",
      psu: "psu-650",
      case: "case-forge",
    },
  },
  {
    id: "amd-premium",
    name: "Мощная сборка AMD",
    parts: {
      cpu: "cpu-9800x3d",
      motherboard: "mobo-b850",
      gpu: "gpu-5070-gigabyte",
      ram: "ram-gskill",
      ssd: "ssd-arespro",
      cooler: "cooler-nzxt",
      psu: "psu-850-white",
      case: "case-h7",
    },
  },
  {
    id: "intel-builder",
    name: "Творческая сборка Intel",
    parts: {
      cpu: "cpu-14600k",
      motherboard: "mobo-z790",
      gpu: "gpu-5070-msi",
      ram: "ram-kingston",
      ssd: "ssd-t500",
      cooler: "cooler-corsair",
      psu: "psu-rm850e",
      case: "case-lancool216",
    },
  },
];

const partsById = new Map(parts.map((part) => [part.id, part]));
const brandCount = new Set(parts.map((part) => part.brand)).size;
const totalOffers = parts.reduce((sum, part) => sum + part.offers.length, 0);

const toGbp = (price: number, currency: Offer["currency"]) => {
  if (currency === "USD") return price * usdToGbp;
  if (currency === "EUR") return price * eurToGbp;
  return price;
};
const fmt = (price: number, currency: Offer["currency"]) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(price);

const gbp = (price: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(price);

const byCategory = (categoryId: CategoryId) => parts.filter((part) => part.category === categoryId);
const brandsForCategory = (categoryId: CategoryId) =>
    [...new Set(byCategory(categoryId).map((part) => part.brand))].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

const cheapest = (part: Part) =>
    [...part.offers].sort((a, b) => toGbp(a.price, a.currency) - toGbp(b.price, b.currency))[0];

const chosenOffer = (part: Part, offerId?: string) =>
    part.offers.find((offer) => offer.id === offerId) ?? cheapest(part);

const offerMapFrom = (selected: Record<CategoryId, string>) =>
    Object.fromEntries(
        Object.entries(selected).map(([categoryId, partId]) => [categoryId, cheapest(partsById.get(partId)!).id])
    ) as Record<CategoryId, string>;

const brandMapFrom = (selected: Record<CategoryId, string>) =>
    Object.fromEntries(
        categories.map((category) => [
          category.id,
          partsById.get(selected[category.id])?.brand ?? brandsForCategory(category.id)[0] ?? "",
        ])
    ) as Record<CategoryId, string>;

const cpuTierMap: Record<string, number> = {
  "cpu-9600": 66,
  "cpu-7600x": 70,
  "cpu-7800x3d": 88,
  "cpu-9700x": 82,
  "cpu-9800x3d": 96,
  "cpu-14600k": 78,
  "cpu-14700k": 88,
  "cpu-265k": 90,
  "cpu-285k": 96,
  "cpu-9900x": 92,
};

const gpuTierMap: Record<string, number> = {
  "gpu-5060-msi": 62,
  "gpu-5060ti-galax": 68,
  "gpu-5060ti-pny": 69,
  "gpu-5060-palit": 63,
  "gpu-rx9060xt": 76,
  "gpu-7800xt-sapphire": 82,
  "gpu-5070-gigabyte": 84,
  "gpu-5070-msi": 86,
  "gpu-5070-zotac": 85,
  "gpu-5070ti-asus": 93,
  "gpu-9070xt-xfx": 95,
  "gpu-9070xt-powercolor": 95,
  "gpu-5080-msi": 98,
  "gpu-5080-asus": 99,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ramCapacityFrom = (part: Part) => Number(part.name.match(/(\d+)\s*GB/i)?.[1] ?? 32);
const fpsRange = (center: number, spread: number) => `${Math.round(clamp(center - spread, 28, 420))}-${Math.round(clamp(center + spread, 32, 460))} FPS`;
const qualityLabel = (value: number) => {
  if (value >= 92) return "Очень высокие / Максимальные";
  if (value >= 78) return "Высокие";
  if (value >= 64) return "Средне-высокие";
  return "Средние";
};

const performanceTier = (value: number) => {
  if (value >= 92) return "Очень плавно";
  if (value >= 78) return "Плавно";
  if (value >= 64) return "Играть комфортно";
  return "Рекомендуется немного снизить настройки графики";
};

export default function Home() {
  const [presetId, setPresetId] = useState<string>(presets[0].id);
  const [selectedParts, setSelectedParts] = useState<Record<CategoryId, string>>(presets[0].parts);
  const [selectedOffers, setSelectedOffers] = useState<Record<CategoryId, string>>(offerMapFrom(presets[0].parts));
  const [activeBrands, setActiveBrands] = useState<Record<CategoryId, string>>(brandMapFrom(presets[0].parts));
  const activePreset = presets.find((preset) => preset.id === presetId) ?? presets[0];
  const isCustomBuild = JSON.stringify(selectedParts) !== JSON.stringify(activePreset.parts);

  const selectedPartRecord = Object.fromEntries(
      categories.map((category) => [category.id, partsById.get(selectedParts[category.id])!])
  ) as Record<CategoryId, Part>;

  const selectedOfferRecord = Object.fromEntries(
      categories.map((category) => [category.id, chosenOffer(selectedPartRecord[category.id], selectedOffers[category.id])])
  ) as Record<CategoryId, Offer>;

  const selectedLinkGroups = categories.map((category) => ({
    category,
    part: selectedPartRecord[category.id],
    offer: selectedOfferRecord[category.id],
  }));

  const cpuTier = cpuTierMap[selectedPartRecord.cpu.id] ?? 72;
  const gpuTier = gpuTierMap[selectedPartRecord.gpu.id] ?? 70;
  const ramGb = ramCapacityFrom(selectedPartRecord.ram);
  const storageTb = Number(selectedPartRecord.ssd.specs.capacityTb ?? 1);
  const ramBonus = ramGb >= 64 ? 10 : ramGb >= 32 ? 5 : 0;

  const esportsScore = clamp(cpuTier * 1.28 + gpuTier * 0.92 + ramBonus, 45, 100);
  const aaaScore = clamp(cpuTier * 0.62 + gpuTier * 1.12 + ramBonus, 40, 100);
  const heavyAaaScore = clamp(cpuTier * 0.48 + gpuTier * 1.06 + ramBonus - 4, 35, 100);

  const gameEstimates = [
    {
      title: "Популярные соревновательные онлайн-игры",
      summary: "CS2 / Valorant / Apex / LoL",
      fps: fpsRange(esportsScore * 2.35, 24),
      quality: qualityLabel(esportsScore),
      resolution: esportsScore >= 82 ? "1080p — от высоких до максимальных, 1440p тоже достаточно стабильно" : "1080p — от средне-высоких до высоких",
      smoothness: performanceTier(esportsScore),
    },
    {
      title: "Популярные AAA-игры",
      summary: "Black Myth / Cyberpunk / Horizon / Red Dead Redemption 2",
      fps: fpsRange(aaaScore * 1.18, 12),
      quality: qualityLabel(aaaScore),
      resolution: aaaScore >= 86 ? "1440p на высоких настройках" : aaaScore >= 72 ? "1080p на максимальных или 1440p на средне-высоких" : "1080p на средне-высоких",
      smoothness: performanceTier(aaaScore),
    },
    {
      title: "Тяжёлые AAA-игры из Steam",
      summary: "Starfield / Alan Wake 2 / Dragon’s Dogma 2 / Cities: Skylines 2",
      fps: fpsRange(heavyAaaScore * 0.92, 10),
      quality: qualityLabel(heavyAaaScore),
      resolution: heavyAaaScore >= 88 ? "1440p на высоких настройках, при необходимости включить DLSS/FSR" : "1080p на высоких или 1440p на средних",
      smoothness: performanceTier(heavyAaaScore),
    },
  ];

  const buildHighlights = [
    `Уровень связки CPU / GPU: ${performanceTier(clamp((cpuTier + gpuTier) / 2, 40, 100))}`,
    `${ramGb}GB DDR5 памяти подходят для современных игр и многозадачности`,
    `${storageTb}TB SSD подходят для системы и библиотеки часто запускаемых игр`,
  ];

  const defaultParts = presets[0].parts;
  const defaultOfferMap = offerMapFrom(defaultParts);
  const cheapestOfferMap = Object.fromEntries(
      categories.map((category) => [category.id, cheapest(selectedPartRecord[category.id]).id])
  ) as Record<CategoryId, string>;

  const canResetToDefault =
      JSON.stringify(selectedParts) !== JSON.stringify(defaultParts) ||
      JSON.stringify(selectedOffers) !== JSON.stringify(defaultOfferMap) ||
      presetId !== presets[0].id;

  const canSwitchToCheapest = JSON.stringify(selectedOffers) !== JSON.stringify(cheapestOfferMap);

  const total = Object.values(selectedOfferRecord).reduce((sum, offer) => sum + toGbp(offer.price, offer.currency), 0);

  const marketSpend = Object.values(selectedOfferRecord).reduce<Record<string, number>>((acc, offer) => {
    acc[offer.market] = (acc[offer.market] ?? 0) + toGbp(offer.price, offer.currency);
    return acc;
  }, {});

  const compatibility = [
    {
      status: String(selectedPartRecord.cpu.specs.socket) === String(selectedPartRecord.motherboard.specs.socket) ? "pass" : "fail",
      text:
          String(selectedPartRecord.cpu.specs.socket) === String(selectedPartRecord.motherboard.specs.socket)
              ? `Сокет CPU и материнской платы совпадает: ${String(selectedPartRecord.cpu.specs.socket)}`
              : `CPU ${String(selectedPartRecord.cpu.specs.socket)} не совместим с материнской платой ${String(selectedPartRecord.motherboard.specs.socket)}`,
    },
    {
      status:
          String(selectedPartRecord.ram.specs.memoryType) === String(selectedPartRecord.motherboard.specs.memoryType)
              ? "pass"
              : "fail",
      text:
          String(selectedPartRecord.ram.specs.memoryType) === String(selectedPartRecord.motherboard.specs.memoryType)
              ? `Поколение памяти совпадает: ${String(selectedPartRecord.ram.specs.memoryType)}`
              : `Материнская плата требует ${String(selectedPartRecord.motherboard.specs.memoryType)}, а текущая память — ${String(selectedPartRecord.ram.specs.memoryType)}`,
    },
    {
      status:
          (selectedPartRecord.cooler.specs.supportedSockets as string[]).includes(String(selectedPartRecord.cpu.specs.socket))
              ? "pass"
              : "fail",
      text:
          (selectedPartRecord.cooler.specs.supportedSockets as string[]).includes(String(selectedPartRecord.cpu.specs.socket))
              ? `Кулер поддерживает ${String(selectedPartRecord.cpu.specs.socket)}`
              : `У кулера не указана поддержка ${String(selectedPartRecord.cpu.specs.socket)}`,
    },
    {
      status:
          (selectedPartRecord.case.specs.supportedFormFactors as string[]).includes(
              String(selectedPartRecord.motherboard.specs.formFactor)
          )
              ? "pass"
              : "fail",
      text:
          (selectedPartRecord.case.specs.supportedFormFactors as string[]).includes(
              String(selectedPartRecord.motherboard.specs.formFactor)
          )
              ? `Корпус поддерживает материнскую плату формата ${String(selectedPartRecord.motherboard.specs.formFactor)}`
              : `Корпус не поддерживает материнскую плату формата ${String(selectedPartRecord.motherboard.specs.formFactor)}`,
    },
    {
      status: Number(selectedPartRecord.case.specs.maxGpuLengthMm) >= Number(selectedPartRecord.gpu.specs.lengthMm) ? "pass" : "warn",
      text:
          Number(selectedPartRecord.case.specs.maxGpuLengthMm) >= Number(selectedPartRecord.gpu.specs.lengthMm)
              ? `Длина видеокарты ${Number(selectedPartRecord.gpu.specs.lengthMm)} мм укладывается в допустимые размеры корпуса`
              : "Длина видеокарты близка к пределу корпуса, рекомендуется дополнительно проверить реальное пространство для установки",
    },
    {
      status:
          Number(selectedPartRecord.case.specs.maxRadiatorMm) >= Number(selectedPartRecord.cooler.specs.radiatorMm)
              ? "pass"
              : "warn",
      text:
          Number(selectedPartRecord.case.specs.maxRadiatorMm) >= Number(selectedPartRecord.cooler.specs.radiatorMm)
              ? `Корпус вмещает радиатор ${Number(selectedPartRecord.cooler.specs.radiatorMm)} мм`
              : `Нужно дополнительно проверить, поддерживает ли корпус радиатор ${Number(selectedPartRecord.cooler.specs.radiatorMm)} мм`,
    },
    {
      status:
          Number(selectedPartRecord.psu.specs.wattage) >=
          Number(selectedPartRecord.cpu.specs.tdp) +
          Number(selectedPartRecord.gpu.specs.boardPower) +
          180
              ? "pass"
              : "warn",
      text:
          Number(selectedPartRecord.psu.specs.wattage) >=
          Number(selectedPartRecord.cpu.specs.tdp) +
          Number(selectedPartRecord.gpu.specs.boardPower) +
          180
              ? `Блок питания ${Number(selectedPartRecord.psu.specs.wattage)}W имеет разумный запас мощности`
              : "Рекомендуется увеличить мощность блока питания, чтобы оставить больше запаса для видеокарты и пиковых нагрузок",
    },
  ];

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    inLanguage: "zh-CN",
    keywords: defaultKeywords.join(", "),
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: siteUrl,
    description: siteDescription,
  };

  return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,107,53,0.22),transparent_22rem),radial-gradient(circle_at_top_right,rgba(139,224,210,0.18),transparent_24rem),linear-gradient(180deg,#07111f_0%,#0a1728_48%,#08111d_100%)] text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
        <div className="mx-auto flex w-[min(calc(100%-20px),1400px)] flex-col gap-5 py-5 md:w-[min(calc(100%-32px),1400px)] md:py-7">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,420px)]">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] md:p-11">
              <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Rig Atlas</p>
              <h1 className="max-w-[12ch] text-5xl leading-none font-semibold tracking-[-0.04em] md:text-7xl">
                Собирай ПК самостоятельно и сразу сравнивай цены на разных площадках
              </h1>
              <p className="mt-5 max-w-[62ch] text-base leading-7 text-slate-300">
                Открытый сайт для подбора комплектующих. В текущей версии уже добавлено больше популярных брендов и моделей, и пользователь может поэтапно выбирать CPU, материнскую плату, видеокарту, память,
                SSD, систему охлаждения, блок питания и корпус, одновременно видя снимки цен из разных источников.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                    href="#builder"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-linear-to-br from-[#ff6b35] to-[#ff8f5e] px-5 text-sm font-bold text-[#09111d]"
                >
                  Начать подбор
                </a>
                <a
                    href="#sources"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 text-sm"
                >
                  Посмотреть источники цен
                </a>
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,107,53,0.16),transparent_36%),linear-gradient(200deg,rgba(139,224,210,0.13),transparent_45%),rgba(14,28,48,0.94)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
              {[
                ["Дата снимка", snapshotDate],
                ["Подключённые площадки", "Amazon / Joybuy / AliExpress / Best Buy / Фирменный магазин"],
                ["Способ размещения", "GitHub Pages"],
                ["Текущий режим", "Открытый просмотр + больше брендов + ежедневная проверка официальных цен"],
              ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-none last:pb-0">
                    <span className="text-slate-300">{label}</span>
                    <strong className="text-right">{value}</strong>
                  </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [String(categories.length), "Основные категории"],
              [String(parts.length), "Доступные комплектующие"],
              [String(brandCount), "Охваченные бренды"],
              [String(totalOffers), "Записи со снимками цен"],
            ].map(([value, label]) => (
                <article key={label} className="rounded-[20px] border border-white/10 bg-white/5 px-6 py-5">
                  <span className="block text-3xl font-extrabold tracking-[-0.04em]">{value}</span>
                  <span className="text-slate-300">{label}</span>
                </article>
            ))}
          </section>

          <section className="grid gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(90deg,rgba(255,107,53,0.12),transparent_22%),rgba(255,255,255,0.03)] px-8 py-7 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Market Coverage</p>
              <h2 className="text-3xl leading-tight font-semibold tracking-[-0.04em]">
                Сначала расширяем выбор комплектующих, затем постепенно подключаем больше рыночных цен
              </h2>
            </div>
            <p className="text-base leading-7 text-slate-300">
              Эта версия не только получила больше комплектующих, но и отдельный слой с ежедневной проверкой цен. Ссылки официальных магазинов проверяются каждый день автоматически, а для Amazon, Joybuy, AliExpress и других ограниченных источников сохраняются последние доступные подтверждённые снимки.
            </p>
          </section>

          <section id="builder" className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.72fr)]">
            <div className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] md:p-7">
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Builder</p>
                  <h2 className="text-4xl font-semibold tracking-[-0.04em]">Каталог DIY-комплектующих по разным брендам</h2>
                </div>
                <p className="max-w-[48ch] text-sm leading-7 text-slate-300">
                  Теперь каждая категория сначала группируется по брендам, а затем внутри бренда показываются конкретные модели. Сначала выбираешь бренд, потом комплектующее — так сравнивать намного удобнее.
                </p>
              </div>

              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3">
                  {presets.map((preset) => (
                      <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setPresetId(preset.id);
                            setSelectedParts(preset.parts);
                            setSelectedOffers(offerMapFrom(preset.parts));
                            setActiveBrands(brandMapFrom(preset.parts));
                          }}
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                              presetId === preset.id
                                  ? "border-[#ff6b35]/70 bg-[#ff6b35]/15"
                                  : "border-white/10 bg-white/5 hover:border-[#ff6b35]/60 hover:bg-[#ff6b35]/10"
                          }`}
                      >
                        {preset.name}
                      </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                      type="button"
                      disabled={!canSwitchToCheapest}
                      onClick={() => {
                        setSelectedOffers(cheapestOfferMap);
                      }}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                          canSwitchToCheapest
                              ? "border-white/10 bg-white/6 hover:border-[#8be0d2]/40"
                              : "cursor-not-allowed border-white/8 bg-white/4 text-slate-500"
                      }`}
                  >
                    {canSwitchToCheapest ? "Переключить всё на минимальную цену" : "Сейчас уже выбрана минимальная цена"}
                  </button>
                  <button
                      type="button"
                      disabled={!canResetToDefault}
                      onClick={() => {
                        setPresetId(presets[0].id);
                        setSelectedParts(defaultParts);
                        setSelectedOffers(defaultOfferMap);
                        setActiveBrands(brandMapFrom(defaultParts));
                      }}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                          canResetToDefault
                              ? "border-white/10 bg-white/6 hover:border-[#ff6b35]/50"
                              : "cursor-not-allowed border-white/8 bg-white/4 text-slate-500"
                      }`}
                  >
                    {canResetToDefault ? "Восстановить конфигурацию по умолчанию" : "Сейчас уже выбрана конфигурация по умолчанию"}
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {categories.map((category) => {
                  const categoryParts = byCategory(category.id);
                  const categoryBrands = brandsForCategory(category.id);
                  const activeBrand = categoryBrands.includes(activeBrands[category.id]) ? activeBrands[category.id] : categoryBrands[0];
                  const visibleParts = categoryParts.filter((part) => part.brand === activeBrand);
                  const selectedBrand = selectedPartRecord[category.id].brand;

                  return (
                      <section key={category.id} className="rounded-[20px] border border-white/10 bg-white/4 p-4">
                        <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{category.title}</h3>
                            <p className="mt-1 max-w-[58ch] text-sm leading-6 text-slate-300">{category.description}</p>
                          </div>
                          <span className="w-fit rounded-full border border-[#8be0d2]/30 px-3 py-1.5 text-xs text-[#8be0d2]">
                      {categoryBrands.length} брендов / {categoryParts.length} комплектующих
                    </span>
                        </div>

                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.14em] text-[#8be0d2]">Сначала выберите бренд</p>
                            <p className="text-xs text-slate-400">Текущий бренд: {selectedBrand}</p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {categoryBrands.map((brand) => {
                              const brandParts = categoryParts.filter((part) => part.brand === brand);
                              const isActive = activeBrand === brand;
                              const isSelected = selectedBrand === brand;

                              return (
                                  <button
                                      key={brand}
                                      type="button"
                                      onClick={() => setActiveBrands((prev) => ({ ...prev, [category.id]: brand }))}
                                      className={`rounded-[16px] border px-4 py-3 text-left transition ${
                                          isActive
                                              ? "border-[#8be0d2]/55 bg-[#8be0d2]/10"
                                              : "border-white/10 bg-[#0a1728]/70 hover:border-[#8be0d2]/35"
                                      }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <strong className="block truncate text-sm">{brand}</strong>
                                        <span className="mt-1 block text-xs text-slate-400">
                                  {brandParts.length} моделей{isSelected ? " · выбран" : ""}
                                </span>
                                      </div>
                                      <span
                                          className={`rounded-full px-2.5 py-1 text-[11px] ${
                                              isActive ? "bg-[#8be0d2]/14 text-[#b8fff4]" : "bg-white/6 text-slate-300"
                                          }`}
                                      >
                                {brandParts.length}
                              </span>
                                    </div>
                                  </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.14em] text-[#8be0d2]">{activeBrand} — модели</p>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      {visibleParts.length} показано
                    </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                          {visibleParts.map((part) => {
                            const currentOffer = chosenOffer(part, selectedOffers[category.id]);

                            return (
                                <article
                                    key={part.id}
                                    className={`rounded-[16px] border bg-[#0a1728]/90 p-3 transition ${
                                        selectedParts[category.id] === part.id
                                            ? "border-[#ff6b35]/60"
                                            : "border-white/10 hover:border-[#ff6b35]/45"
                                    }`}
                                >
                                  <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedParts((prev) => ({ ...prev, [category.id]: part.id }));
                                        setSelectedOffers((prev) => ({ ...prev, [category.id]: cheapest(part).id }));
                                        setActiveBrands((prev) => ({ ...prev, [category.id]: part.brand }));
                                      }}
                                      className="block w-full text-left"
                                  >
                                    <div className="flex items-start justify-between gap-2.5">
                                      <div className="min-w-0">
                                        <h4 className="line-clamp-2 text-[1.05rem] leading-5 font-medium">{part.name}</h4>
                                        <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-slate-400">{part.brand}</p>
                                      </div>
                                      <span className="shrink-0 rounded-xl bg-[#8be0d2]/10 px-2.5 py-1.5 text-sm font-bold text-[#8be0d2]">
                                {gbp(toGbp(cheapest(part).price, cheapest(part).currency))}
                              </span>
                                    </div>
                                    <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-300">{part.summary}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {part.tags.map((tag) => (
                                          <span key={tag} className="rounded-full bg-white/6 px-2 py-1 text-[11px] text-slate-200">
                                  {tag}
                                </span>
                                      ))}
                                    </div>
                                  </button>

                                  <div className="mt-3 grid gap-1.5">
                                    {part.offers.map((offer) => (
                                        <button
                                            key={offer.id}
                                            type="button"
                                            onClick={() => setSelectedOffers((prev) => ({ ...prev, [category.id]: offer.id }))}
                                            className={`flex w-full items-start justify-between gap-2 rounded-[12px] border px-2.5 py-2 text-left transition ${
                                                currentOffer.id === offer.id
                                                    ? "border-[#8be0d2]/45 bg-[#8be0d2]/8"
                                                    : "border-white/10 bg-white/4 hover:border-[#8be0d2]/35"
                                            }`}
                                        >
                                <span className="grid min-w-0 gap-0.5">
                                  <strong className="line-clamp-1 text-xs">
                                    {marketMeta[offer.market].label} · {offer.title}
                                  </strong>
                                  <small className="line-clamp-1 text-[11px] text-slate-400">{offer.note}</small>
                                </span>
                                          <span className="shrink-0 text-right text-xs text-slate-200">
                                  {fmt(offer.price, offer.currency)}
                                            <small className="block text-[11px] text-slate-400">
                                    ≈ {gbp(toGbp(offer.price, offer.currency))}
                                  </small>
                                </span>
                                        </button>
                                    ))}
                                  </div>
                                </article>
                            );
                          })}
                        </div>
                      </section>
                  );
                })}
              </div>
            </div>
            <aside className="pc-scrollbar grid gap-4 xl:sticky xl:top-5 xl:self-start xl:h-[calc(100vh-2.5rem)] xl:overflow-y-scroll xl:overscroll-contain xl:pr-2 xl:pb-4">
              <section className="flex min-h-0 flex-col rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Current Build</p>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${isCustomBuild ? "bg-[#8be0d2]/12 text-[#8be0d2]" : "bg-[#ff6b35]/12 text-[#ffb89d]"}`}>
                  {isCustomBuild ? "Идёт DIY-настройка" : `Текущая база: ${activePreset.name}`}
                </span>
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                  {selectedPartRecord.cpu.name} + {selectedPartRecord.gpu.name}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {selectedPartRecord.motherboard.name} / {selectedPartRecord.ram.name} / {selectedPartRecord.case.name}
                </p>
                <div className="mt-5 rounded-[20px] bg-[linear-gradient(135deg,rgba(255,107,53,0.16),rgba(255,107,53,0.04)),rgba(255,255,255,0.03)] p-5">
                  <span className="block text-sm text-slate-300">Предполагаемая итоговая цена</span>
                  <strong className="mt-2 block text-4xl tracking-[-0.04em]">{gbp(total)}</strong>
                  <small className="block text-sm text-slate-400">
                    Расчёт по курсу 1 USD = 0.7465 GBP, 1 EUR = 0.8575 GBP, дата ежедневной проверки: {snapshotDate}
                  </small>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Выбранные комплектующие</h3>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                  {categories.length} / {categories.length}
                </span>
                </div>
                <div className="grid gap-2.5">
                  {categories.map((category) => (
                      <div key={category.id} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                        <strong className="block text-sm">
                          {category.title} · {selectedPartRecord[category.id].name}
                        </strong>
                        <small className="text-xs leading-6 text-slate-400">
                          {marketMeta[selectedOfferRecord[category.id].market].label} ·{" "}
                          {fmt(selectedOfferRecord[category.id].price, selectedOfferRecord[category.id].currency)} · примерно{" "}
                          {gbp(toGbp(selectedOfferRecord[category.id].price, selectedOfferRecord[category.id].currency))}
                        </small>
                        <a
                            href={selectedOfferRecord[category.id].url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-[#8be0d2]/40"
                        >
                          Посмотреть текущий источник цены
                        </a>
                      </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                <h3 className="mb-4 text-lg font-semibold">Проверка совместимости</h3>
                <div className="grid gap-2.5">
                  {compatibility.map((item) => (
                      <div key={item.text} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                    <span
                        className={`mt-1.5 h-2.5 w-2.5 rounded-full ${
                            item.status === "pass" ? "bg-emerald-400" : item.status === "warn" ? "bg-amber-300" : "bg-rose-400"
                        }`}
                    />
                        <span className="text-sm text-slate-200">{item.text}</span>
                      </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px]">
                <h3 className="mb-4 text-lg font-semibold">Распределение по площадкам</h3>
                <div className="grid gap-2.5">
                  {Object.entries(marketSpend).map(([market, value]) => (
                      <div key={market} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                        <div>
                          <strong className="block text-sm">{marketMeta[market as MarketId].label}</strong>
                          <small className="text-xs text-slate-400">{gbp(value)}</small>
                        </div>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                          <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max((value / total) * 100, 8)}%`,
                                background: marketMeta[market as MarketId].color,
                              }}
                          />
                        </div>
                      </div>
                  ))}
                </div>
              </section>
            </aside>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] md:p-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Game Estimate</p>
                <h2 className="text-4xl font-semibold tracking-[-0.04em]">Игровая плавность текущей конфигурации</h2>
              </div>
              <p className="max-w-[54ch] text-sm leading-7 text-slate-300">
                Это внутренняя оценка на основе текущего сочетания CPU, видеокарты и памяти. Она помогает быстро понять примерный диапазон FPS и настроек графики для популярных онлайн-игр, обычных AAA-проектов и тяжёлых AAA-игр из Steam.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {buildHighlights.map((item) => (
                  <span key={item} className="rounded-full border border-[#8be0d2]/20 bg-[#8be0d2]/8 px-3 py-1.5 text-xs text-[#b8fff4]">
                {item}
              </span>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {gameEstimates.map((item) => (
                  <article key={item.title} className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8be0d2]">{item.title}</p>
                    <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{item.fps}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.summary}</p>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
                        <span className="text-slate-400">Рекомендуемые настройки графики</span>
                        <strong>{item.quality}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
                        <span className="text-slate-400">Рекомендуемое разрешение</span>
                        <strong className="text-right">{item.resolution}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
                        <span className="text-slate-400">Оценка плавности</span>
                        <strong className="text-[#8be0d2]">{item.smoothness}</strong>
                      </div>
                    </div>
                  </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] md:p-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Selected Links</p>
                <h2 className="text-4xl font-semibold tracking-[-0.04em]">Ссылки на покупку для текущей конфигурации</h2>
              </div>
              <p className="max-w-[50ch] text-sm leading-7 text-slate-300">
                Здесь собраны ссылки на все выбранные комплектующие, чтобы после подтверждения конфигурации можно было сразу открыть нужные страницы, проверить цену и перейти к заказу.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {selectedLinkGroups.map(({ category, part, offer }) => (
                  <article key={category.id} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8be0d2]">{category.title}</p>
                    <h3 className="mt-2 text-lg font-semibold">{part.name}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {marketMeta[offer.market].label} · {fmt(offer.price, offer.currency)}
                    </p>
                    <a
                        href={offer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm hover:border-[#ff6b35]/60"
                    >
                      Открыть ссылку на текущий комплектующий
                    </a>
                  </article>
              ))}
            </div>
          </section>

          <section id="sources" className="rounded-[28px] border border-white/10 bg-[rgba(9,20,36,0.82)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-[18px] md:p-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] uppercase tracking-[0.18em] text-[#8be0d2]">Source Snapshot</p>
                <h2 className="text-4xl font-semibold tracking-[-0.04em]">Описание текущих источников цен</h2>
              </div>
              <p className="max-w-[50ch] text-sm leading-7 text-slate-300">
                Ссылки официальных магазинов ежедневно проверяются через GitHub Actions; для ограниченных источников вроде Amazon, Joybuy и AliExpress сохраняется последний успешный снимок. Нажми на кнопку источника, чтобы продолжить проверку.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {categories.map((category) => (
                  <article key={category.id} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-4">
                    <h3 className="text-base font-semibold">{category.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{category.description}</p>
                    <p className="mt-2 text-xs text-slate-400">Дата снимка цены: {snapshotDate}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {byCategory(category.id).flatMap((part) =>
                          part.offers.map((offer) => (
                              <a
                                  key={offer.id}
                                  href={offer.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs hover:border-[#ff6b35]/60"
                              >
                                {marketMeta[offer.market].label} · {part.name}
                              </a>
                          ))
                      )}
                    </div>
                  </article>
              ))}
            </div>
          </section>
        </div>
      </main>
  );
}
