import { component$, useSignal, $ } from '@builder.io/qwik';
import { useLongPress } from '~/hooks/use-long-press';

export const LongPressDemo = component$(() => {
  const pressCount = useSignal(0);
  const longPressCount = useSignal(0);

  const longPressHandler = useLongPress(
    $((event: Event) => {
      longPressCount.value++;
      console.log('Long press detected', event);
    }),
    {
      threshold: 500,
      onCancel$: $((event: Event) => {
        console.log('Long press cancelled', event);
        pressCount.value++;
      }),
    }
  );

  return (
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Long Press Demo</h1>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onMouseUp$={longPressHandler.onMouseUp}
        onMouseDown$={longPressHandler.onMouseDown}
        onTouchStart$={longPressHandler.onTouchStart}
        onTouchEnd$={longPressHandler.onTouchEnd}

      >
        Press and hold me
      </button>
      <div class="mt-4">
        <p>Normal presses: {pressCount.value}</p>
        <p>Long presses: {longPressCount.value}</p>
      </div>
    </div>
  );
});

export default component$(() => {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <LongPressDemo />
    </div>
  );
});
