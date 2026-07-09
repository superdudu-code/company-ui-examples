import { createHash } from "node:crypto"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

interface TemplateMeta {
  name: string
  title: string
  description: string
  whenToUse?: string
  entryLocal: string
  entryUrl?: string
  designGuideUrl?: string
  route?: string
  tags?: string[]
}

interface TemplateOutput {
  name: string
  title: string
  description: string
  whenToUse?: string
  entryUrl: string
  designGuideUrl?: string
  route?: string
  tags?: string[]
  version: string
}

const requiredFields = ["name", "title", "description", "entryLocal"] as const

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const examplesRoot = resolve(scriptsDir, "..")
const viewsDir = resolve(examplesRoot, "src/views")
const publicDir = resolve(examplesRoot, "public")
const templatesDir = resolve(publicDir, "templates")
const templatesJsonPath = resolve(publicDir, "templates.json")

/**
 * 递归收集 views 目录下的模板元数据文件。
 */
async function collectMetaFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const entryPath = resolve(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectMetaFiles(entryPath)))
      continue
    }

    if (entry.isFile() && entry.name === "template.meta.json") {
      files.push(entryPath)
    }
  }

  return files.sort((left, right) => left.localeCompare(right))
}

/**
 * 读取并解析模板元数据文件。
 */
async function readTemplateMeta(filePath: string): Promise<TemplateMeta> {
  const content = await readFile(filePath, "utf-8")

  try {
    return JSON.parse(content) as TemplateMeta
  } catch (error) {
    throw new Error(`模板元数据 JSON 解析失败：${formatPath(filePath)}\n${getErrorMessage(error)}`)
  }
}

/**
 * 校验模板元数据的必填约定。
 */
function validateTemplateMeta(meta: TemplateMeta, filePath: string): void {
  for (const field of requiredFields) {
    if (typeof meta[field] !== "string" || meta[field].trim() === "") {
      throw new Error(`模板元数据缺少必填字段 ${field}：${formatPath(filePath)}`)
    }
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name)) {
    throw new Error(`模板 name 必须为 kebab-case：${formatPath(filePath)} (${meta.name})`)
  }

  if (meta.entryUrl !== undefined && (typeof meta.entryUrl !== "string" || meta.entryUrl.trim() === "")) {
    throw new Error(`模板 entryUrl 必须为非空字符串：${formatPath(filePath)}`)
  }

  if (meta.tags !== undefined && !isStringArray(meta.tags)) {
    throw new Error(`模板 tags 必须为字符串数组：${formatPath(filePath)}`)
  }
}

/**
 * 构建单个公开模板条目并复制源码文件。
 */
async function buildTemplate(meta: TemplateMeta, metaFilePath: string): Promise<TemplateOutput> {
  const entryPath = resolve(examplesRoot, meta.entryLocal)

  if (!isPathInside(examplesRoot, entryPath)) {
    throw new Error(`模板 entryLocal 不能指向 examples 目录外：${formatPath(metaFilePath)} (${meta.entryLocal})`)
  }

  const source = await readFile(entryPath, "utf-8").catch(error => {
    throw new Error(
      `模板入口文件读取失败：${formatPath(metaFilePath)} -> ${meta.entryLocal}\n${getErrorMessage(error)}`
    )
  })
  const version = createHash("sha256").update(source, "utf-8").digest("hex").slice(0, 12)
  const entryUrl = meta.entryUrl ?? `/templates/${meta.name}.vue`
  const outputPath = resolve(templatesDir, `${meta.name}.vue`)

  await writeFile(outputPath, source.replace(/^\uFEFF/, ""), "utf-8")

  return omitUndefined({
    name: meta.name,
    title: meta.title,
    description: meta.description,
    whenToUse: meta.whenToUse,
    entryUrl,
    designGuideUrl: meta.designGuideUrl,
    route: meta.route,
    tags: meta.tags,
    version
  })
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string")
}

/**
 * 判断解析后的子路径是否仍位于预期父目录内。
 */
function isPathInside(parent: string, child: string): boolean {
  const result = relative(parent, child)
  return result === "" || (!result.startsWith("..") && !result.startsWith("/") && !/^[a-zA-Z]:/.test(result))
}

/**
 * 移除生成 JSON 数据中的 undefined 字段。
 */
function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T
}

/**
 * 将绝对路径格式化为相对 examples 的路径，便于日志阅读。
 */
function formatPath(filePath: string): string {
  return relative(examplesRoot, filePath).replaceAll("\\", "/")
}

/**
 * 将未知异常值统一转换为可记录的错误信息。
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * 构建公开模板元数据清单和源码文件。
 */
async function main(): Promise<void> {
  await mkdir(templatesDir, { recursive: true })

  const metaFiles = await collectMetaFiles(viewsDir)
  const usedNames = new Set<string>()
  const templates: TemplateOutput[] = []

  for (const metaFile of metaFiles) {
    const meta = await readTemplateMeta(metaFile)
    validateTemplateMeta(meta, metaFile)

    if (usedNames.has(meta.name)) {
      throw new Error(`模板 name 重复：${meta.name} (${formatPath(metaFile)})`)
    }

    usedNames.add(meta.name)
    templates.push(await buildTemplate(meta, metaFile))
  }

  const output = {
    generatedAt: new Date().toISOString(),
    templates
  }

  await writeFile(templatesJsonPath, `${JSON.stringify(output, null, 2)}\n`, "utf-8")
  console.log(`已生成 ${templates.length} 个模板：${formatPath(templatesJsonPath)}`)
}

main().catch(error => {
  console.error(getErrorMessage(error))
  process.exitCode = 1
})
