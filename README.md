# 动漫收藏网站

## 项目简介
本项目是一个使用 **Next.js (App Router)**、**TypeScript** 与 **Tailwind CSS** 构建的动漫收藏网站。用户可以在页面上新增、查看、删除动漫条目，数据持久化在 `data/data.json`，后端通过 `app/api/items/route.ts` 提供 **GET**、**POST**、**PUT**、**DELETE** 接口。

## 目录结构
```
.
├─ app/                # 页面与 API 路由
│  ├─ api/items/       # items API（GET/POST/PUT/DELETE）
│  ├─ page.tsx         # 主页面，使用 useState、useEffect 与 fetch
│  └─ ...
├─ data/               # 存放 data.json（本地“数据库”）
├─ public/             # 静态资源
├─ README.md           # 本说明文件（中文）
├─ package.json        # 项目依赖
└─ ...
```

## 本地运行
```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:3000）
npm run dev
```

## 构建生产版本
```bash
npm run build
npm start   # 运行已构建的产出
```

## Git 操作流程（已在 CI 中自动执行）
1. **添加/修改文件**：`git add <file>`
2. **提交**：`git commit -m "说明信息"`
3. **推送到远端**：`git push origin main`
   - 推送时会弹出浏览器进行 GitHub **网页认证**（OAuth），登录并授权后即可完成。 

---
> 本项目已在 GitHub 上公开，仓库地址： https://github.com/momo20090406/week07
