# 启动悬浮窗（sai2-window-float）

> sai2工作台的**官方插件**，独立仓库开发与发版。工作目录：
> `C:\Users\11421\Documents\sai2工作台\sai2-window-float\`。
> 原为工作台内置插件 `launcher-float`，现独立成包；装回工作台后行为与内置版完全一致。

启动 SAI2 后把工作台收成右上角悬浮小窗，随时展开；支持最小化 / 关闭到托盘。
插件只决定「什么时候触发」和「用户想要什么行为」，**悬浮窗 UI 与托盘行为由工作台内核提供**，
不随插件搬走，也不需要修改内核。

## 兼容契约

本插件只依赖 sai2工作台的公开插件契约：

- `plugin.json` v1（含 `inject: ["window-manager"]`）；
- `PluginContext` 的 `ctx.get('window-manager')`、`ctx.on('opener_after_launch')`、
  `ctx.addToolbarAction`、`ctx.setStatus`、`ctx.config` / `ctx.effect`；
- 内核注册的服务 `window-manager`（由 `plugins.provide('window-manager', wm)` 注入）。

**从工作台 v0.1.0 起可用**。插件不依赖工作台内部源码，两边可各自独立迭代。
插件 id 保持 `launcher-float`，配置键 `plugins.config.launcher-float` 平滑沿用，升级不会丢配置。

> 悬浮窗 UI（`FloatBar`）、窗口置顶 / 缩放、系统托盘图标与菜单都在工作台内核里，
> 因此本包不复制、也不替换这些实现。

## 安装

1. 在本仓库执行 `npm run build`，生成 `dist\sai2-window-float-1.0.0.zip`；
2. 工作台「插件」页点「安装」，选择该 zip（插件中心安装会自动解压并识别顶层 `sai2-window-float/` 目录）；
3. 重启工作台后在插件列表确认「启动悬浮窗」状态为运行中。

也可以把仓库里的 `plugin.json` + `index.js` 直接放进工作台数据目录的 `plugins/launcher-float/`。

如果工作台里还留着内置的「悬浮能力说明」占位项，可以忽略它——它只提供安装指引，不影响本插件。

## 配置

插件中心的「启动悬浮窗」配置页共六项，保存后自动重载并立即生效：

| 配置项 | 默认值 | 作用 |
|---|---|---|
| 启动 SAI2 后自动变悬浮窗 | 开 | 仅在通过工作台启动 SAI2 时触发；从别处打开 SAI2 不会误触 |
| 最小化按钮改为「收进托盘」 | 开 | 标题栏「—」隐藏到系统托盘，双击托盘图标恢复 |
| 关闭按钮改为「收进托盘」 | 关 | 开启后点「×」只隐藏窗口，需从托盘菜单选「退出工作台」 |
| 悬浮窗始终置顶 | 开 | 盖在 SAI2 上方；挡到画布可关掉 |
| 悬浮窗宽度 | 336 | 240~560px，保存后立即按新尺寸重排 |
| 悬浮窗高度 | 132 | 100~260px |

工具栏动作「切换悬浮窗 / 展开主界面」可在没启动 SAI2 时手动切换。

## 开发

```bash
npm test         # 5 项契约断言（node 内置 test runner，无依赖）
npm run build    # 生成 dist/sai2-window-float-<version>.zip 并打印 sha256
```

单元测试从工作台框架的 `tests/unit/launcher-float.test.ts` 移植而来，插件的验证现在随本仓库走。

版本号以 `plugin.json` 的 `version` 为准；出包内容仅 `plugin.json`、`index.js`、`README.md`，
staging 目录为 `dist/stage/sai2-window-float/`。依赖：Node.js + Python 3（仅用于打zip）。

本仓库与工作台框架各自提交、构建、发版；不打包主程序、不替换工作台 Release 附件。
