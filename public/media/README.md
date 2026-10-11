# Pexels 演示视频

第二节和第三节使用两套独立的 Pexels 原始 720p CDN 直链，不裁短、不重复拼接，也不共用视频。

全部 13 段（第二节 5 段、第三节 8 段）的来源、准确时长、文件字节数、动作说明和封面在 video-library.json；代码绑定在 src/data/videoLibrary.ts。每段至少 8 秒、小于 3,000,000 字节。非激活／未预览的 video 没有 src，preload="none"。

posters/ 为所选原片的静态封面；backdrops/ 保留全局电影背景。

TODO: 替换为抖音短视频切片，放 src/assets/clips/，保留对应版权授权记录。
