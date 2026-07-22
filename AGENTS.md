# AGENTS.md

## 基本原则

1. 所有读取、修改、生成的文件必须使用 UTF-8 编码，避免中文和特殊字符乱码。
2. 修改代码前先理解项目结构、调用关系和现有实现。优先复用已有代码结构和公共方法，不重复实现类似功能。
3. 遵循最小改动原则，只修改需求必须部分。不随意重构无关模块，不改变已有接口行为，除非需求明确要求。
4. 保持代码简洁和现有风格。避免无实际作用的代码、重复逻辑、过度封装，以及无使用场景的工具类、抽象层、配置项。
5. 新增代码职责应清晰。只在复杂逻辑处添加必要注释；新增函数需要添加函数注释。
6. 如果字段含义、数据格式、接口约定或业务规则不明确，且会影响实现正确性，应先向用户询问，不要擅自假设。只有在项目已有兼容逻辑、需求明确要求，或真实调用场景需要时，才添加最小范围的兼容处理。
7. 输出代码修改时，优先给出实际可执行、已接入项目的修改，避免示例代码、伪代码或额外无关文件。

## 组件/能力规范
本项目使用 `@puture-ui/*` 组件库，禁止用 naive-ui 原生组件（NSelect / NDatePicker / NForm / NDataTable 等）
去实现组件库已提供的场景。

### AI 使用指引

阅读 https://ui-test-01.external.sub.puture-in.com/llms-full.txt 并理解 puture-ui 组件库，
在编写 Vue 前端代码时使用这些知识。

单个组件文档：
https://ui-test-01.external.sub.puture-in.com/components/<name>.md
（如 base-select.md、country-select.md、date-range-picker.md、search-form.md）

### 页面模板检索

需要开发完整页面（列表页 / 详情页 / 表单页等）时，优先按以下顺序：

1. 查阅模板清单：
   https://ui-test-01.external.sub.puture-in.com/example/templates.json

2. 根据 `whenToUse` / `tags` / `description` 匹配到合适模板。

3. 命中模板后，若该条目带 `designGuideUrl`，先 fetch 这份设计指南，
   理解该页面类型的布局约束（分区、栅格、按钮权重、高度处理等）。

4. 再读取条目中的 `sourceUrl` 获取 Vue 模板源码。
   旧清单若缺少 `sourceUrl`，使用：
   https://ui-test-01.external.sub.puture-in.com/example/templates/<name>.vue
   （`<name>` 即 `templates.json` 中该条目的 `name` 字段）

5. 在模板源码基础上按需求改字段、改列、改交互，不要从零拼装。
   模板中出现的具体控件（NSelect / NRadioGroup 等）仅是示例填充，
   实际筛选项按 llms-full.txt 的组件优先级规则重新选型，不要照抄。

6. 无匹配模板时，退回到组件粒度：
   参考 llms-full.txt 与 components/<name>.md 自行组合 Pc* 组件；
   通用设计规范（颜色 / 尺寸 / 字体等）已包含在 llms-full.txt 里。

### 选组件流程

1. 判断是否属于组件库已覆盖的场景（下拉、日期区间、搜索表单、国家选择等）
2. 是 → 读上方 llms-full.txt 找到对应 Pc* 组件，用它
3. 否 → 才允许直接用 naive-ui

## 代码规范

- 所有文件使用 UTF-8 编码
- 文件命名使用 lower-case-kebab-case

## 修改要求

修改代码时：

- 只修改需求相关代码
- 不重构无关模块
- 不改变现有业务逻辑
- 不调整代码风格

## 输出要求

提交代码时：

- 说明修改内容
- 说明影响范围
- 说明新增文件
