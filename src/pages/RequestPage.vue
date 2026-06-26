<script setup lang="ts">
import { onMounted, ref } from "vue"
import { NButton, createDiscreteApi } from "naive-ui"
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { createRequest, type BizResult } from "@puture-ui/capabilities"

let message: ReturnType<typeof createDiscreteApi>["message"] | null = null
const lastResult = ref<string>("")

onMounted(() => {
  message = createDiscreteApi(["message"]).message
})

function notify(type: "success" | "info" | "warning" | "error", content: string) {
  message?.[type](content, { closable: true, keepAliveOnHover: true })
}

const http = createRequest({
  baseURL: "/mock",
  getToken: () => "demo-token",
  tokenHeader: "x-access-token",
  onMessage: (type, content) => notify(type, content),
  onUnauthorized: () => notify("warning", "登录已失效,跳转登录页(此处仅演示)"),
  responseAdapter: (r) => r.data
})

http.instance.defaults.adapter = async (config) => {
  const path = config.url ?? ""
  await new Promise((r) => setTimeout(r, 300))

  if (path === "/success") {
    return mockResponse(config, 200, { code: 0, data: { id: 1, name: "Ada" }, message: "ok" })
  }
  if (path === "/biz-error") {
    return mockResponse(config, 200, { code: 5001, data: null, message: "用户名或密码错误" })
  }
  if (path === "/unauthorized") {
    const resp = mockResponse(config, 401, { code: 401, message: "Token 失效，请重新登录" })
    const err = new Error("Request failed with status code 401") as AxiosError
    err.config = config
    err.response = resp
    err.isAxiosError = true
    throw err
  }
  if (path === "/network-error") {
    const err = new Error("Network Error") as AxiosError
    err.config = config
    err.isAxiosError = true
    throw err
  }
  return mockResponse(config, 200, { code: 0, data: null, message: "ok" })
}

function mockResponse<T extends BizResult>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: T
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {},
    config,
    request: {}
  }
}

async function handleSuccess() {
  try {
    const data = await http.get<BizResult>("/success")
    lastResult.value = JSON.stringify(data, null, 2)
    notify("success", "请求成功")
  } catch {
    /* 已由库统一处理 */
  }
}

async function handleBizError() {
  try {
    await http.get("/biz-error")
  } catch (e) {
    lastResult.value = JSON.stringify(e, null, 2)
  }
}

async function handleUnauthorized() {
  try {
    await http.get("/unauthorized")
  } catch {
    lastResult.value = "401 已被库识别并触发 onUnauthorized 钩子"
  }
}

async function handleNetworkError() {
  try {
    await http.get("/network-error")
  } catch {
    lastResult.value = "网络错误已被统一处理"
  }
}

async function handleSilent() {
  try {
    await http.get("/biz-error", { silent: true })
  } catch (e) {
    lastResult.value = "silent 模式：不弹窗,只能在业务侧 catch 拿到 → " + JSON.stringify(e)
  }
}
</script>

<template>
  <article class="page">
    <header class="page__header">
      <h1>Request 请求封装</h1>
      <p>基于 axios 的统一封装：token 注入、401 钩子、业务错误码、消息提示、silent 模式。</p>
    </header>

    <section class="page__section">
      <h2>各类响应演示</h2>
      <p class="page__hint" style="margin-bottom: 12px">所有接口均为前端模拟（不发真实请求）。点击按钮观察弹窗与下方输出。</p>
      <div class="page__row">
        <NButton type="primary" @click="handleSuccess">正常请求</NButton>
        <NButton type="warning" @click="handleBizError">业务错误（code !== 0）</NButton>
        <NButton type="error" @click="handleUnauthorized">401 鉴权失效</NButton>
        <NButton @click="handleNetworkError">网络错误</NButton>
        <NButton @click="handleSilent">silent 模式（不弹窗）</NButton>
      </div>

      <div v-if="lastResult" class="page__result">
        <strong>最近一次结果：</strong>
        <pre>{{ lastResult }}</pre>
      </div>
    </section>
  </article>
</template>

<style scoped>
@import "./shared.css";
.page__row { display: flex; gap: 8px; flex-wrap: wrap; }
.page__result {
  margin-top: 16px;
  background: #f7f7f8;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
}
.page__result pre { margin: 4px 0 0; white-space: pre-wrap; word-break: break-all; }
</style>
