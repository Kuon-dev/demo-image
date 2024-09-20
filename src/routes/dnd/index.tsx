import { 
  component$, 
  useSignal,
  useVisibleTask$, 
  $,
} from '@builder.io/qwik';
import Sortable from 'sortablejs';

interface Element {
  id: string;
  type: 'paragraph' | 'button' | 'input';
  content: string;
}

interface Column {
  id: string;
  elements: Element[];
}

interface Section {
  id: string;
  columns: Column[];
}

interface PageProps {
  initialSections: Section[];
}

export const IntegratedLayoutManager = component$<PageProps>(({ initialSections }) => {
  const data = useSignal(initialSections);
  const isEditMode = useSignal(true);
  const containerRef = useSignal<HTMLElement>();
  const sidebarRef = useSignal<HTMLElement>();

  useVisibleTask$(({track}) => {
    track(() => data.value);
    track(() => isEditMode.value);
    console.log(data.value);

    const onDragEnd = $((event: Sortable.SortableEvent, itemType: 'section' | 'column' | 'element') => {
      const { from, to, oldIndex, newIndex, item } = event;
      if (oldIndex === newIndex && from === to) return; // No change

      const newState = JSON.parse(JSON.stringify(data.value)); // Deep clone the state

      const toSectionIndex = parseInt(to.closest('.section')?.getAttribute('data-section-index') || '0');
      const toColumnIndex = parseInt(to.closest('.column')?.getAttribute('data-column-index') || '0');

      if (from.classList.contains('sidebar-elements')) {
        // Handling drag from sidebar
        const elementType = item.getAttribute('data-element-type') as 'paragraph' | 'button' | 'input';
        const newElement: Element = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: elementType,
          content: elementType === 'paragraph' ? 'New paragraph text' : 
                   elementType === 'button' ? 'Button' : 
                   'Input placeholder'
        };

        // Insert the new element at the correct position
        newState[toSectionIndex].columns[toColumnIndex].elements.splice(newIndex!, 0, newElement);

        // Remove the cloned element created by Sortable.js
        item.remove();
      } else {
        // Handling drag within main content
        const fromSectionIndex = parseInt(from.closest('.section')?.getAttribute('data-section-index') || '0');
        const fromColumnIndex = parseInt(from.closest('.column')?.getAttribute('data-column-index') || '0');

        if (itemType === 'section') {
          const [movedSection] = newState.splice(oldIndex!, 1);
          newState.splice(newIndex!, 0, movedSection);
        } else if (itemType === 'column') {
          const [movedColumn] = newState[fromSectionIndex].columns.splice(oldIndex!, 1);
          newState[toSectionIndex].columns.splice(newIndex!, 0, movedColumn);
        } else if (itemType === 'element') {
          const [movedElement] = newState[fromSectionIndex].columns[fromColumnIndex].elements.splice(oldIndex!, 1);
          newState[toSectionIndex].columns[toColumnIndex].elements.splice(newIndex!, 0, movedElement);
        }
      }

      // Update the signal value
      data.value = newState;
    });

    if (isEditMode.value && containerRef.value) {
      // Initialize Sortable for sections
      new Sortable(containerRef.value, {
        animation: 150,
        ghostClass: 'blue-background-class',
        handle: '.section-handle',
        group: 'sections',
        emptyInsertThreshold: 20,
        onEnd: (evt) => onDragEnd(evt, 'section'),
      });

      // Initialize Sortable for columns
      const columnContainers = containerRef.value.querySelectorAll('.column-container');
      columnContainers.forEach((container) => {
        new Sortable(container as HTMLElement, {
          animation: 150,
          ghostClass: 'green-background-class',
          handle: '.column-handle',
          group: 'columns',
          emptyInsertThreshold: 20,
          onEnd: (evt) => onDragEnd(evt, 'column'),
        });
      });

      // Initialize Sortable for elements
      const elementContainers = containerRef.value.querySelectorAll('.element-container');
      elementContainers.forEach((container) => {
        new Sortable(container as HTMLElement, {
          animation: 150,
          ghostClass: 'yellow-background-class',
          handle: '.element-handle',
          group: 'elements',
          emptyInsertThreshold: 20,
          onEnd: (evt) => onDragEnd(evt, 'element'),
        });
      });
    }

    if (isEditMode.value && sidebarRef.value) {
      // Initialize Sortable for sidebar elements
      new Sortable(sidebarRef.value, {
        animation: 150,
        group: {
          name: 'elements',
          pull: 'clone',
          put: false
        },
        sort: false,
        onEnd: (evt) => onDragEnd(evt, 'element'),
      });
    }
  });

  const toggleEditMode = $(() => {
    isEditMode.value = !isEditMode.value;
  });

  return (
    <div>
      <button 
        onClick$={toggleEditMode} 
        class="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isEditMode.value ? 'Switch to Preview' : 'Switch to Edit'}
      </button>

      {isEditMode.value ? (
        <div class="flex">
          {/* Sidebar */}
          <div class="w-64 bg-gray-100 p-4">
            <h2 class="text-xl font-bold mb-4">Elements</h2>
            <div ref={sidebarRef} class="sidebar-elements">
              <div class="bg-yellow-100 p-2 rounded mb-2 cursor-move" data-element-type="paragraph">
                <span class="element-handle mr-2">☰</span>
                <p>Paragraph</p>
              </div>
              <div class="bg-yellow-100 p-2 rounded mb-2 cursor-move" data-element-type="button">
                <span class="element-handle mr-2">☰</span>
                <p>Button</p>
              </div>
              <div class="bg-yellow-100 p-2 rounded mb-2 cursor-move" data-element-type="input">
                <span class="element-handle mr-2">☰</span>
                <p>Text Input</p>
              </div>
            </div>
          </div>

          {/* Main content - Edit Mode */}
          <div
            ref={containerRef}
            class="flex-1 p-4"
          >
            {data.value.map((section, sectionIndex) => (
              <div key={section.id} class="mb-8 p-4 bg-blue-100 rounded-lg section" data-item-type="section" data-item-id={section.id} data-section-index={sectionIndex}>
                <div class="flex items-center mb-4">
                  <span class="section-handle cursor-move mr-2">☰</span>
                  <h2 class="text-2xl font-bold">Section {section.id}</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 column-container">
                  {section.columns.map((column, columnIndex) => (
                    <div key={column.id} class="bg-green-100 p-4 rounded-lg column" data-item-type="column" data-item-id={column.id} data-column-index={columnIndex}>
                      <div class="flex items-center mb-2">
                        <span class="column-handle cursor-move mr-2">☰</span>
                        <h3 class="text-xl font-semibold">Column {column.id}</h3>
                      </div>
                      <div class="grid grid-cols-1 gap-2 element-container min-h-[50px]">
                        {column.elements.map((element, elementIndex) => (
                          <div
                            key={element.id}
                            class="bg-yellow-100 p-2 rounded element"
                            data-item-type="element"
                            data-item-id={element.id}
                            data-element-index={elementIndex}
                          >
                            <div class="flex items-center">
                              <span class="element-handle cursor-move mr-2">☰</span>
                              {element.type === 'paragraph' && <p>{element.content}</p>}
                              {element.type === 'button' && <button class="bg-blue-500 text-white px-4 py-2 rounded">{element.content}</button>}
                              {element.type === 'input' && <input type="text" placeholder={element.content} class="border p-2 rounded" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Preview Mode
        <div class="container mx-auto p-4">
          {data.value.map((section) => (
            <div key={section.id} class="mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.columns.map((column) => (
                  <div key={column.id} class="bg-white p-4 rounded-lg shadow">
                    {column.elements.map((element) => (
                      <div key={element.id} class="mb-4">
                        {element.type === 'paragraph' && <p>{element.content}</p>}
                        {element.type === 'button' && (
                          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            {element.content}
                          </button>
                        )}
                        {element.type === 'input' && (
                          <input
                            type="text"
                            placeholder={element.content}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default component$(() => {
  const sampleData: Section[] = [
    {
      id: '1',
      columns: [
        {
          id: '1-1',
          elements: [
            { id: '1-1-1', type: 'paragraph', content: 'This is a sample paragraph.' },
            { id: '1-1-2', type: 'button', content: 'Click me!' },
          ],
        },
        {
          id: '1-2',
          elements: [
            { id: '1-2-1', type: 'input', content: 'Enter text here' },
            { id: '1-2-2', type: 'paragraph', content: 'Another sample paragraph.' },
          ],
        },
      ],
    },
    {
      id: '2',
      columns: [
        {
          id: '2-1',
          elements: [
            { id: '2-1-1', type: 'paragraph', content: 'This is a sample paragraph.' },
            { id: '2-1-2', type: 'button', content: 'Click me!' },
          ],
        },
        {
          id: '2-2',
          elements: [
            { id: '2-2-1', type: 'input', content: 'Enter text here' },
            { id: '2-2-2', type: 'paragraph', content: 'Another sample paragraph.' },
          ],
        },
      ],
    },
  ];

  return <IntegratedLayoutManager initialSections={sampleData} />;
});
