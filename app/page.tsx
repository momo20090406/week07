"use client";

import React, { useState, useMemo, useEffect } from "react";

// 1. 定義動漫資料的 TypeScript 介面
interface AnimeItem {
  id: string;
  title: string;
  japaneseTitle?: string;
  description: string;
  imageUrl: string;
  rating: number; // 1 ~ 5 星
  status: "watching" | "completed" | "planned";
  episodesCount: number;
  genres: string[];
  releaseYear: number;
  personalNote?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. 預設範例資料，讓初次載入不空白且畫面精美
const INITIAL_ANIME_ITEMS: AnimeItem[] = [
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
  },
  {
    id: "kny-uuid-3",
    title: "鬼滅之刃 柱訓練篇",
    japaneseTitle: "鬼滅の刃 柱稽古編",
    description: "為了迎接與鬼舞辻無慘的決戰，炭治郎與鬼殺隊員們接受各個「柱」的魔鬼訓練，提升身體與呼吸法極限。",
    imageUrl: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=600&auto=format&fit=crop&q=60",
    rating: 4,
    status: "watching",
    episodesCount: 5,
    genres: ["熱血", "動作", "奇幻"],
    releaseYear: 2024,
    personalNote: "幽浮社(ufotable)的畫面特效依然炸裂，文戲步調也掌握得很好，期待接下來的無限城決戰！",
    createdAt: "2026-06-06T09:10:00.000Z",
    updatedAt: "2026-06-06T09:10:00.000Z",
  },
  {
    id: "solo-uuid-4",
    title: "我獨自升級",
    japaneseTitle: "俺だけレベルアップな件",
    description: "世界出現連接異次元的門，超能力者「獵人」應運而生。最弱獵人成肖宇在一次死地逃生後，獲得了獨自升級的系統系統。",
    imageUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&auto=format&fit=crop&q=60",
    rating: 4,
    status: "planned",
    episodesCount: 0,
    genres: ["動作", "奇幻", "冒險"],
    releaseYear: 2024,
    personalNote: "聽說漫畫非常爽快，動畫化之後的戰鬥張力跟配樂也很讚，先加入待看清單！",
    createdAt: "2026-06-06T09:15:00.000Z",
    updatedAt: "2026-06-06T09:15:00.000Z",
  }
];

// 可用的題材分類清單
const AVAILABLE_GENRES = ["熱血", "動作", "奇幻", "冒險", "日常", "懸疑", "科幻", "戀愛", "搞笑", "校園"];

interface FormDataType {
  title: string;
  japaneseTitle: string;
  description: string;
  imageUrl: string;
  rating: number;
  status: "watching" | "completed" | "planned";
  episodesCount: number;
  genres: string[];
  releaseYear: number;
  personalNote: string;
}

// 預設表單狀態
const EMPTY_FORM: FormDataType = {
  title: "",
  japaneseTitle: "",
  description: "",
  imageUrl: "",
  rating: 5,
  status: "watching",
  episodesCount: 0,
  genres: [],
  releaseYear: new Date().getFullYear(),
  personalNote: "",
};

