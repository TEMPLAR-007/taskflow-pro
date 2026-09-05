'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface Task {
  id: string;
  title: string;
  description?: string | null;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

function ColumnView({
  column,
  index,
  onAddTask,
}: {
  column: Column;
  index: number;
  onAddTask: (columnId: string) => void;
}) {
  return (
    <Draggable draggableId={column.id} index={index} isDragDisabled>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-gray-100 rounded-xl w-72 flex-shrink-0 p-3"
        >
          <div {...provided.dragHandleProps} className="font-semibold mb-3 px-1">
            {column.title}
            <span className="text-gray-400 font-normal ml-2">
              {column.tasks.length}
            </span>
          </div>
          <Droppable droppableId={column.id} type="TASK">
            {(dropProvided) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="space-y-2 min-h-[100px]"
              >
                {column.tasks.map((task, i) => (
                  <Draggable key={task.id} draggableId={task.id} index={i}>
                    {(dragProvided, snapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`bg-white rounded-lg p-3 shadow-sm border ${
                          snapshot.isDragging ? 'border-indigo-500 shadow-lg' : 'border-gray-200'
                        }`}
                      >
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>
          <button
            onClick={() => onAddTask(column.id)}
            className="mt-3 w-full text-sm text-gray-500 hover:text-indigo-600 py-1"
          >
            + Add task
          </button>
        </div>
      )}
    </Draggable>
  );
}

export default function BoardView({
  columns,
  onAddTask,
  onMoveTask,
}: {
  columns: Column[];
  onAddTask: (columnId: string) => void;
  onMoveTask: (taskId: string, columnId: string, position: number) => void;
}) {
  function handleDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    onMoveTask(result.draggableId, destination.droppableId, destination.index);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" type="COLUMN" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex gap-4 overflow-x-auto p-4"
          >
            {columns.map((column, i) => (
              <ColumnView key={column.id} column={column} index={i} onAddTask={onAddTask} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
