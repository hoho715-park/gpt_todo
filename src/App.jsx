import { useState, useEffect, useMemo, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TodoContext = createContext();

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("modern_todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme_mode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("modern_todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("theme_mode", JSON.stringify(dark));
  }, [dark]);

  const addTodo = (text, priority) => {
    if (!text.trim()) return;
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id) =>
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );

  const deleteTodo = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () =>
    setTodos((prev) => prev.filter((t) => !t.completed));

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const value = {
    todos: filteredTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  };

  return (
    <TodoContext.Provider value={value}>
      <div
        className={`${dark ? "dark" : ""} min-h-screen transition-colors duration-500 bg-gradient-to-br from-indigo-100 to-purple-200 dark:from-gray-900 dark:to-black`}
      >
        <div className="max-w-2xl mx-auto px-4 py-10">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Modern Todo
            </h1>
            <button
              onClick={() => setDark((d) => !d)}
              className="px-4 py-2 rounded-xl bg-white/70 dark:bg-gray-800 text-sm font-medium shadow hover:scale-105 transition"
            >
              {dark ? "Light" : "Dark"}
            </button>
          </header>

          <AddTodo />

          <FilterBar current={filter} setFilter={setFilter} />

          <TodoList />

          <Footer
            total={todos.length}
            completed={todos.filter((t) => t.completed).length}
          />
        </div>
      </div>
    </TodoContext.Provider>
  );
}

function AddTodo() {
  const { addTodo } = useContext(TodoContext);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    addTodo(text, priority);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg mb-6 flex flex-col sm:flex-row gap-3"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white outline-none"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="px-3 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:scale-105 transition">
        Add
      </button>
    </form>
  );
}

function FilterBar({ current, setFilter }) {
  const filters = ["all", "active", "completed"];

  return (
    <div className="flex justify-center gap-3 mb-6">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            current === f
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function TodoList() {
  const { todos } = useContext(TodoContext);

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function TodoItem({ todo }) {
  const { toggleTodo, deleteTodo } = useContext(TodoContext);

  const priorityColor = {
    low: "border-green-400",
    medium: "border-yellow-400",
    high: "border-red-400",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border-l-4 ${priorityColor[todo.priority]}`}
    >
      <div
        onClick={() => toggleTodo(todo.id)}
        className="flex-1 cursor-pointer"
      >
        <p
          className={`text-gray-800 dark:text-white ${
            todo.completed ? "line-through opacity-50" : ""
          }`}
        >
          {todo.text}
        </p>
        <span className="text-xs text-gray-400">
          {new Date(todo.createdAt).toLocaleString()}
        </span>
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="ml-4 text-red-500 hover:scale-110 transition"
      >
        ✕
      </button>
    </motion.div>
  );
}

function Footer({ total, completed }) {
  const { clearCompleted } = useContext(TodoContext);

  return (
    <div className="mt-8 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
      <span>
        {completed}/{total} completed
      </span>
      <button onClick={clearCompleted} className="hover:underline">
        Clear completed
      </button>
    </div>
  );
}

export default App;
