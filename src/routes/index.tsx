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
import type { QRL } from '@builder.io/qwik';
import { Image } from "@unpic/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

interface ModalProps {
  src: string;
  alt: string;
  onClose: QRL<() => void>;
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

  useTask$(() => {
    if (props.index > 10) return
    imageUrl.value = `https://picsum.photos/seed/${props.id}/200/${height.value}`;
  })

  useVisibleTask$(() => {
    if (props.index <= 20) return
    imageUrl.value = `https://picsum.photos/seed/${props.id}/200/${height.value}`;
  }, {strategy: 'intersection-observer' });

  return (
    <div class={`w-full ${height.value > 300 ? 'row-span-2' : 'row-span-1'}`}>
      {imageUrl.value && (
        <Image
          src={imageUrl.value}
          layout="constrained"
          width={300}
          height={height.value}
          alt={`Random image ${props.id}`}
          class="w-full h-full object-cover rounded-lg shadow-md cursor-pointer"
          priority={props.index < 20}
          onClick$={() => props.onClick$(`https://picsum.photos/seed/${props.id}/600`!)}
        />
      )}
    </div>
  );
});

export const ImageMasonry = component$(() => {
  const state = useStore({
    imageIds: [] as number[],
  });
  const selectedImage = useSignal<string | null>(null);

  useStylesScoped$(`
    .masonry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      grid-auto-rows: 100px;
      grid-gap: 1rem;
    }
    .masonry-grid > div {
      grid-row-end: span calc(var(--height) / 50);
    }
  `);

  useTask$(() => {
    const newImageIds = Array.from({ length: 1000 }, (_, i) => Date.now() + i);
    state.imageIds = newImageIds;
  })

  const openModal = $((src: string) => {
    selectedImage.value = src;
  });

  const closeModal = $(() => {
    selectedImage.value = null;
  });

  return (
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold mb-8 text-center">Random Image Gallery</h1>
      <div class="masonry-grid">
        {state.imageIds.map((id, index) => (
          <LazyImage key={id} id={id} index={index} onClick$={openModal} />
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
      content: "A gallery of unique random images using Qwik and Unpic with masonry layout, mixed loading strategies, and modal view",
    },
  ],
};
