import {
  component$,
  useSignal,
  $,
  useVisibleTask$,
  useStore,
  useComputed$,
} from '@builder.io/qwik';
import { Image } from '@unpic/qwik';
import * as Swapy from 'swapy';
import type { DocumentHead } from "@builder.io/qwik-city";
import { Modal } from '~/components/img/modal-img';

const TOTAL_ITEMS = 500;
const ITEM_HEIGHT = 100; // Based on auto-rows-[100px]
const BUFFER = 10; // Increased buffer for smoother scrolling

// Function to generate a random string
const generateRandomSeed = () => Math.random().toString(36).substring(2, 15);

export const ImageMasonry = component$(() => {
  const selectedImage = useSignal<string | null>(null);
  const containerRef = useSignal<Element>();
  const scrollTop = useSignal(0);
  const viewportHeight = useSignal(0);
  const items = useStore<{ id: number; seed: string }[]>([]);

  const openModal = $((src: string) => {
    selectedImage.value = src;
  });

  const closeModal = $(() => {
    selectedImage.value = null;
  });

  const visibleItems = useComputed$(() => {
    const rowHeight = ITEM_HEIGHT + 16; // Adding gap of 4 (16px) to item height
    const start = Math.floor(scrollTop.value / rowHeight) - BUFFER;
    const end = Math.ceil((scrollTop.value + viewportHeight.value) / rowHeight) + BUFFER;
    return items.slice(Math.max(0, start * 3), Math.min(TOTAL_ITEMS, end * 3));
  });

  useVisibleTask$(({ cleanup }) => {
    items.push(...Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
      id: i,
      seed: generateRandomSeed()
    })));
    viewportHeight.value = window.innerHeight;

    const container = containerRef.value;
    if (container) {
      // Swapy.createSwapy(container, {
      //   animation: 'dynamic'
      // });

      const handleScroll = () => {
        scrollTop.value = window.scrollY;
      };

      const handleResize = () => {
        viewportHeight.value = window.innerHeight;
      };

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      cleanup(() => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      });
    }
  });

  return (
    <div class="mx-auto max-w-[692px] overflow-x-hidden px-6 pb-12 pt-4 antialiased sm:py-32 md:overflow-x-visible md:pb-12 md:pt-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Random Image Gallery</h1>
      <div 
        ref={containerRef}
        class="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[100px] relative"
        style={{ height: `${Math.ceil(TOTAL_ITEMS / 3) * (ITEM_HEIGHT + 16)}px` }}
      >
        {visibleItems.value.map((item) => (
          <div
            key={item.id}
            class="relative w-full h-full"
            style={{
              position: 'absolute',
              top: `${Math.floor(item.id / 3) * (ITEM_HEIGHT + 16)}px`,
              left: `${(item.id % 3) * 33.33}%`,
              width: '33.33%',
              height: `${ITEM_HEIGHT}px`,
            }}
          >
            <Image
              src={`https://picsum.photos/seed/${item.seed}/300/300`}
              layout="fullWidth"
              alt={`Random image ${item.id + 1}`}
              class="object-cover w-full h-full cursor-pointer"
              onClick$={() => openModal(`https://picsum.photos/seed/${item.seed}/1200/1200`)}
            />
          </div>
        ))}
      </div>
      {selectedImage.value && (
        <Modal src={selectedImage.value} alt="Selected image" onClose={closeModal} />
      )}
    </div>
  );
});

export default component$(() => {
  return (
    <>
      <ImageMasonry />
    </>
  );
});

export const head: DocumentHead = {
  title: "Random Image Gallery",
  meta: [
    {
      name: "description",
      content: "A gallery of unique random images using Qwik and Unpic with masonry layout, mixed loading strategies, modal view, and Swapy for drag-and-drop functionality",
    },
  ],
};
