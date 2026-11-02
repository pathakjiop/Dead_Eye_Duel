import { useState, useEffect, useRef, useCallback } from 'react';
import { SENSOR_DEFAULTS } from '../game/constants';

/**
 * Hook to detect "pull from pocket" quick-draw motion using DeviceMotion & DeviceOrientation
 * Falls back seamlessly to tap/spacebar shooting.
 */
export function useMotionShot({
  enabled = true,
  onShoot,
  tapToShootFallback = true,
}) {
  const [permissionState, setPermissionState] = useState('unknown'); // 'unknown' | 'granted' | 'denied' | 'not-needed'
  const [sensorsSupported, setSensorsSupported] = useState(false);
  const [sensorValues, setSensorValues] = useState({
    accel: 0,
    pitch: 0,
    roll: 0,
    peakAccel: 0,
  });

  const [sensitivity, setSensitivity] = useState(SENSOR_DEFAULTS.ACCEL_THRESHOLD);
  const [isTapMode, setIsTapMode] = useState(false);

  const lastShotTimestampRef = useRef(0);
  const pitchRef = useRef(90);
  const recentAccelsRef = useRef([]);

  // Check if DeviceMotionEvent exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasMotion = 'DeviceMotionEvent' in window;
      const hasOrientation = 'DeviceOrientationEvent' in window;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      setSensorsSupported(hasMotion && hasOrientation);

      if (!hasMotion || !isMobile) {
        // Desktop or unsupported browser defaults to tap mode
        setIsTapMode(true);
      }

      // iOS 13+ requires explicit permission request via user action
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        setPermissionState('prompt');
      } else if (hasMotion) {
        setPermissionState('not-needed');
      } else {
        setPermissionState('unsupported');
      }
    }
  }, []);

  // Request iOS motion permission
  const requestPermission = useCallback(async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          if (
            typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
          ) {
            await DeviceOrientationEvent.requestPermission().catch(() => {});
          }
          setPermissionState('granted');
          setIsTapMode(false);
          return true;
        } else {
          setPermissionState('denied');
          setIsTapMode(true);
          return false;
        }
      } catch (err) {
        console.warn('Error requesting device motion permission:', err);
        setPermissionState('denied');
        setIsTapMode(true);
        return false;
      }
    } else {
      setPermissionState('granted');
      return true;
    }
  }, []);

  // Handle trigger firing with debounce
  const triggerShoot = useCallback((source = 'motion') => {
    const now = performance.now();
    // 600ms debounce to prevent multi-fire
    if (now - lastShotTimestampRef.current < 600) return;
    lastShotTimestampRef.current = now;

    if (onShoot) {
      onShoot({ source, timestamp: now });
    }
  }, [onShoot]);

  // Motion listener
  useEffect(() => {
    if (!enabled || isTapMode) return;

    const handleOrientation = (e) => {
      // beta is pitch (-180 to 180 degrees)
      // Phone standing up pointing forward is roughly 60 to 120 degrees
      if (e.beta !== null && e.beta !== undefined) {
        pitchRef.current = e.beta;
        setSensorValues((prev) => ({
          ...prev,
          pitch: Math.round(e.beta),
          roll: Math.round(e.gamma || 0),
        }));
      }
    };

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      // Net magnitude
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      recentAccelsRef.current.push({ val: magnitude, time: performance.now() });
      if (recentAccelsRef.current.length > 10) {
        recentAccelsRef.current.shift();
      }

      setSensorValues((prev) => ({
        ...prev,
        accel: Math.round(magnitude * 10) / 10,
        peakAccel: Math.max(prev.peakAccel, Math.round(magnitude * 10) / 10),
      }));

      // Check condition:
      // 1. Acceleration exceeds threshold (fast draw upward)
      // 2. Pitch is within aiming forward range (between PITCH_MIN and PITCH_MAX)
      const currentPitch = Math.abs(pitchRef.current);
      if (
        magnitude >= sensitivity &&
        currentPitch >= SENSOR_DEFAULTS.PITCH_MIN &&
        currentPitch <= SENSOR_DEFAULTS.PITCH_MAX
      ) {
        triggerShoot('motion');
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('devicemotion', handleMotion, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('devicemotion', handleMotion, true);
    };
  }, [enabled, isTapMode, sensitivity, triggerShoot]);

  // Keyboard spacebar fallback
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        triggerShoot('keyboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, triggerShoot]);

  return {
    permissionState,
    sensorsSupported,
    sensorValues,
    sensitivity,
    setSensitivity,
    isTapMode,
    setIsTapMode,
    requestPermission,
    triggerShoot, // can be called by tap/click
  };
}

