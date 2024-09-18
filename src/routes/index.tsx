import { component$, useVisibleTask$, useStore, $ } from '@builder.io/qwik';
import { isBrowser } from '@builder.io/qwik/build';
import { Image } from "@unpic/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

interface ImageData {
  url: string;
  id: number;
}

export const ImageMasonry = component$(() => {
  const state = useStore({
    images: [] as ImageData[],
    loading: true,
  });

  const generateImageUrl = $((id: number) => {
    const width = 300;
    const height = 200;
    return `https://picsum.photos/seed/${id}/${width}/${height}`;
  });

  const loadImages = $(async () => {
    state.loading = true;
    const newImages: ImageData[] = [];
    for (let i = 0; i < 500; i++) {
      const id = Date.now() + i; // Ensures unique ID for each image
      const url = await generateImageUrl(id);
      newImages.push({ url, id });
    }
    state.images = newImages;
    state.loading = false;
  });

  useVisibleTask$(() => {
    if (isBrowser) {
      loadImages();
    }
  });

  return (
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8 text-center">Random Image Gallery</h1>
      {state.loading ? (
        <div class="text-center">Loading images...</div>
      ) : (
        <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {state.images.map((image) => (
            <div key={image.id} class="break-inside-avoid mb-4">
              <Image
                src={image.url}
                layout="constrained"
                width={300}
                height={200}
                alt={`Random image ${image.id}`}
                class="w-full rounded-lg shadow-md"
              />
              <p class="mt-2 text-sm text-gray-600">Image ID: {image.id}</p>
            </div>
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
      content: "A gallery of unique random images using Qwik and Unpic",
    },
  ],
};
