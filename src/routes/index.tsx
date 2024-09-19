import { component$, useVisibleTask$, useStore, useSignal } from '@builder.io/qwik';
import { isBrowser } from '@builder.io/qwik/build';
import { Image } from "@unpic/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

const LazyImage = component$((props: { id: number }) => {
  const imageUrl = useSignal<string | null>(null);

  useVisibleTask$(({ track }) => {
    track(() => props.id);
    const width = 300;
    const height = 200;
    imageUrl.value = `https://picsum.photos/seed/${props.id}/${width}/${height}`;
  }, {strategy: 'intersection-observer'});

  return (
    <div class="break-inside-avoid mb-4">
      {imageUrl.value && (
        <Image
          src={imageUrl.value}
          layout="constrained"
          width={300}
          height={200}
          alt={`Random image ${props.id}`}
          class="w-full rounded-lg shadow-md"
          loading="lazy"
        />
      )}
      <p class="mt-2 text-sm text-gray-600">Image ID: {props.id}</p>
    </div>
  );
});

export const ImageMasonry = component$(() => {
  const state = useStore({
    imageIds: [] as number[],
    loading: true,
  });

  useVisibleTask$(() => {
    if (isBrowser) {
      const newImageIds = Array.from({ length: 500 }, (_, i) => Date.now() + i);
      state.imageIds = newImageIds;
      state.loading = false;
    }
  });

  return (
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Random Image Gallery</h1>
      {state.loading ? (
        <div class="text-center">Loading images...</div>
      ) : (
        <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {state.imageIds.map((id) => (
            <LazyImage key={id} id={id} />
          ))}
        </div>
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
      content: "A gallery of unique random images using Qwik and Unpic with lazy loading",
    },
  ],
};
