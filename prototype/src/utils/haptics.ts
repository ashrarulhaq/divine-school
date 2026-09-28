import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Trigger subtle haptic click for button taps or scan start
 */
export async function triggerHapticFeedback(durationMs = 30) {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {
    // Fallback to HTML5 vibration API for web browsers
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(durationMs);
    }
  }
}

/**
 * Trigger success haptic vibration for biometric sign-off
 */
export async function triggerBiometricSuccessHaptic() {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (e) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40]);
    }
  }
}
