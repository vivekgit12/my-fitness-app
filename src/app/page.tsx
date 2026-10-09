"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SPLIT_PLAN: Record<string, { target: string; defaultExercises: string[]; advancedAdditions: string[] }> = {
  "Day 1": {
    target: "Chest & Triceps",
    defaultExercises: [
      "Barbell Bench Press",
      "Incline Dumbbell Press",
      "Chest Dips",
      "Cable Flyes (Middle)",
      "Tricep Rope Pushdown",
      "Overhead Dumbbell Extension",
      "Close-Grip Bench Press",
    ],
    advancedAdditions: ["Skull Crushers", "Decline Dumbbell Flyes", "Single-Arm Cable Extension"],
  },
  "Day 2": {
    target: "Back & Biceps",
    defaultExercises: [
      "Barbell Bent-Over Row",
      "Lat Pulldown (Wide Grip)",
      "Seated Cable Row",
      "Dumbbell Single-Arm Row",
      "Barbell Bicep Curl",
      "Hammer Curls",
      "Incline Dumbbell Curl",
    ],
    advancedAdditions: ["Deadlift", "Preacher Curl", "Face Pulls"],
  },
  "Day 3": {
    target: "Shoulder & Core",
    defaultExercises: [
      "Overhead Barbell Press",
      "Dumbbell Lateral Raise",
      "Front Dumbbell Raise",
      "Reverse Cable Fly (Rear Delt)",
      "Barbell Shrugs",
      "Hanging Leg Raise",
      "Ab Wheel Rollout",
    ],
    advancedAdditions: ["Arnold Press", "Plank with Shoulder Taps", "Cable Woodchoppers"],
  },
  "Day 4": {
    target: "Leg & Arms",
    defaultExercises: [
      "Barbell Back Squat",
      "Leg Press",
      "Romanian Deadlift",
      "Leg Extension",
      "Lying Leg Curl",
      "Concentration Curl",
      "Tricep Kickbacks",
    ],
    advancedAdditions: ["Bulgarian Split Squat", "Standing Calf Raise", "EZ-Bar Spider Curl"],
  },
  "Day 5": {
    target: "Cardio & Core",
    defaultExercises: [
      "Treadmill HIIT Sprints",
      "Jump Rope Intervals",
      "Rowing Machine Sprints",
      "Mountain Climbers",
      "Russian Twists",
      "Bicycle Crunches",
      "Burpees",
    ],
    advancedAdditions: ["Box Jumps", "Kettlebell Swings", "Battle Ropes"],
  },
};

export default function Home() {
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(50);
  const [logs, setLogs] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [message, setMessage] = useState("");

  const activeSplit = SPLIT_PLAN[selectedDay];

  const availableExercises = [
    ...activeSplit.defaultExercises,
    ...(currentWeek > 4 ? activeSplit.advancedAdditions : []),
  ];

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("workout_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
    setSelectedExercise(availableExercises[0]);
  }, [selectedDay, currentWeek]);

  useEffect(() => {
    const previousLog = logs.find((l) => l.exercise_name === selectedExercise);
    if (previousLog) {
      if (previousLog.reps >= 12) {
        const nextWeight = Number(previousLog.weight_kg) + 2.5;
        setSuggestion(
          `🔥 Growth Alert: You completed ${previousLog.reps} reps last time! Increase weight to ${nextWeight} kg today.`
        );
        setWeight(nextWeight);
      } else {
        setSuggestion(
          `💪 Maintain ${previousLog.weight_kg} kg and aim for 12 reps before bumping up the weight.`
        );
        setWeight(previousLog.weight_kg);
      }
    } else {
      setSuggestion("New exercise selected! Set your initial baseline weight.");
    }
  }, [selectedExercise, logs]);

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving performance...");

    const { error } = await supabase.from("workout_logs").insert([
      {
        exercise_name: selectedExercise,
        sets: Number(sets),
        reps: Number(reps),
        weight_kg: Number(weight),
        day_split: selectedDay,
      },
    ]);

    if (!error) {
      setMessage("Performance logged!");
      fetchLogs();
    } else {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-black text-emerald-400">
            5-Day Customized Split & Growth Engine
          </h1>
          <div className="flex justify-center items-center gap-3">
            <span className="text-xs text-slate-400">Current Phase: Week {currentWeek}</span>
            <button
              onClick={() => setCurrentWeek((w) => w + 1)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1 rounded border border-slate-700"
            >
              + Advance Week
            </button>
          </div>
        </header>

        {/* 5-Day Workout Split Selector */}
        <div className="grid grid-cols-5 gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
          {Object.keys(SPLIT_PLAN).map((dayKey) => (
            <button
              key={dayKey}
              onClick={() => setSelectedDay(dayKey)}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                selectedDay === dayKey
                  ? "bg-emerald-500 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {dayKey}
            </button>
          ))}
        </div>

        {/* Selected Day Target Banner */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              {selectedDay} Target ({availableExercises.length} Exercises)
            </h2>
            <p className="text-xl font-extrabold text-emerald-400">{activeSplit.target}</p>
          </div>
          {currentWeek > 4 && (
            <span className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
              ✨ Advanced Unlocked
            </span>
          )}
        </div>

        {/* Progressive Overload Alert */}
        {suggestion && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-emerald-300 text-sm font-semibold">
            {suggestion}
          </div>
        )}

        {/* Workout Logger Form */}
        <form
          onSubmit={handleLogWorkout}
          className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 shadow-lg"
        >
          <h3 className="text-md font-bold text-slate-200">
            Log Performance ({activeSplit.target})
          </h3>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase text-slate-400">
              Select Exercise
            </label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-white"
            >
              {availableExercises.map((ex, idx) => (
                <option key={ex} value={ex}>
                  {idx + 1}. {ex}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Sets</label>
              <input
                type="number"
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">
                Equipment Wt (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-bold rounded text-slate-950 transition"
          >
            Log Performance & Calculate Progression
          </button>
          {message && <p className="text-sm text-center text-slate-400 mt-2">{message}</p>}
        </form>

        {/* 📜 DAILY LOG HISTORY SECTION */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-md font-bold text-slate-200">Daily Log History</h3>
          {logs.length === 0 ? (
            <p className="text-xs text-slate-500">No workout logs recorded yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700/50"
                >
                  <div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 font-bold mr-2">
                      {log.day_split || "Log"}
                    </span>
                    <span className="font-semibold text-slate-200 text-sm">{log.exercise_name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(log.created_at).toLocaleDateString()} at{" "}
                      {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-emerald-400">
                      {log.sets} sets × {log.reps} reps
                    </p>
                    <p className="text-xs text-slate-400">{log.weight_kg} kg</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}