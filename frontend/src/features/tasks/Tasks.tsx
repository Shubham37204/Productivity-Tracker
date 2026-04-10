import { useEffect, useState } from "react";
import { useApiStore } from "../../store/useApi";
import { useTaskStore } from "../../store/useTaskStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Trash2, CheckCircle2, Circle, Plus, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "../../types";
import { taskApi } from "../../api/tasks";

const CATEGORIES = ["General", "Work", "Personal", "Health", "Learning"];
const CATEGORY_COLORS: Record<string, string> = {
  General: "bg-slate-100 text-slate-700",
  Work: "bg-blue-100 text-blue-700",
  Personal: "bg-purple-100 text-purple-700",
  Health: "bg-green-100 text-green-700",
  Learning: "bg-orange-100 text-orange-700",
};

export default function Tasks() {
  const api = useApiStore((s) => s.api);
  const { tasks, addTask, updateTask, removeTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [xpPopup, setXpPopup] = useState<string | null>(null);

  useEffect(() => {
    if (!api) return;
    taskApi(api).getAll();
  }, [api]);

  const handleAdd = async () => {
    if (!api || !title.trim()) return;
    setLoading(true);
    try {
      const task = await api
        .post("api/tasks/", { json: { title, category, xp: 10 } })
        .json<Task>();
      addTask(task);
      setTitle("");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (task: Task) => {
    if (!api || task.completed) return;
    const updated = await api
      .put(`api/tasks/${task.id}`, { json: { completed: true } })
      .json<Task>();
    updateTask(task.id, updated);
    setXpPopup(task.id);
    setTimeout(() => setXpPopup(null), 1500);
  };

  const handleDelete = async (id: string) => {
    if (!api) return;
    await api.delete(`api/tasks/${id}`);
    removeTask(id);
  };

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1 text-base">
          {pending.length} pending · {done.length} completed
        </p>
      </div>

      {/* Add task card */}
      <Card className="shadow-sm border-border">
        <CardContent className="pt-6 pb-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              Task title
            </label>
            <Input
              placeholder="What do you want to accomplish?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="text-base h-11"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                    ${
                      category === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAdd}
            disabled={loading || !title.trim()}
            className="w-full h-11 text-base font-semibold"
          >
            <Plus size={18} className="mr-2" /> Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Pending tasks */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Pending
          </h2>
          <AnimatePresence>
            {pending.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-5 flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(task)}
                      className="shrink-0"
                    >
                      <Circle
                        size={22}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base truncate">
                        {task.title}
                      </p>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-medium ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.General}`}
                      >
                        {task.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 relative">
                      {xpPopup === task.id && (
                        <motion.span
                          initial={{ opacity: 1, y: 0 }}
                          animate={{ opacity: 0, y: -28 }}
                          className="absolute -top-7 right-0 text-green-500 font-bold text-sm whitespace-nowrap"
                        >
                          +{task.xp} XP!
                        </motion.span>
                      )}
                      <span className="text-sm text-yellow-600 font-semibold flex items-center gap-1">
                        <Zap size={13} /> {task.xp}
                      </span>
                      <button onClick={() => handleDelete(task.id)}>
                        <Trash2
                          size={16}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed tasks */}
      {done.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Completed
          </h2>
          {done.map((task) => (
            <Card key={task.id} className="opacity-50">
              <CardContent className="py-4 px-5 flex items-center gap-4">
                <CheckCircle2 size={22} className="text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base line-through text-muted-foreground truncate">
                    {task.title}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-medium ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.General}`}
                  >
                    {task.category}
                  </span>
                </div>
                <button onClick={() => handleDelete(task.id)}>
                  <Trash2
                    size={16}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium">No tasks yet</p>
          <p className="text-sm mt-1">
            Add your first task above to get started!
          </p>
        </div>
      )}
    </div>
  );
}
