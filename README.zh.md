# dsh-subagent-marker

**给 DeepSeek Harness 子代理会话的输入框加标识。**

子代理会话和主会话的输入框长得一模一样。这个插件在输入框底部工具行的左端加一粒胶囊，让你知道自己在往哪个会话里打字。

文案跟随浏览器语言：中文显示「子代理」，其他语言显示 `subagent`。

[English](README.md) | [中文](README.zh.md)

## 功能

- 只在当前会话是子代理时渲染胶囊。主会话不渲染任何东西，工具行保持原来的布局和间距。
- 悬停胶囊显示模式（`可继续`、`一次性`、`外部`、`模式未知`）和父会话标题。
- 颜色取自主题的警告色变量，亮色和暗色都不用另写调色板。
- 一个槽位注册项，没有 Host 逻辑，不访问网络。

一次性子代理和父会话离线的子代理，DSH 会用只读输入区替换整个工具行。胶囊在这两种会话里不出现，这两种会话本来也无法输入。

## 要求

- DSH 0.2.1-rc.2 或更新。插件读取会话快照里的 `subagent.address`，并注册到 `conversation.input.left`，这两样在这个版本才有。

## 安装

插件市场上架后：**设置 → 插件管理器** → 搜索 `dsh-subagent-marker` → 安装。

手动安装：

```bash
dsh plugin add dsh-subagent-marker
```

从本地目录安装：

```bash
dsh plugin add link:/absolute/path/to/dsh-subagent-marker
```

## 开关

安装时会应用插件自带的 `cordis.patch.yml`。想让开关只改一处，往 profile 的 `cordis.patch.yml` 加一行覆盖：

```yaml
- id: subagent-marker
  disabled: true
```

profile 层在所有 bundle 层之后应用，不带 `insert` 的补丁按 id 覆盖已有条目，所以这一行能改到 bundle 插入的那一行。删掉它就恢复显示。存盘后 Host 重新组合插件树，浏览器的模块图跟着更新，胶囊出现或消失都不用重启，也不用刷新页面。

不要在 profile 层重复写 `insert` 段。同 id 的两个条目都会挂载，标识会注册两次。

## 卸载

先删掉 profile `cordis.patch.yml` 里的插入行，再执行：

```bash
dsh plugin remove dsh-subagent-marker
```

## 实现

包分两半。`index.js` 是 Host 半部，只导出一个空的 `apply()`。看得见的东西全在 `client.js`：`package.json` 声明了 `dsh.client` 并导出 `./client`，Host 据此把它投递给页面。

`client.js` 往 `conversation.input.left` 槽注册一个条目。这个槽是 list 类型，位于输入框底部工具行左侧、权限选择器和 plan 控件之后。组件从会话快照取 `subagent`：主会话为 `null`，子代理会话为 `{ address, parentAvailable? }`。取到 `null` 时组件返回 `null`，DOM 里不新增节点。

## 开发

没有构建步骤。`exports["./client"]` 直接指向 `client.js`，改这个文件就是改投递内容。首次安装后重启一次 Host；之后存盘，下次加载即生效。

## 发布

还没发布到 npm，也没进插件市场索引。发布流程待定。

## 许可证

MIT
