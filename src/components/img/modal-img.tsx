import { $, component$, useOnDocument, useSignal, useStylesScoped$, type QRL } from '@builder.io/qwik';
import { Image } from '@unpic/qwik';

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