export default function Home() {
  // --- 狀態管理 (useState) ---
  const [items, setItems] = useState<AnimeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // 互動彈出視窗控制
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>(EMPTY_FORM);

  // 詳細資訊彈出視窗
  const [selectedItem, setSelectedItem] = useState<AnimeItem | null>(null);

  // 從 API 讀取最新資料
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("無法取得動漫資料:", error);
    }
  };

  // 頁面載入時自動讀取
  useEffect(() => {
    fetchItems();
  }, []);

  // 批次快速更新集數專用
  const handleQuickEpisodeInc = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 阻止開啟詳細視窗
    const itemToUpdate = items.find((item) => item.id === id);
    if (!itemToUpdate) return;

    try {
      const updatedItem = {
        ...itemToUpdate,
        episodesCount: itemToUpdate.episodesCount + 1,
      };

      const res = await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });

      if (res.ok) {
        await fetchItems();
      }
    } catch (err) {
      console.error("快速更新集數失敗:", err);
    }
  };

  // --- 資料處理與計算 (useMemo) ---
  // 1. 統計數據
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const watching = items.filter((i) => i.status === "watching").length;
    const planned = items.filter((i) => i.status === "planned").length;
    const avgRating = total > 0 ? (items.reduce((sum, i) => sum + i.rating, 0) / total).toFixed(1) : "0.0";
    return { total, completed, watching, planned, avgRating };
  }, [items]);

  // 2. 篩選與排序後的項目列表
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        // 搜尋篩選 (中文標題、日文標題、簡介、心得)
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          (item.japaneseTitle && item.japaneseTitle.toLowerCase().includes(query)) ||
          item.description.toLowerCase().includes(query) ||
          (item.personalNote && item.personalNote.toLowerCase().includes(query));

        // 狀態篩選
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;

        // 題材篩選
        const matchesGenre = selectedGenre === "all" || item.genres.includes(selectedGenre);

        return matchesSearch && matchesStatus && matchesGenre;
      })
      .sort((a, b) => {
        // 排序邏輯
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "rating") {
          return b.rating - a.rating;
        }
        if (sortBy === "episodes") {
          return b.episodesCount - a.episodesCount;
        }
        return 0;
      });
  }, [items, searchQuery, statusFilter, selectedGenre, sortBy]);

  // --- 表單與操作事件處理 ---
  // 開啟新增視窗
  const openAddModal = () => {
    setFormMode("add");
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  };

  // 開啟編輯視窗
  const openEditModal = (e: React.MouseEvent, item: AnimeItem) => {
    e.stopPropagation(); // 阻止開啟詳細視窗
    setFormMode("edit");
    setEditingId(item.id);
    setFormData({
      title: item.title,
      japaneseTitle: item.japaneseTitle || "",
      description: item.description,
      imageUrl: item.imageUrl,
      rating: item.rating,
      status: item.status,
      episodesCount: item.episodesCount,
      genres: item.genres,
      releaseYear: item.releaseYear,
      personalNote: item.personalNote || "",
    });
    setIsFormOpen(true);
  };

  // 刪除動漫
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // 阻止開啟詳細視窗
    if (confirm("確定要刪除這部動漫收藏嗎？")) {
      try {
        const res = await fetch(`/api/items?id=${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          await fetchItems();
          // 如果目前正開啟此項目的詳細視窗，則將其關閉
          if (selectedItem?.id === id) {
            setSelectedItem(null);
          }
        } else {
          const err = await res.json();
          alert(`刪除失敗: ${err.error || "未知錯誤"}`);
        }
      } catch (err) {
        console.error("刪除項目出錯:", err);
        alert("連線失敗，請稍後再試！");
      }
    }
  };

  // 切換題材選取 (表單中)
  const handleGenreToggle = (genre: string) => {
    setFormData((prev) => {
      const alreadyHas = prev.genres.includes(genre);
      const newGenres = alreadyHas
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres: newGenres };
    });
  };

  // 表單送出 (新增 / 編輯)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("請輸入動漫中文名稱！");
      return;
    }

    const finalImageUrl = formData.imageUrl.trim() || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600";

    try {
      if (formMode === "add") {
        // 新增模式
        const newItem = {
          title: formData.title,
          japaneseTitle: formData.japaneseTitle.trim() || undefined,
          description: formData.description.trim() || "暫無簡介資訊。",
          imageUrl: finalImageUrl,
          rating: formData.rating,
          status: formData.status,
          episodesCount: Number(formData.episodesCount) || 0,
          genres: formData.genres.length > 0 ? formData.genres : ["未分類"],
          releaseYear: Number(formData.releaseYear) || new Date().getFullYear(),
          personalNote: formData.personalNote.trim() || undefined,
        };

        const res = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });

        if (res.ok) {
          await fetchItems();
        } else {
          const err = await res.json();
          alert(`新增失敗: ${err.error || "未知錯誤"}`);
        }
      } else {
        // 編輯模式
        if (!editingId) return;
        const updatedItem = {
          id: editingId,
          title: formData.title,
          japaneseTitle: formData.japaneseTitle.trim() || undefined,
          description: formData.description.trim() || "暫無簡介資訊。",
          imageUrl: finalImageUrl,
          rating: formData.rating,
          status: formData.status,
          episodesCount: Number(formData.episodesCount) || 0,
          genres: formData.genres.length > 0 ? formData.genres : ["未分類"],
          releaseYear: Number(formData.releaseYear) || new Date().getFullYear(),
          personalNote: formData.personalNote.trim() || undefined,
        };

        const res = await fetch("/api/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });

        if (res.ok) {
          const updated = await res.json();
          await fetchItems();
          // 同步更新已開啟的詳細視窗資料
          if (selectedItem?.id === editingId) {
            setSelectedItem(updated);
          }
        } else {
          const err = await res.json();
          alert(`更新失敗: ${err.error || "未知錯誤"}`);
        }
      }
    } catch (err) {
      console.error("提交表單出錯:", err);
      alert("與伺服器連線失敗，請稍後再試！");
    }

    setIsFormOpen(false);
    setFormData(EMPTY_FORM);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen w-full bg-radial from-slate-900 via-zinc-950 to-black text-slate-100 font-sans antialiased pb-20">
      {/* 背景裝飾光暈 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 導覽列與標題 */}
      <header className="border-b border-slate-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              ANIDEX
            </span>
            <span className="hidden sm:inline px-2 py-0.5 rounded text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              動漫收藏閣
            </span>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新增收藏</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 relative z-0">
        {/* 統計數據面板 */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* 總收藏 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="text-slate-400 text-sm font-medium">總收藏數</div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-bold text-white">{stats.total}</span>
              <span className="text-slate-400 text-xs">部作品</span>
            </div>
          </div>
          {/* 觀看中 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="text-sky-400 text-sm font-medium flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span>觀看中</span>
            </div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-bold text-sky-300">{stats.watching}</span>
              <span className="text-slate-400 text-xs">部</span>
            </div>
          </div>
          {/* 已看完 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="text-emerald-400 text-sm font-medium">已看完</div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-bold text-emerald-300">{stats.completed}</span>
              <span className="text-slate-400 text-xs">部</span>
            </div>
          </div>
          {/* 待看 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="text-amber-400 text-sm font-medium">待看清單</div>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-bold text-amber-300">{stats.planned}</span>
              <span className="text-slate-400 text-xs">部</span>
            </div>
          </div>
          {/* 平均評分 */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-2xl col-span-2 md:col-span-1 flex flex-col justify-between">
            <div className="text-fuchsia-400 text-sm font-medium">平均評分</div>
            <div className="flex items-baseline space-x-1 mt-2">
              <span className="text-3xl font-bold text-fuchsia-300">{stats.avgRating}</span>
              <span className="text-amber-400 text-xl font-bold">★</span>
            </div>
          </div>
        </section>

        {/* 搜尋、過濾、排序控制條 */}
        <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* 搜尋框 */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜尋動漫中文/日文片名、簡介、心得..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
            </div>

            {/* 篩選與排序 */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 觀看狀態篩選 */}
              <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                {[
                  { value: "all", label: "全部" },
                  { value: "watching", label: "觀看中" },
                  { value: "completed", label: "已看完" },
                  { value: "planned", label: "待看" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === tab.value
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 排序選單 */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="newest">最新加入</option>
                <option value="oldest">最舊加入</option>
                <option value="rating">評分最高</option>
                <option value="episodes">集數最高</option>
              </select>
            </div>
          </div>

          {/* 題材篩選標籤列 */}
          <div className="border-t border-slate-850 pt-4">
            <div className="text-xs text-slate-450 font-medium mb-2.5">按題材分類篩選：</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  selectedGenre === "all"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                    : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                全部題材
              </button>
              {AVAILABLE_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedGenre === genre
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                      : "bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 收藏列表區塊 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>動漫收藏清單</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-normal">
                已顯示 {filteredAndSortedItems.length} 部
              </span>
            </h2>
          </div>

          {filteredAndSortedItems.length === 0 ? (
            // 空狀態
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-900/20 rounded-2xl border border-slate-850 text-center">
              <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v4.5m12+3.5h.01M16.24 7.76a6 6 0 100 8.49" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-350">找不到符合條件的動漫</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">
                試試看清除關鍵字、狀態過濾或新增一些有趣的動漫收藏吧！
              </p>
              <button
                onClick={openAddModal}
                className="mt-6 text-sm bg-violet-600/30 hover:bg-violet-600/45 text-violet-300 border border-violet-500/30 px-5 py-2.5 rounded-xl transition-all"
              >
                新增第一筆收藏
              </button>
            </div>
          ) : (
            // 卡片網格
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAndSortedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 flex flex-col justify-between"
                >
                  <div>
                    {/* 卡片封面圖 */}
                    <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden w-full">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // 載入失敗時的後備封面
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600";
                        }}
                      />
                      {/* 年份角標 */}
                      <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm text-[10px] font-semibold text-slate-300 px-2 py-0.5 rounded-md border border-white/5">
                        {item.releaseYear}
                      </span>
                      {/* 狀態角標 */}
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm border ${
                          item.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                            : item.status === "watching"
                            ? "bg-sky-500/15 text-sky-400 border-sky-500/25"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                        }`}
                      >
                        {item.status === "completed" ? "已看完" : item.status === "watching" ? "觀看中" : "待觀看"}
                      </span>
                    </div>

                    {/* 卡片內容資訊 */}
                    <div className="p-4 space-y-2.5">
                      {/* 評分星星與題材標籤 */}
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className="mr-0.5">
                              {i < item.rating ? "★" : "☆"}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1 overflow-hidden">
                          {item.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 標題與日文標題 */}
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-base text-slate-100 group-hover:text-violet-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        {item.japaneseTitle && (
                          <p className="text-[10px] text-slate-550 line-clamp-1 italic">
                            {item.japaneseTitle}
                          </p>
                        )}
                      </div>

                      {/* 簡介 */}
                      <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* 卡片底部功能操作 */}
                  <div className="p-4 pt-0 border-t border-slate-850/50 mt-3 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span>已看 {item.episodesCount} 集</span>
                      {item.status === "watching" && (
                        <button
                          onClick={(e) => handleQuickEpisodeInc(e, item.id)}
                          title="快速+1集"
                          className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 w-5 h-5 rounded-full flex items-center justify-center border border-sky-500/20 active:scale-90 transition-all font-bold"
                        >
                          +
                        </button>
                      )}
                    </div>
                    {/* 按鈕組 */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => openEditModal(e, item)}
                        title="編輯"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        title="刪除"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 底部頁尾 */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900/80 mt-20 pt-8 text-center text-xs text-slate-500">
        <p>© 2026 ANIDEX 動漫收藏庫 - High School Next.js Final Project</p>
        <p className="mt-1 text-slate-650">使用 Next.js Client State 暫存儲存</p>
      </footer>

      {/* 彈出視窗 1：新增/編輯動漫 Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal 頭部 */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {formMode === "add" ? "新增動漫收藏" : `編輯：${formData.title}`}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal 表單內容 */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* 中文片名 */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">
                  中文名稱 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例：葬送的芙莉蓮"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* 日文片名 */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">日文名稱 (選填)</label>
                <input
                  type="text"
                  placeholder="例：葬送のフリーレン"
                  value={formData.japaneseTitle}
                  onChange={(e) => setFormData({ ...formData, japaneseTitle: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 狀態選單 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-450 mb-1">觀看狀態</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "watching" | "completed" | "planned",
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="watching">觀看中</option>
                    <option value="completed">已看完</option>
                    <option value="planned">待觀看</option>
                  </select>
                </div>

                {/* 個人評分 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-450 mb-1">個人評分</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (完美神作)</option>
                    <option value={4}>⭐⭐⭐⭐ (好看推薦)</option>
                    <option value={3}>⭐⭐⭐ (普普通通)</option>
                    <option value={2}>⭐⭐ (不太推)</option>
                    <option value={1}>⭐ (雷作)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 已看集數 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-450 mb-1">已看集數</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.episodesCount}
                    onChange={(e) => setFormData({ ...formData, episodesCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                {/* 首播年份 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-450 mb-1">首播年份</label>
                  <input
                    type="number"
                    min={1950}
                    max={2030}
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>

              {/* 圖片連結與快捷按鈕 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-450">封面圖片網址 (URL)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
                      })
                    }
                    className="text-[10px] text-violet-400 hover:text-violet-300"
                  >
                    自動填入測試圖
                  </button>
                </div>
                <input
                  type="url"
                  placeholder="例：https://images.unsplash.com/... 或留空使用預設圖"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* 題材標籤選擇 */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-2">題材分類 (可複選)</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = formData.genres.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-violet-600 text-white border-violet-500"
                            : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 作品簡介 */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">作品簡介</label>
                <textarea
                  rows={3}
                  placeholder="輸入動畫的大致劇情背景與大綱..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                />
              </div>

              {/* 個人筆記心得 */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1">個人評價/心得筆記 (選填)</label>
                <textarea
                  rows={3}
                  placeholder="寫下你的評價、最喜歡的角色、哭點或推薦的原因..."
                  value={formData.personalNote}
                  onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                />
              </div>

              {/* 底部按鈕 */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium px-4 py-2.5 rounded-xl text-sm transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-violet-500/20"
                >
                  {formMode === "add" ? "確認新增" : "儲存修改"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 彈出視窗 2：動漫詳細資料 Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]">
            {/* 封面圖半部 (左側) */}
            <div className="relative w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-black flex-shrink-0">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600";
                }}
              />
              <span className="absolute top-4 left-4 bg-black/85 text-xs font-semibold text-slate-200 px-3 py-1 rounded-lg border border-white/5">
                {selectedItem.releaseYear} 年首播
              </span>
            </div>

            {/* 資料半部 (右側) */}
            <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto flex-1">
              <div>
                {/* 關閉按鈕 */}
                <div className="flex justify-end md:absolute md:top-4 md:right-4 z-10 mb-4 md:mb-0">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="bg-slate-800/80 hover:bg-slate-700 text-slate-350 hover:text-white p-1.5 rounded-full transition-all border border-slate-750"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 標題與日文片名 */}
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        selectedItem.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                          : selectedItem.status === "watching"
                          ? "bg-sky-500/15 text-sky-400 border-sky-500/25"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/25"
                      }`}
                    >
                      {selectedItem.status === "completed" ? "已看完" : selectedItem.status === "watching" ? "觀看中" : "待觀看"}
                    </span>
                    <span className="text-xs text-slate-400">
                      已看 {selectedItem.episodesCount} 集
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white leading-tight">
                    {selectedItem.title}
                  </h2>
                  {selectedItem.japaneseTitle && (
                    <p className="text-xs text-slate-500 italic font-medium">
                      {selectedItem.japaneseTitle}
                    </p>
                  )}
                </div>

                {/* 評分與分類題材 */}
                <div className="flex items-center gap-4 py-4 border-y border-slate-850 my-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">個人評分</div>
                    <div className="flex text-amber-400 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-base mr-0.5">
                          {i < selectedItem.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-l border-slate-850 h-8" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">題材標籤</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {selectedItem.genres.map((genre) => (
                        <span
                          key={genre}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 簡介與心得 */}
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-1">作品簡介</h4>
                    <p className="text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-850/40">
                      {selectedItem.description}
                    </p>
                  </div>
                  {selectedItem.personalNote && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 mb-1">個人心得筆記</h4>
                      <p className="text-fuchsia-300 bg-fuchsia-950/10 p-3 rounded-xl border border-fuchsia-900/10">
                        {selectedItem.personalNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 編輯 / 刪除底列 */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-850">
                <span className="text-[10px] text-slate-550">
                  加入時間: {new Date(selectedItem.createdAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => openEditModal(e, selectedItem)}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>編輯作品</span>
                  </button>
                  <button
                    onClick={(e) => {
                      handleDeleteItem(e, selectedItem.id);
                    }}
                    className="flex items-center space-x-1 bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>刪除作品</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
