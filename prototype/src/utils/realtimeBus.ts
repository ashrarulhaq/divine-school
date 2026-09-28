import { RealtimeEvent } from '../types';

const CHANNEL_NAME = 'divine_school_realtime_channel_v1';
const STORAGE_EVENT_KEY = 'divine_school_bus_event_v1';

type EventListener = (event: RealtimeEvent) => void;

class RealtimeBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<EventListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. BroadcastChannel API (Modern browsers)
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (msgEvent) => {
            if (msgEvent.data) {
              this.notifyListeners(msgEvent.data as RealtimeEvent);
            }
          };
        } catch (e) {
          console.warn('BroadcastChannel not supported or blocked:', e);
        }
      }

      // 2. LocalStorage storage event fallback (for older browsers or cross-origin tabs)
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_EVENT_KEY && e.newValue) {
          try {
            const event = JSON.parse(e.newValue) as RealtimeEvent;
            this.notifyListeners(event);
          } catch (err) {
            console.error('Failed to parse storage event:', err);
          }
        }
      });
    }
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  /**
   * Broadcast an event to all open tabs and windows
   */
  public broadcast(event: RealtimeEvent) {
    // Notify in other tabs via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (e) {
        console.warn('Failed to broadcast via channel:', e);
      }
    }

    // Storage event for fallback
    try {
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(event));
    } catch (e) {
      // Storage might be full or private mode
    }

    // Also notify local listeners in current window
    this.notifyListeners(event);
  }

  /**
   * Subscribe to real-time events across any tab
   */
  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const realtimeBus = new RealtimeBus();
