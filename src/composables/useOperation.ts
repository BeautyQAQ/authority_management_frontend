import { ref } from 'vue'

/** Keep dialogs open on failure; the HTTP layer displays the server message. */
export function useOperation() {
  const busy = ref(false)
  async function run(action: () => Promise<void>) {
    if (busy.value) return
    busy.value = true
    try { await action() } catch { /* Already displayed by the HTTP layer. */ }
    finally { busy.value = false }
  }
  return { busy, run }
}
