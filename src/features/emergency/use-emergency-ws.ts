import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getCookie } from '@/lib/cookies'

type WsStatus = 'connecting' | 'connected' | 'disconnected'

const MAX_BACKOFF = 30_000
const BASE_BACKOFF = 1_000

export function useEmergencyWs() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const [status, setStatus] = useState<WsStatus>('disconnected')

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['emergency-alerts'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] })
  }, [queryClient])

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const wsBase = baseUrl.replace(/^http/, 'ws')

    function connect() {
      const token = getCookie('access_token')
      const wsUrl = token
        ? `${wsBase}/ws/emergency/alerts/?token=${encodeURIComponent(token)}`
        : `${wsBase}/ws/emergency/alerts/`

      setStatus('connecting')
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('connected')
        retryRef.current = 0
      }

      ws.onmessage = () => {
        invalidate()
      }

      ws.onerror = () => {
        ws.close()
      }

      ws.onclose = (e) => {
        setStatus('disconnected')
        wsRef.current = null
        if (e.code !== 1000) {
          const delay = Math.min(BASE_BACKOFF * 2 ** retryRef.current, MAX_BACKOFF)
          retryRef.current++
          timerRef.current = setTimeout(connect, delay)
        }
      }
    }

    connect()
    return () => {
      clearTimeout(timerRef.current)
      wsRef.current?.close(1000)
    }
  }, [invalidate])

  return { status }
}
