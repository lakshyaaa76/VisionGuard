import { useEffect, useRef } from 'react';
import integrityService from '../services/integrityService';

const SAMPLE_INTERVAL_MS = 1500;
const MAX_WIDTH = 640;

const useMlFrameSampling = (sessionId) => {
  const runningRef = useRef(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    if (runningRef.current) return;

    let stream;
    let video;
    let canvas;
    let ctx;
    let timer;
    let cancelled = false;

    const start = async () => {
      runningRef.current = true;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (err) {
        runningRef.current = false;
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        runningRef.current = false;
        return;
      }

      video = document.createElement('video');
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;

      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d', { willReadFrequently: true });

      try {
        await video.play();
      } catch (err) {
        stream.getTracks().forEach((t) => t.stop());
        runningRef.current = false;
        return;
      }

      const tick = async () => {
        if (cancelled) return;
        if (inFlightRef.current) return;

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) return;

        const scale = vw > MAX_WIDTH ? MAX_WIDTH / vw : 1;
        const tw = Math.max(1, Math.round(vw * scale));
        const th = Math.max(1, Math.round(vh * scale));

        canvas.width = tw;
        canvas.height = th;
        ctx.drawImage(video, 0, 0, tw, th);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const image_base64 = dataUrl.split(',')[1];

        const token = localStorage.getItem('token');
        inFlightRef.current = true;
        try {
          await integrityService.logMlFrame(sessionId, image_base64, token);
        } finally {
          inFlightRef.current = false;
        }
      };

      timer = setInterval(() => {
        tick();
      }, SAMPLE_INTERVAL_MS);
    };

    start();

    return () => {
      cancelled = true;
      runningRef.current = false;
      if (timer) clearInterval(timer);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [sessionId]);
};

export default useMlFrameSampling;

