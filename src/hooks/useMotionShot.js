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
  const [permissionState, setPermissionState] = useState('unknown'); // 'unknown' | 'prompt' | 'granted' | 'denied' | 'insecure' | 'unsupported'
  const [sensorsSupported, setSensorsSupported] = useState(false);
  const [isSecureContext, setIsSecureContext] = useState(true);
  const [sensorValues, setSensorValues] = useState({
    accel: 0,
    pitch: 0,
    roll: 0,
    peakAccel: 0,
  });

  const [sensitivity, setSensitivity] = useState(12.0); // Slightly more forgiving default
  const [isTapMode, setIsTapMode] = useState(false);

  const lastShotTimestampRef = useRef(0);
  const pitchRef = useRef(90);
  const onShootRef = useRef(onShoot);

  useEffect(() => {
    onShootRef.current = onShoot;
  }, [onShoot]);

  // Check if DeviceMotionEvent exists & context security
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSecure = window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      setIsSecureContext(isSecure);

      const hasMotion = 'DeviceMotionEvent' in window;
      const hasOrientation = 'DeviceOrientationEvent' in window;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      setSensorsSupported(hasMotion && hasOrientation);

      if (!isSecure) {
        // HTTP context: Mobile browsers block sensors by policy
        setPermissionState('insecure');
        setIsTapMode(true);
      } else if (!hasMotion || !isMobile) {
        // Desktop or unsupported browser defaults to tap mode
        setPermissionState('unsupported');
        setIsTapMode(true);
      } else if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+ requires user gesture requestPermission()
        setPermissionState('prompt');
      } else {
        // Android / modern mobile over HTTPS
        setPermissionState('granted');
      }
    }
  }, []);

  // Request iOS motion permission directly on user tap
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
        console.warn('Motion permission request error:', err);
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
    // 500ms debounce
    if (now - lastShotTimestampRef.current < 500) return;
    lastShotTimestampRef.current = now;

    if (onShootRef.current) {
      onShootRef.current({ source, timestamp: now });
    }
  }, []);

  // Motion and Orientation event listeners
  useEffect(() => {
    if (!enabled || isTapMode) return;

    const handleOrientation = (e) => {
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

      const magnitude = Math.sqrt(x * x + y * y + z * z);

      setSensorValues((prev) => ({
        ...prev,
        accel: Math.round(magnitude * 10) / 10,
        peakAccel: Math.max(prev.peakAccel, Math.round(magnitude * 10) / 10),
      }));

      // Condition: Fast draw acceleration + phone aiming forward (pitch 35-145 deg)
      const currentPitch = Math.abs(pitchRef.current);
      if (
        magnitude >= sensitivity &&
        currentPitch >= 35 &&
        currentPitch <= 145
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
    isSecureContext,
    sensorValues,
    sensitivity,
    setSensitivity,
    isTapMode,
    setIsTapMode,
    requestPermission,
    triggerShoot,
  };
}
