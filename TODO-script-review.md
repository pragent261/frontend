# 脚本审核（Figma 83:3891）还原 · 待办 & 字段缺口

> 对应改动：[src/components/TaskProgress.tsx](src/components/TaskProgress.tsx) 的 `renderScriptList()` + [src/styles.css](src/styles.css) 的 `sr-*` 样式。
> 范围：只重做「我的任务 → 脚本审核」标签内容区；卡片绑定真实数据 `/v1/tasks?type=need_script_review`，`接受脚本` = `approve-script`。

---

## 一、后端缺失字段（导致无法 100% 还原 Figma）

当前 `TaskItem` 数据模型缺少以下 Figma 卡片用到的字段，已用「合理默认/装饰」临时顶替。若后端补上，可一一替换为真实值：

| Figma 元素 | Figma 示例 | 现在临时用 | 需要的后端字段（建议） |
|------------|-----------|-----------|----------------------|
| 达人头像图 | 真实头像图片 | 首字母 + 颜色色块 | `influencer.avatar_url` |
| 达人姓名 | `Jane Doe` | `influencer_id`（ID 字符串） | `influencer.name` / `nickname` |
| 角色/副标题 | `Design` / `Software development` | `campaign.name` | `influencer.role` 或达人领域标签 |
| 时间 | `• 4m ago` | 固定写「• 待审核」 | `script_submission.created_at`（提交时间，用于相对时间） |
| 状态标签 | `Pending`（黄） | 固定写「Pending」样式 | `script_submission.status`（pending/approved/...） |
| 绿色药丸服务名 | `Portfolio + Resume Help` | `campaign.name` | 合作/服务名称字段（如已有可保留 campaign.name） |
| 绿色药丸尾部 | `Free` / `500 BTRST` | `collaboration_status` | 报价/积分字段（如 `offer.price` / `btrst_amount`），项目无积分体系则可永久省略 |

---

## 二、有意的取舍 / 与 Figma 的差异（重要）

- **脚本内容预览**：Figma 卡片里没有脚本正文，但「审核」必须能看到脚本。已在绿色药丸下方加一行低调的 `item.script_text` 预览（`.sr-card__script`）。这是相对 Figma 的**有意补充**。
- **头像**：无头像图，用「达人名首字母 + 调色板色块」（参考 Figma 蓝色圆 `#1e3a8a`）。
- **时间 / 价格 / 真实姓名**：见上表，均为占位，等后端字段。

---

## 三、占位 / 未接功能（待后续单独做）

- [ ] **「沟通」按钮**：目前为占位无操作。`ChatModal`（[src/components/ChatModal.tsx](src/components/ChatModal.tsx)）现为写死的全屏组件、未路由，需要先改造成可控弹窗（接收 `collaborationId`/`influencerId`、open/close）再接入。
- [ ] **「⋮」更多菜单**：目前为图标按钮占位，可接「查看脚本 / 拒绝脚本」等操作。
- [ ] **`Getting help` / `Giving help` 子标签**：当前为本地装饰状态（`scriptSubTab`），切换不联动数据。如需真实区分「我收到的 / 我发出的」，需后端提供对应过滤维度。
- [ ] **`All offers` 下拉**：当前为本地装饰筛选（`offersFilter`），不调接口。如需真实筛选（按状态等），需后端支持过滤参数。
- [ ] **「接受脚本」=「批准脚本」语义**：按钮文案改成了 Figma 的「接受脚本」，实际调用仍是 `approve-script`。确认产品文案以哪个为准。

---

## 四、已完成（参考）

- [x] `renderScriptList()` 改为 Figma 灰色面板 + 子标签 + All offers 下拉 + offer 卡片。
- [x] 卡片绑定真实数据；`接受脚本` → `approve-script`，复用 loading 与成功后本地移除。
- [x] 新增 `sr-*` 样式，颜色/圆角/字号严格照 Figma。
- [x] 确认合作 / 产品寄送两个标签视觉与功能未改动。
- [x] `pnpm build` 通过、无新增 lint 错误。

---

## 五、不在本次范围

- 不改页面外壳（侧边栏 / 顶栏 / banner / 积分卡）与另外两个标签。
- 不引入 Tailwind；沿用全局 `styles.css` + AntD。
