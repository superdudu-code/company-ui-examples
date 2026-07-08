import type { MessageType } from "@puture-ui/capabilities"
import axios from "axios"
import { NInput, createDiscreteApi } from "naive-ui"
import { h, reactive } from "vue"
import { setToken } from "./token"

const LOGIN_BASE_URL = "https://erp-test-01.puture-in.com"

type LoginResponse = {
  result?: {
    token?: string
  }
  message?: string
  msg?: string
}

type Notify = (type: MessageType, content: string) => void

let dialog: ReturnType<typeof createDiscreteApi>["dialog"] | null = null
let loginDialogVisible = false

/** 获取 playground 演示用弹窗实例。 */
function getDialog() {
  if (!dialog) dialog = createDiscreteApi(["dialog"]).dialog
  return dialog
}

/** 提取登录失败提示。 */
function getLoginErrorMessage(error: unknown) {
  if (!axios.isAxiosError<LoginResponse>(error)) return "登录失败"
  const data = error.response?.data
  return data?.message || data?.msg || "登录失败"
}

/** 调用登录接口并返回 token。 */
async function requestLoginToken(username: string, password: string) {
  const res = await axios.post<LoginResponse>(
    "/erpApi/sys/login",
    {
      captcha: "8888",
      password,
      username
    },
    {
      baseURL: LOGIN_BASE_URL
    }
  )
  return res.data.result?.token ?? ""
}

/** 打开登录弹窗，登录成功后写入 token。 */
export function openLoginDialog(notify: Notify) {
  if (loginDialogVisible) return

  loginDialogVisible = true
  const loginForm = reactive({
    password: "",
    username: ""
  })
  let loginPending = false

  getDialog().create({
    title: "登录",
    content: () =>
      h(
        "div",
        {
          style: {
            display: "grid",
            gap: "12px",
            paddingTop: "4px"
          }
        },
        [
          h(NInput, {
            value: loginForm.username,
            placeholder: "请输入账户",
            clearable: true,
            "onUpdate:value": (value: string) => {
              loginForm.username = value
            }
          }),
          h(NInput, {
            value: loginForm.password,
            placeholder: "请输入密码",
            type: "password",
            showPasswordOn: "click",
            "onUpdate:value": (value: string) => {
              loginForm.password = value
            }
          })
        ]
      ),
    positiveText: "登录",
    negativeText: "取消",
    closable: false,
    maskClosable: false,
    closeOnEsc: false,
    onPositiveClick: async () => {
      if (loginPending) return false
      const username = loginForm.username.trim()
      if (!username || !loginForm.password) {
        notify("warning", "请输入账户和密码")
        return false
      }

      loginPending = true
      try {
        const token = await requestLoginToken(username, loginForm.password)
        if (!token) {
          notify("error", "登录成功但未返回 token")
          return false
        }
        setToken(token)
        notify("success", "登录成功")
        loginDialogVisible = false
        return true
      } catch (error) {
        notify("error", getLoginErrorMessage(error))
        return false
      } finally {
        loginPending = false
      }
    },
    onNegativeClick: () => {
      if (loginPending) return false
      loginDialogVisible = false
      return true
    }
  })
}
