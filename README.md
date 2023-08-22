## vConsole Easy Mock Plugin

[![Node.js Package](https://github.com/EduarteXD/vconsole-mock-xhr/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/EduarteXD/vconsole-mock-xhr/actions/workflows/npm-publish.yml)

### 简介

<img src="image.png" style="width: 350px">

vConsole简易Mock请求插件

### 使用说明

安装

```shell
npm install vconsole-mock-xhr
// or
yarn add vconsole-mock-xhr
// or
pnpm install vconsole-mock-xhr
```

在程序入口加入

```typescript
import vconsole from 'console'

import 'vconsole-mock-xhr/style.css'
import { createMockXHRPlugin } from 'vconsole-mock-xhr'

const vc = new vconsole()
vc.addPlugin(createMockXHRPlugin())
```
