import React, { useState } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";
import { useMount } from "react-use";
import { v4 as uuid } from "uuid";

import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";

import Form, { FormData } from "../Form";

export const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
  leftIcon: {
    marginRight: theme.spacing(1),
  },
}));

const itemsFromBackend = [
  { id: uuid(), label: "First task", storyPointsEstimation: 0.25 },
  { id: uuid(), label: "Second task", storyPointsEstimation: 0.25 },
  { id: uuid(), label: "Third task", storyPointsEstimation: 0.25 },
  { id: uuid(), label: "Fourth task", storyPointsEstimation: 0.25 },
  { id: uuid(), label: "Fifth task", storyPointsEstimation: 0.25 },
];

const columnsFromBackend = {
  [uuid()]: {
    name: "Requested",
    items: itemsFromBackend,
  },
  [uuid()]: {
    name: "To do",
    items: [],
  },
  [uuid()]: {
    name: "In Progress",
    items: [],
  },
  [uuid()]: {
    name: "Done",
    items: [],
  },
};

const onDragEnd = (
  result: DropResult,
  columns: { [x: string]: any },
  setColumns: {
    (
      value: React.SetStateAction<{
        [x: string]: {
          name: string;
          items: { id: string; label: string; storyPointsEstimation: number }[];
        };
      }>
    ): void;
    (arg0: any): void;
  }
) => {
  if (!result.destination) return;
  const { source, destination } = result;

  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });
    localStorage.setItem(
      "columns",
      JSON.stringify({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      })
    );
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
    localStorage.setItem(
      "columns",
      JSON.stringify({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      })
    );
  }
};

const Kanban = () => {
  const classes = useStyles();
  const [columns, setColumns] = useState(columnsFromBackend);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = (data: FormData) => {
    setColumns((prevState) => {
      const newItem = Object.values(prevState).find(
        (item) => item.name === "Requested"
      );
      const key = Object.keys(prevState).find(
        (key) => prevState[key] === newItem
      );

      if (newItem && key) {
        newItem.items = [...newItem.items, data];
        const newState = { ...prevState, [key]: newItem };
        localStorage.setItem("columns", JSON.stringify(newState));
        return newState;
      }

      return prevState;
    });

    setIsDialogOpen(false);
  };

  useMount(() => {
    const localStorageColumns = localStorage.getItem("columns");
    if (localStorageColumns) {
      setColumns(JSON.parse(localStorageColumns));
    }
  });

  return (
    <Grid>
      <Grid>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => setIsDialogOpen(true)}
        >
          <Add className={classes.leftIcon} />
          ADD
        </Button>
      </Grid>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>ADD</DialogTitle>
        <DialogContent>
          <DialogContentText>Add new task</DialogContentText>
          <Form handleAdd={handleAdd} />
        </DialogContent>
      </Dialog>
      <Grid
        style={{ display: "flex", justifyContent: "center", height: "100%" }}
      >
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column]) => {
            return (
              <Grid
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                key={columnId}
              >
                <h2>{column.name}</h2>
                <Grid style={{ margin: 8 }}>
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => {
                      return (
                        <Grid
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            background: snapshot.isDraggingOver
                              ? "lightblue"
                              : "lightgrey",
                            padding: 4,
                            width: 250,
                            minHeight: 500,
                          }}
                        >
                          {column.items.map((item, index) => {
                            return (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => {
                                  return (
                                    <Grid
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        userSelect: "none",
                                        padding: 16,
                                        margin: "0 0 8px 0",
                                        minHeight: "50px",
                                        backgroundColor: snapshot.isDragging
                                          ? "#263B4A"
                                          : "#456C86",
                                        color: "white",
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      {item.label}
                                      {" - "}
                                      {item.storyPointsEstimation}
                                    </Grid>
                                  );
                                }}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </Grid>
                      );
                    }}
                  </Droppable>
                </Grid>
              </Grid>
            );
          })}
        </DragDropContext>
      </Grid>
    </Grid>
  );
};

export default Kanban;
