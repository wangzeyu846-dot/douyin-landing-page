# 项目：抖音 App 产品落地页

## 全局技术约束
- Vite + React + TS + Tailwind (v4)
- 动效只用 GSAP + ScrollTrigger，按 gsap-skills 的 canonical skeleton 写
- 严禁 window.addEventListener('scroll')；滚动驱动用 ScrollTrigger / useScroll / CSS scroll-driven
- 必须支持 prefers-reduced-motion：开启时所有动效降级为 instant
- 文字/背景类动效优先用 react-bits 组件（shadcn registry 接入），不要手写粒子/流体
- 所有组件用 TS + Tailwind 变体

## 设计 token（taste-skill 旋钮）
- VARIANCE: high        —— 版式要有反差，拒绝统一网格、拒绝空 bento、拒绝左右分栏套路
- MOTION: cinematic     —— 滚动叙事 + scrub + pinned，动效必须有动机（层级/反馈/叙事），不为动而动
- DENSITY: balanced     —— 内容丰富但不挤，hero 阶段保持呼吸感

## 品牌色板（暗夜霓虹）
- 背景主色: #050505 / #0A0A0A（纯黑偏冷）
- 主霓虹青: #00F2EA
- 霓虹玫红: #FE2C55
- 辅助紫: #7C3AED（仅极少量点缀）
- 文字: #FFFFFF / rgba(255,255,255,0.6)
- 禁止默认 purple-gradient；禁止廉价的彩色文字阴影
- 字体：中文用系统栈 + 一个现代无衬线（如 Inter / Manrope）做数字与英文

## 禁止清单（taste-skill）
- 不要六行窄 hero 标题、不要 meta 标签式副标题
- 不要空 bento 格子、不要泛泛左右图文区
- 不要"登录即领"式廉价 CTA
- 每节之间用滚动叙事衔接，不要生硬分割线

## 工作方式
- 按节交付，每完成一节停下来等我 review，不要一口气写完整站
- 每节完成后告诉我：用了哪个 react-bits 组件、哪段 GSAP 做了什么
