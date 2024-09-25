import { component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";
import { RadixIconsEyeOpen } from "~/icons/radix";
import { Image } from "@unpic/qwik";

interface LazyImageProps {
  index: number;
  onClick$: QRL<(src: string) => void>;
}

export const LazyImage = component$<LazyImageProps>((props) => {
  const imageUrl = useSignal<string | null>(null);
  const height = useSignal(Math.floor(Math.random() * (400 - 200 + 1)) + 200);
  const uuid = useSignal<string>(Math.random().toString(36).substring(7));
  useTask$((p) => {
    p.track(() => props.index)
    if (props.index > 10) return;
    imageUrl.value = `https://picsum.photos/seed/${uuid}/200/${400}`;
  });

  useVisibleTask$((p) => {
    p.track(() => props.index)
    if (props.index <= 10) return;
    imageUrl.value = `https://picsum.photos/seed/${uuid}/200/${400}`;
  }, { strategy: 'intersection-observer' });

  return (
    <div 
      class={`w-full ${height.value > 300 ? 'sm:row-span-3 row-span-2' : 'sm:row-span-2 row-span-1'} flex flex-row items-center justify-center `}
      data-swapy-slot={`slot-${uuid}`}
    >
      {imageUrl.value && (
        <div 
          class="relative w-full h-full overflow-hidden group flex items-center justify-center hover:absolute hover:scale-105 transition-all duration-200 hover:z-20 hover:overflow-visible"
          data-swapy-item={`image-${uuid}`}
        >
          <Image
            src={imageUrl.value}
            layout="constrained"
            width={300}
            aspectRatio={2/3}
            alt={`Random image`}
            class="w-full h-full object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-300 group-hover:scale-105"
            priority={props.index < 20}
          />
          <div class="absolute inset-0 flex items-start justify-end">
            <button
              onClick$={() => props.onClick$(`https://picsum.photos/seed/${uuid}/600`)}
              class="p-2 m-2 bg-white text-black font-bold rounded-md hover:bg-gray-200 transition-colors duration-300"
              aria-label="zoom"
            >
              <RadixIconsEyeOpen />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default LazyImage;
