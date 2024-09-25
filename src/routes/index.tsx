import {
  component$,
  useSignal,
  $,
  useVisibleTask$,
} from '@builder.io/qwik';
import * as Swapy from 'swapy';
import type { DocumentHead } from "@builder.io/qwik-city";
import LazyImage from '~/components/img/lazy-img';
import { Modal } from '~/components/img/modal-img';


export const ImageMasonry = component$(() => {
  const IMAGE_COUNT = 500;
  const selectedImage = useSignal<string | null>(null);
  const containerRef = useSignal<Element | undefined>();

  const openModal = $((src: string) => {
    selectedImage.value = src;
  });

  const closeModal = $(() => {
    selectedImage.value = null;
  });

  useVisibleTask$(({
    track
  }) => {
    track(() => containerRef.value);
    if (containerRef.value) {
      Swapy.createSwapy(containerRef.value, {
        animation: 'dynamic'
      });
    }
  }, {strategy: 'document-idle'});

  return (
    <div class="mx-auto max-w-[692px] overflow-x-hidden px-6 pb-12 pt-4 antialiased sm:py-32 md:overflow-x-visible md:pb-12 md:pt-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Random Image Gallery</h1>
      <div 
        ref={containerRef}
        class="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[100px]"
      >
        {Array.from({ length: IMAGE_COUNT }, (_, index) => (
          <LazyImage index={index} onClick$={openModal} key={Date.now() + index}/>
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
