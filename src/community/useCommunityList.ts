import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import request from '@/axios'
import type { ApiResult } from '@/types'
import type { CommunityPage } from './types'

export function messageOf(error: unknown): string {
  const value = error as { response?: { data?: { msg?: string } }; message?: string }
  return value.response?.data?.msg || value.message || '请求失败，请稍后重试'
}
export function useCommunityList<T>(resource: string, filters: () => Record<string, string | number | undefined> = () => ({})) {
  const rows = shallowRef<T[]>([]), total = ref(0), pageNo = ref(1), size = ref(20), query = ref('')
  const loading = ref(false), error = ref('')
  let sequence = 0
  async function load() {
    const currentSequence = ++sequence
    loading.value = true; error.value = ''
    try {
      const result = await request.get<ApiResult<CommunityPage<T>>>(`/community/${resource}`, {
        params: { pageNo: pageNo.value, size: size.value, query: query.value.trim(), ...filters() }
      })
      if (currentSequence !== sequence) return
      rows.value = result.data.data.content; total.value = result.data.data.totalElements
      if (!rows.value.length && total.value > 0 && pageNo.value > 1) {
        pageNo.value = Math.max(1, Math.ceil(total.value / size.value)); await load()
      }
    } catch (failure) { if (currentSequence === sequence) { error.value = messageOf(failure); rows.value = []; total.value = 0 } }
    finally { if (currentSequence === sequence) loading.value = false }
  }
  function search() { pageNo.value = 1; return load() }
  onMounted(load)
  onBeforeUnmount(() => { sequence++ })
  return { rows, total, pageNo, size, query, loading, error, load, search }
}
