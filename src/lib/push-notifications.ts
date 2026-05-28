import { apiClient } from '@/lib/api-client'

export type PushError = 'unsupported' | 'permission_denied' | 'sw_failed' | 'network' | 'unknown'

export type PushResult =
  | { ok: true }
  | { ok: false; error: PushError; message: string }

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export async function getVapidPublicKey(): Promise<string> {
  const { data } = await apiClient.get('/notifications/push/subscribe/')
  return data.public_key
}

export async function subscribeToPush(): Promise<PushResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, error: 'unsupported', message: 'Push notifications are not supported in this browser.' }
  }

  let registration: ServiceWorkerRegistration
  try {
    registration = await navigator.serviceWorker.ready
  } catch {
    return { ok: false, error: 'sw_failed', message: 'Service worker registration failed. Try disabling private browsing mode.' }
  }

  if (Notification.permission === 'denied') {
    return { ok: false, error: 'permission_denied', message: 'Notification permission was denied. Please enable it in browser settings.' }
  }

  let publicKey: string
  try {
    publicKey = await getVapidPublicKey()
    if (!publicKey) {
      return { ok: false, error: 'network', message: 'Failed to get push configuration from server.' }
    }
  } catch {
    return { ok: false, error: 'network', message: 'Network error while fetching push configuration.' }
  }

  let subscription: PushSubscription
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    })
  } catch (e) {
    if (Notification.permission as string === 'denied') {
      return { ok: false, error: 'permission_denied', message: 'Notification permission was denied. Please enable it in browser settings.' }
    }
    return { ok: false, error: 'unknown', message: `Subscription failed: ${e instanceof Error ? e.message : 'unknown error'}` }
  }

  try {
    const json = subscription.toJSON()
    await apiClient.post('/notifications/push/subscribe/', {
      endpoint: json.endpoint,
      keys: json.keys,
    })
  } catch {
    return { ok: false, error: 'network', message: 'Failed to save subscription on server.' }
  }

  return { ok: true }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (subscription) {
    await apiClient.post('/notifications/push/unsubscribe/', {
      endpoint: subscription.endpoint,
    })
    await subscription.unsubscribe()
  }
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return !!subscription
}
