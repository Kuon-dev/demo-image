import { component$, useSignal, $, useVisibleTask$, useOnDocument } from '@builder.io/qwik';

export default component$(() => {
  const mouseDownAt = useSignal("0");
  const prevPercentage = useSignal(0);
  const percentage = useSignal(0);
  const images = useSignal<string[]>([]);

  const handleOnDown = $((e: MouseEvent | TouchEvent) => {
    mouseDownAt.value = (e instanceof MouseEvent ? e.clientX : e.touches[0].clientX).toString();
  });

  const handleOnUp = $(() => {
    mouseDownAt.value = "0";
    prevPercentage.value = percentage.value;
  });

  const handleOnMove = $((e: MouseEvent | TouchEvent) => {
    if (mouseDownAt.value === "0") return;

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const mouseDelta = parseFloat(mouseDownAt.value) - clientX;
    const maxDelta = window.innerWidth / 2;

    const percentageDelta = (mouseDelta / maxDelta) * -100;
    const nextPercentageUnconstrained = prevPercentage.value + percentageDelta;
    const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

    percentage.value = nextPercentage;

    const track = document.getElementById("image-track");
    if (track) {
      track.animate({
        transform: `translate(${nextPercentage}%, -50%)`
      }, { duration: 1200, fill: "forwards" });

      for (const image of track.getElementsByClassName("image") as HTMLCollectionOf<HTMLImageElement>) {
        image.animate({
          objectPosition: `${100 + nextPercentage}% center`
        }, { duration: 1200, fill: "forwards" });
      }
    }
  });

  useOnDocument('mousedown', handleOnDown);
  useOnDocument('touchstart', $((e: TouchEvent) => handleOnDown(e)));
  useOnDocument('mouseup', handleOnUp);
  useOnDocument('touchend', handleOnUp);
  useOnDocument('mousemove', handleOnMove);
  useOnDocument('touchmove', $((e: TouchEvent) => handleOnMove(e)));

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try {
      const response = await fetch('https://picsum.photos/v2/list?limit=8');
      const data = await response.json();
      images.value = data.map((item: { id: string }) => `https://picsum.photos/seed/${item.id}/800/600`);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  });

  return (
    <div class="h-screen w-screen bg-black m-0 overflow-hidden">
      <div id="image-track" class="flex flex-row gap-[4vmin] absolute left-1/2 top-1/2 -translate-y-1/2 select-none">
        {images.value.map((src, index) => (
          <img 
            key={index} 
            class="image w-[40vmin] h-[56vmin] object-cover object-[100%_center]" 
            src={src} 
            draggable={false} 
            alt={`Random image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
});
