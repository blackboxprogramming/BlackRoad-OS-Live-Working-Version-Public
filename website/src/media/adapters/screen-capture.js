export const screenCaptureAdapter = {
  id: 'screen-capture',
  canHandle(surface) {
    return surface.kind === 'screen' || surface.provider === 'screen';
  },
  render(surface, mountNode, context) {
    let stream = null;
    const wrap = document.createElement('div');
    wrap.className = 'surface-screen';

    const video = document.createElement('video');
    video.className = 'surface-video';
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    const controls = document.createElement('div');
    controls.className = 'surface-actions';

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.className = 'surface-action';
    startButton.textContent = 'Start Screen Capture';

    const stopButton = document.createElement('button');
    stopButton.type = 'button';
    stopButton.className = 'surface-action';
    stopButton.textContent = 'Stop Capture';
    stopButton.hidden = true;

    const message = document.createElement('div');
    message.className = 'surface-inline-note';
    message.textContent = 'Choose a tab, window, or display to route into the center panel.';

    const clearStream = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      video.srcObject = null;
      stopButton.hidden = true;
      startButton.hidden = false;
      context.setStatus('permission-required');
    };

    startButton.addEventListener('click', async () => {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        context.showFallback(surface, 'Screen capture is not supported in this browser.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        video.srcObject = stream;
        startButton.hidden = true;
        stopButton.hidden = false;
        context.setStatus('ready');
        message.textContent = 'Screen capture live. Stop when you are done.';

        const [track] = stream.getVideoTracks();
        track?.addEventListener('ended', () => {
          message.textContent = 'Capture ended. Start again to choose a new surface.';
          clearStream();
        });
      } catch (error) {
        message.textContent = 'Capture permission was denied or cancelled.';
        context.setStatus('error');
      }
    });

    stopButton.addEventListener('click', () => {
      message.textContent = 'Capture stopped.';
      clearStream();
    });

    controls.append(startButton, stopButton);
    wrap.append(video, controls, message);
    mountNode.appendChild(wrap);
    context.setStatus(surface.status || 'permission-required');
    return () => {
      clearStream();
      wrap.remove();
    };
  },
};

