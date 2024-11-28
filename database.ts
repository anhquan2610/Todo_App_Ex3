import * as SQLite from "expo-sqlite/legacy";

interface ITodo {
  id: number;
  name: string;
  completed: boolean;
}

const db = SQLite.openDatabase("todo.db");

export const init = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          completed INTEGER NOT NULL
        );`,
        [],
        () => {
          resolve(true);
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const insertTodo = (name: string, completed: boolean) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO todos (name, completed) VALUES (?, ?);",
        [name, completed ? 1 : 0],
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export const fetchTodos = (): Promise<ITodo[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM todos;",
        [],
        (_, result) => {
          const todos: ITodo[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            todos.push({
              id: result.rows.item(i).id,
              name: result.rows.item(i).name,
              completed: result.rows.item(i).completed === 1,
            });
          }
          resolve(todos);
        },
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};

export const updateTodo = (
  id: number,
  name: string,
  completed: boolean
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE todos SET name = ?, completed = ? WHERE id = ?;",
        [name, completed ? 1 : 0, id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return true;
        }
      );
    });
  });
};

export const deleteTodo = (id: number) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM todos WHERE id = ?;",
        [id],
        () => {
          resolve(true);
        },
        (_, error) => {
          console.error(error);
          reject(error);
          return true;
        }
      );
    });
  });
};
