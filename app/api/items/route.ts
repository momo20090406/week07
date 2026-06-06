import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// 1. 定義動漫資料的 TypeScript 介面
interface AnimeItem {
  id: string;
  title: string;
  japaneseTitle?: string;
  description: string;
  imageUrl: string;
  rating: number;
  status: "watching" | "completed" | "planned";
  episodesCount: number;
  genres: string[];
  releaseYear: number;
  personalNote?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. 設定資料存檔路徑 (位於專案根目錄下的 data/data.json)
const DATA_FILE_PATH = path.join(process.cwd(), "data", "data.json");

// 預設示範資料 (當檔案不存在時會自動以此資料初始化)
const DEFAULT_ITEMS: AnimeItem[] = [
  {
    id: "frieren-uuid-1",
    title: "葬送的芙莉蓮",
    japaneseTitle: "葬送のフリーレン",
    description: "在打倒魔王之後的勇者一行人中，身為精靈的魔法使芙莉蓮與夥伴們的故事。探討時間、生命與情感的雋永神作。",
    imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60",
    rating: 5,
    status: "completed",
    episodesCount: 28,
    genres: ["奇幻", "冒險", "日常"],
    releaseYear: 2023,
    personalNote: "作畫跟音樂都是神級！非常有深度的一部作品，芙莉蓮的感情變化描寫得非常細膩。推薦所有人必看！",
    createdAt: "2026-06-06T09:00:00.000Z",
    updatedAt: "2026-06-06T09:00:00.000Z",
  },
  {
    id: "aot-uuid-2",
    title: "進擊的巨人",
    japaneseTitle: "進撃の巨人",
    description: "人類築起高牆防禦巨大的人型生物「巨人」，而艾連·葉卡立志消滅所有巨人並探索牆外真相的史詩級巨作。",
    imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60",
    rating: 5,
    status: "completed",
    episodesCount: 87,
    genres: ["熱血", "動作", "懸疑"],
    releaseYear: 2013,
    personalNote: "從第一季到完結篇的宏大敘事、反轉以及深刻的政治與人性探討，是不可多得的ACG里程碑神作。",
    createdAt: "2026-06-06T09:05:00.000Z",
    updatedAt: "2026-06-06T09:05:00.000Z",
  }
];

// Helper 函數：寫入 JSON 資料
async function writeData(items: AnimeItem[]): Promise<void> {
  const dirPath = path.dirname(DATA_FILE_PATH);
  // 自動建立 data 資料夾 (如果不存在的話)
  await fs.mkdir(dirPath, { recursive: true });
  // 寫入格式化後的 JSON 檔案
  await fs.writeFile(
    DATA_FILE_PATH,
    JSON.stringify({ items }, null, 2),
    "utf-8"
  );
}

// Helper 函數：讀取 JSON 資料 (若檔案不存在則自動建立預設資料檔)
async function readData(): Promise<AnimeItem[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsedData = JSON.parse(fileContent);
    return parsedData.items || [];
  } catch (error: any) {
    // 若檔案或路徑不存在，自動寫入預設資料並回傳
    if (error.code === "ENOENT") {
      await writeData(DEFAULT_ITEMS);
      return DEFAULT_ITEMS;
    }
    return [];
  }
}

// 3. GET 方法：取得所有動漫收藏
export async function GET() {
  try {
    const items = await readData();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "無法讀取 JSON 資料檔案" },
      { status: 500 }
    );
  }
}

// 4. POST 方法：新增動漫收藏
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 欄位驗證
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "請輸入有效的動漫中文名稱！" },
        { status: 400 }
      );
    }

    const items = await readData();
    const currentIsoDate = new Date().toISOString();

    const newItem: AnimeItem = {
      id: `anime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title.trim(),
      japaneseTitle: body.japaneseTitle?.trim() || undefined,
      description: body.description?.trim() || "暫無簡介資訊。",
      imageUrl: body.imageUrl?.trim() || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600",
      rating: typeof body.rating === "number" ? body.rating : 5,
      status: ["watching", "completed", "planned"].includes(body.status)
        ? body.status
        : "watching",
      episodesCount: typeof body.episodesCount === "number" ? body.episodesCount : 0,
      genres: Array.isArray(body.genres) && body.genres.length > 0 ? body.genres : ["未分類"],
      releaseYear: typeof body.releaseYear === "number" ? body.releaseYear : new Date().getFullYear(),
      personalNote: body.personalNote?.trim() || undefined,
      createdAt: currentIsoDate,
      updatedAt: currentIsoDate,
    };

    // 加至開頭並存回 JSON
    items.unshift(newItem);
    await writeData(items);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "無效的請求格式或無法寫入檔案" },
      { status: 400 }
    );
  }
}

// 5. PUT 方法：編輯動漫收藏
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id || !body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json(
        { error: "id 和中文名稱為必填欄位！" },
        { status: 400 }
      );
    }

    const items = await readData();
    const index = items.findIndex((item) => item.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "找不到指定的動漫項目！" },
        { status: 404 }
      );
    }

    const currentIsoDate = new Date().toISOString();

    // 更新欄位
    const updatedItem: AnimeItem = {
      ...items[index],
      title: body.title.trim(),
      japaneseTitle: body.japaneseTitle?.trim() || undefined,
      description: body.description?.trim() || "暫無簡介資訊。",
      imageUrl: body.imageUrl?.trim() || items[index].imageUrl,
      rating: typeof body.rating === "number" ? body.rating : items[index].rating,
      status: ["watching", "completed", "planned"].includes(body.status)
        ? body.status
        : items[index].status,
      episodesCount: typeof body.episodesCount === "number" ? body.episodesCount : items[index].episodesCount,
      genres: Array.isArray(body.genres) && body.genres.length > 0 ? body.genres : items[index].genres,
      releaseYear: typeof body.releaseYear === "number" ? body.releaseYear : items[index].releaseYear,
      personalNote: body.personalNote?.trim() || undefined,
      updatedAt: currentIsoDate,
    };

    items[index] = updatedItem;
    await writeData(items);

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "更新資料失敗，請檢查格式" },
      { status: 400 }
    );
  }
}

// 6. DELETE 方法：刪除動漫收藏
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少必要的 id 參數！" },
        { status: 400 }
      );
    }

    const items = await readData();
    const filteredItems = items.filter((item) => item.id !== id);

    if (items.length === filteredItems.length) {
      return NextResponse.json(
        { error: "找不到該動漫項目，無法刪除！" },
        { status: 404 }
      );
    }

    await writeData(filteredItems);

    return NextResponse.json(
      { message: "已成功刪除該筆動漫收藏！" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "刪除資料失敗" },
      { status: 400 }
    );
  }
}
