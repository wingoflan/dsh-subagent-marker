# dsh-subagent-marker

**给 DeepSeek Harness 子代理会话的输入框加标识。**

沟槽的 dsh UI 设计，一晚上好几次在查看 subagent 内容之后误输入 prompt 给 subagent，浪费数百 K token，一怒之下遂跑了这么个插件。

只加了个标签，其他什么都没干。大概不会影响其他插件。

[English](https://github.com/wingoflan/dsh-subagent-marker/blob/main/README.en.md) | [中文](https://github.com/wingoflan/dsh-subagent-marker/blob/main/README.md)

![子代理会话输入框右侧的 subagent 标识](https://raw.githubusercontent.com/wingoflan/dsh-subagent-marker/main/assets/screenshot.png)

## 功能

- 只在当前会话是子代理时渲染标记。主会话不渲染任何东西，工具行保持原来的布局和间距。

一次性子代理和父会话离线的子代理，DSH 会用只读输入区替换整个工具行。标记在这两种会话里不出现，这两种会话本来也无法输入。

## 安装

手动安装：

```bash
dsh plugin add dsh-subagent-marker
```

从本地目录安装：

```bash
dsh plugin add link:/absolute/path/to/dsh-subagent-marker
```

## 开关

安装时会应用插件自带的 `cordis.patch.yml`。想关掉，往 profile 的 `cordis.patch.yml` 加一行覆盖：

```yaml
- id: subagent-marker
  disabled: true
```

profile 层在所有 bundle 层之后应用，不带 `insert` 的补丁按 id 覆盖已有条目，所以这一行能改到 bundle 插入的那一行。删掉它就恢复显示。

不要在 profile 层重复写 `insert` 段。同 id 的两个条目都会挂载，标记会注册两次。

## 卸载

先删掉 profile `cordis.patch.yml` 里的覆盖行，再执行：

```bash
dsh plugin remove dsh-subagent-marker
```

## 实现

包分两半。`index.js` 是 Host 半部，只导出一个空的 `apply()`。看得见的东西全在 `client.js`：`package.json` 声明了 `dsh.client` 并导出 `./client`，Host 据此把它投递给页面。

`client.js` 往 `conversation.input.right` 槽注册一个条目。这个槽是 list 类型，位于输入框底部工具行右侧的控制区，在模型选择器旁边、停止和发送按钮之前。组件从会话快照取 `subagent`，主会话为 `null` 时返回 `null`，DOM 里不新增节点。

## 开发

没有构建步骤。`exports["./client"]` 直接指向 `client.js`，改这个文件就是改投递内容。首次安装后重启一次 Host 才会加载新包。

## 许可证

MIT
