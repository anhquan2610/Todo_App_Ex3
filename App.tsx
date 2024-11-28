import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  init,
  insertTodo,
  fetchTodos,
  updateTodo,
  deleteTodo,
} from "./database"; 

interface ITodo {
  id: number;
  name: string;
  completed: boolean;
}

export default function App() {
  const [todo, setTodo] = useState(""); // input todo
  const [listTodo, setListTodo] = useState<ITodo[]>([]); // list todo
  const [isEditing, setIsEditing] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );

  useEffect(() => {
    init()
      .then(() => {
        fetchTodos().then((todos) => setListTodo(todos as ITodo[]));
      })
      .catch((error) => {
        console.error("Failed to initialize the database:", error);
      });
  }, []);

  const handleAddTodo = () => {
    if (!todo) {
      Alert.alert("Warning!", "Please input todo!");
      return;
    }

    if (isEditing && editingTodoId !== null) {
      updateTodo(editingTodoId, todo, false)
        .then(() => {
          const updatedTodos = listTodo.map((item) =>
            item.id === editingTodoId ? { ...item, name: todo } : item
          );
          setListTodo(updatedTodos);
          setIsEditing(false);
          setEditingTodoId(null);
        })
        .catch((error) => {
          console.error("Failed to update todo:", error);
        });
    } else {
      insertTodo(todo, false)
        .then((id) => {
          setListTodo((prevTodos) => [
            { id: Number(id), name: todo, completed: false },
            ...prevTodos,
          ]);
        })
        .catch((error) => {
          console.error("Failed to add todo:", error);
        });
    }
    setTodo(""); // Clear input
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this todo?",
      [
        { text: "No" },
        {
          text: "Yes",
          onPress: () => {
            deleteTodo(id)
              .then(() => {
                const newTodo = listTodo.filter((item) => item.id !== id);
                setListTodo(newTodo);
              })
              .catch((error) => {
                console.error("Failed to delete todo:", error);
              });
          },
        },
      ]
    );
  };

  const handleEditTodo = (id: number, name: string, completed: boolean) => {
    if (completed) {
      Alert.alert("Warning!", "You cannot edit a completed todo!");
      return;
    }

    setIsEditing(true);
    setEditingTodoId(id);
    setTodo(name);
  };

  const handleCompleteTodo = (id: number) => {
    const updatedTodos = listTodo.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setListTodo(updatedTodos);

  
    const currentTodo = updatedTodos.find((item) => item.id === id);
    if (currentTodo) {
      updateTodo(id, currentTodo.name, currentTodo.completed).catch((error) => {
        console.error("Failed to update todo:", error);
      });
    }
  };

  const filteredTodos = () => {
    if (filter === "completed") {
      return listTodo.filter((todo) => todo.completed);
    } else if (filter === "incomplete") {
      return listTodo.filter((todo) => !todo.completed);
    }
    return listTodo; 
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.containerHeader}>
          <Text style={styles.titleHeader}>ToDo App</Text>
        </View>

        {/* Body */}
        <View style={styles.containerBody}>
          <Text style={styles.textBody}>
            {isEditing ? "Edit Todo" : "Create Todo List"} :
          </Text>
          <TextInput
            onChangeText={(value) => setTodo(value)}
            style={styles.textInputBody}
            value={todo}
            placeholder="Enter your todo"
          />
          <TouchableOpacity style={styles.btnBody}>
            <Text onPress={handleAddTodo} style={styles.textBtnBody}>
              {isEditing ? "Update Todo" : "Add Todo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setFilter("all")}
            style={styles.filterButton}
          >
            <Text style={styles.filterTextAll}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("completed")}
            style={styles.filterButton}
          >
            <Text style={styles.filterText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("incomplete")}
            style={styles.filterButton}
          >
            <Text style={styles.filterText}>Incomplete</Text>
          </TouchableOpacity>
        </View>

        {/* List Todo */}
        <View style={styles.listContainer}>
          <Text style={styles.titleList}>Todo List</Text>
          <View style={styles.itemContainer}>
            <FlatList
              data={filteredTodos()}
              keyExtractor={(item) => item.id + ""}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleCompleteTodo(item.id)}>
                  <View style={styles.groupItem}>
                    <Text
                      disabled={item.completed}
                      style={[
                        styles.itemTodo,
                        item.completed && styles.completedTodo,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.groupIcons}>
                      <TouchableOpacity
                        onPress={() =>
                          handleEditTodo(item.id, item.name, item.completed)
                        }
                      >
                        <FontAwesome name="edit" size={24} color="black" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteTodo(item.id)}
                      >
                        <Feather name="trash-2" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECDFCC",
    display: "flex",
    paddingTop: 50,
  },
  containerHeader: {},
  titleHeader: {
    backgroundColor: "#A5B68D",
    width: "100%",
    display: "flex",
    alignContent: "center",
    padding: 15,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 25,
    color: "white",
  },
  containerBody: {
    display: "flex",
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  textBody: {
    fontSize: 15,
    marginBottom: 10,
  },
  textInputBody: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    padding: 5,
    fontSize: 15,
    marginBottom: 10,
  },
  btnBody: {
    backgroundColor: "#FFAD60",
    padding: 10,
    borderRadius: 10,
  },
  textBtnBody: {
    textAlign: "center",
    fontSize: 15,
    color: "white",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginVertical: 10,
  },
  filterButton: {
    backgroundColor: "#A5B68D",
    padding: 10,
    borderRadius: 5,
  },
  filterText: {
    color: "white",
    fontSize: 15,
  },
  filterTextAll: {
    color: "white",
    fontSize: 15,
    paddingHorizontal: 25,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  titleList: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  itemContainer: {
    display: "flex",
    flexDirection: "column",
  },
  itemTodo: {
    fontSize: 18,
    marginBottom: 5,
    marginTop: 20,
    flex: 10,
  },
  groupItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    borderStyle: "dashed",
    gap: 10,
  },
  groupIcons: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
    flex: 2,
  },
  completedTodo: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});
