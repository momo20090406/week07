# 動漫收藏網站

## 專案簡介
本專案是一個使用 **Next.js (App Router)**、**TypeScript** 與 **Tailwind CSS** 建置的動漫收藏網站。使用者可以在頁面上新增、查看、刪除動漫條目，資料持久化於 `data/data.json`，後端透過 `app/api/items/route.ts` 提供 **GET**、**POST**、**PUT**、**DELETE** 介面。

## 目錄結構
```
.
├─ app/                # 頁面與 API 路由
│  ├─ api/items/       # items API（GET/POST/PUT/DELETE）
│  ├─ page.tsx         # 主頁面，使用 useState、useEffect 與 fetch
│  └─ ...
├─ data/               # 存放 data.json（本地「資料庫」）
├─ public/             # 靜態資源
├─ README.md           # 本說明文件（繁體中文）
├─ package.json        # 專案依賴
└─ ...
```

## 本機執行
```bash
# 安裝相依套件
npm install

# 啟動開發伺服器（http://localhost:3000）
npm run dev
```

## 建置生產版本
```bash
npm run build
npm start   # 執行已建置的產出
```
