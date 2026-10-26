// Utility untuk sinkronisasi realtime antar tab/role browser
// Menggunakan BroadcastChannel API standar dengan fallback ke localStorage event

const CHANNEL_NAME = "posyandu_realtime_sync_channel";
const STORAGE_KEY = "posyandu_realtime_event_ping";

let broadcastChannel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn("BroadcastChannel tidak didukung di browser ini, fallback ke StorageEvent.", e);
}

/**
 * Kirim sinyal broadcast bahwa ada data baru yang dibuat/diubah
 * @param {string} eventType - e.g. "jadwal", "sasaran", "user", "pemeriksaan"
 * @param {object} payload - data tambahan opsional
 */
export const broadcastRealtimeEvent = (eventType, payload = {}) => {
  const message = {
    type: eventType,
    payload,
    timestamp: Date.now(),
  };

  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(message);
    }
  } catch (err) {
    console.warn("Gagal mengirim via BroadcastChannel:", err);
  }

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
    }
  } catch (err) {
    // ignore storage error
  }
};

/**
 * Berlangganan sinyal perubahan data realtime dari tab / role lain
 * @param {function} callback - callback(event)
 * @returns {function} unsubscribe function
 */
export const subscribeRealtimeEvent = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleBroadcastMessage = (event) => {
    if (event?.data && typeof callback === "function") {
      callback(event.data);
    }
  };

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (typeof callback === "function") {
          callback(parsed);
        }
      } catch (_) {}
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", handleBroadcastMessage);
  }
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", handleBroadcastMessage);
    }
    window.removeEventListener("storage", handleStorageEvent);
  };
};
