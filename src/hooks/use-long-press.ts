import { $, useSignal, useVisibleTask$, QRL } from '@builder.io/qwik';

interface LongPressOptions {
  threshold?: number;
  onStart$?: QRL<(event: Event) => void>;
  onFinish$?: QRL<(event: Event) => void>;
  onCancel$?: QRL<(event: Event) => void>;
}

const isMouseEvent = (event: Event): event is MouseEvent => {
  return event.type.startsWith('mouse');
};

const isTouchEvent = (event: Event): event is TouchEvent => {
  return event.type.startsWith('touch');
};

export const useLongPress = (callback$: QRL<(event: Event) => void>, options: LongPressOptions = {}) => {
  const { threshold = 400, onStart$, onFinish$, onCancel$ } = options;
  
  const isLongPressActive = useSignal(false);
  const isPressed = useSignal(false);
  const timerId = useSignal<number | undefined>(undefined);

  const start = $((event: Event) => {
    if (!isMouseEvent(event) && !isTouchEvent(event)) return;
    if (onStart$) {
      onStart$(event);
    }
    isPressed.value = true;
    timerId.value = window.setTimeout(() => {
      callback$(event);
      isLongPressActive.value = true;
    }, threshold);
  });

  const cancel = $((event: Event) => {
    if (!isMouseEvent(event) && !isTouchEvent(event)) return;
    if (isLongPressActive.value) {
      if (onFinish$) {
        onFinish$(event);
      }
    } else if (isPressed.value) {
      if (onCancel$) {
        onCancel$(event);
      }
    }
    isLongPressActive.value = false;
    isPressed.value = false;
    if (timerId.value !== undefined) {
      window.clearTimeout(timerId.value);
    }
  });

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      if (timerId.value !== undefined) {
        window.clearTimeout(timerId.value);
      }
    });
  });

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
};
