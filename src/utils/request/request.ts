import { createRequest, type MessageType } from "@puture-ui/capabilities"
import { createDiscreteApi } from "naive-ui"
import { openLoginDialog } from "./login"
import { getToken } from "./token"

let message: ReturnType<typeof createDiscreteApi>["message"] | null = null

/** 获取 playground 演示用消息实例。 */
function getMessage() {
  if (!message) message = createDiscreteApi(["message"]).message
  return message
}

/** 显示 playground 请求反馈。 */
function notify(type: MessageType, content: string) {
  getMessage()[type](content, { closable: true, keepAliveOnHover: true })
}

export const request = createRequest({
  baseURL: "https://erp-test-01.external.sub.puture-in.com",
  tokenHeader: "x-access-token",
  getToken,
  responseAdapter: (response) => response.data,
  onMessage: (type, content) => notify(type, content),
  onUnauthorized: () => openLoginDialog(notify)
})
