## vConsole Easy Mock Plugin

[![Node.js Package](https://github.com/EduarteXD/vconsole-mock-xhr/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/EduarteXD/vconsole-mock-xhr/actions/workflows/npm-publish.yml)

### 简介

<img src="https://github.com/EduarteXD/vConsole-easy-mock/blob/main/image.png?raw=true" style="width: 350px">

vConsole Mock请求插件

### 使用说明

安装

```shell
npm install vconsole-easy-mock
// or
yarn add vconsole-easy-mock
// or
pnpm install vconsole-easy-mock
```

在程序入口加入

```typescript
import vconsole from 'console'

import 'vconsole-easy-mock/style.css'
import { createEasyMockPlugin } from 'vconsole-easy-mock'

const vc = new vconsole()
vc.addPlugin(createEasyMockPlugin())
```
