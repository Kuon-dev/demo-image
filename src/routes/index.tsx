import {
  component$,
  useStore,
  useSignal,
  $,
  useStylesScoped$,
  useOnDocument,
  useVisibleTask$,
  useTask$,
} from '@builder.io/qwik';
import type { QRL, QwikIntrinsicElements } from '@builder.io/qwik';
import * as Swapy from 'swapy';
import { Image } from "@unpic/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

interface ModalProps {
  src: string;
  alt: string;
  onClose: QRL<() => void>;
}


export function RadixIconsEyeOpen(props: QwikIntrinsicElements['svg'], key: string) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15" {...props} key={key}><path fill="currentColor" fill-rule="evenodd" d="M7.5 11c-2.697 0-4.97-1.378-6.404-3.5C2.53 5.378 4.803 4 7.5 4s4.97 1.378 6.404 3.5C12.47 9.622 10.197 11 7.5 11m0-8C4.308 3 1.656 4.706.076 7.235a.5.5 0 0 0 0 .53C1.656 10.294 4.308 12 7.5 12s5.844-1.706 7.424-4.235a.5.5 0 0 0 0-.53C13.344 4.706 10.692 3 7.5 3m0 6.5a2 2 0 1 0 0-4a2 2 0 0 0 0 4" clip-rule="evenodd"></path></svg>
  )
}

export const Modal = component$<ModalProps>((props) => {
  const modalRef = useSignal<HTMLDialogElement>();
  const imageLoaded = useSignal(false);

  useStylesScoped$(`
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `);

  useOnDocument('keydown', $((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      props.onClose();
    }
  }));

  const handleClick = $((event: MouseEvent) => {
    if (modalRef.value && !modalRef.value.contains(event.target as Node)) {
      props.onClose();
    }
  });

  return (
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" 
      onClick$={handleClick}
    >
      <dialog 
        ref={modalRef}
        class="bg-white rounded-lg shadow-xl overflow-auto relative"
        open
      >
        <button
          onClick$={props.onClose}
          aria-label="view zoom"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md z-10"
        >
          ×
        </button>
        {!imageLoaded.value && (
          <div class="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div class="spinner"></div>
          </div>
        )}
        <Image
          src={props.src}
          layout="fullWidth"
          width={600}
          height={600}
          alt={props.alt}
          class={`w-full h-auto ${imageLoaded.value ? '' : 'invisible'}`}
          onLoad$={() => { imageLoaded.value = true; }}
        />
      </dialog>
    </div>
  );
});

interface LazyImageProps {
  id: number;
  index: number;
  onClick$: QRL<(src: string) => void>;
}

export const LazyImage = component$<LazyImageProps>((props) => {
  const imageUrl = useSignal<string | null>(null);
  const height = useSignal(Math.floor(Math.random() * (400 - 200 + 1)) + 200);
  useTask$((p) => {
    p.track(() => props.index)
    if (props.index > 10) return;
    imageUrl.value = `https://picsum.photos/seed/${props.id}/200/${400}`;
  });

  useVisibleTask$((p) => {
    p.track(() => props.index)
    if (props.index <= 10) return;
    imageUrl.value = `https://picsum.photos/seed/${props.id}/200/${400}`;
  }, { strategy: 'intersection-observer' });

  return (
    <div 
      class={`w-full ${height.value > 300 ? 'sm:row-span-3 row-span-2' : 'sm:row-span-2 row-span-1'} flex flex-row items-center justify-center`}
      data-swapy-slot={`slot-${props.id}`}
    >
      {imageUrl.value && (
        <div 
          class="relative w-full h-full overflow-hidden group flex items-center justify-center"
          data-swapy-item={`image-${props.id}`}
        >
          <Image
            src={imageUrl.value}
            layout="constrained"
            width={300}
            aspectRatio={2/3}
            alt={`Random image ${props.id}`}
            class="w-full h-full object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-300 group-hover:scale-105"
            priority={props.index < 20}
          />
          <div class="absolute inset-0 flex items-start justify-end">
            <button
              onClick$={() => props.onClick$(`https://picsum.photos/seed/${props.id}/600`)}
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

export const ImageMasonry = component$(() => {
  const state = useStore({
    imageIds: [] as number[],
  });
  const selectedImage = useSignal<string | null>(null);
  const containerRef = useSignal<Element | undefined>();

  useTask$(() => {
    const newImageIds = Array.from({ length: 500}, (_, i) => Date.now() + i);
    state.imageIds = newImageIds;
  });

  const openModal = $((src: string) => {
    selectedImage.value = src;
  });

  const closeModal = $(() => {
    selectedImage.value = null;
  });

  useVisibleTask$(({
    track
  }) => {
    track(() => state.imageIds)
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
        {state.imageIds.map((id, index) => (
          <LazyImage id={id} index={index} onClick$={openModal} key={id}/>
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
