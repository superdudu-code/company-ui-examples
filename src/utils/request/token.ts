const TOKEN_KEY = "token"

/** 获取浏览器本地存储实例，SSR 环境下返回 null。 */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null
  return window.localStorage
}

/** 读取 playground 演示用 token。 */
export function getToken(): string {
  return getStorage()?.getItem(TOKEN_KEY) ?? ""
}

/** 写入 playground 演示用 token。 */
export function setToken(token: string): void {
  const storage = getStorage()
  if (!storage) return
  if (token) {
    storage.setItem(TOKEN_KEY, token)
  } else {
    storage.removeItem(TOKEN_KEY)
  }
}
