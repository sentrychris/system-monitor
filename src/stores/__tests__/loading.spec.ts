import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from 'pinia'
import { useLoadingStore } from '../loading'

describe('Loading Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggles', () => {
    const loading = useLoadingStore()
    
    expect(loading.status).toBe(true)
    loading.toggle(false)
    expect(loading.status).toBe(false)
  })
})