import React, { useEffect, useState } from "react";
import axios from "axios";

const Todo = () => {
  const [todo, setTodo] = useState([]);
  const [title, setTitle] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [marks, setMarks] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const subjects = [
    "Tamil",
    "English",
    "Maths",
    "Physics",
    "Chemistry",
    "Biology / Computer Science",
  ];

  const fetchTodos = async () => {
    const res = await axios.get("http://localhost:3333/todo");
    setTodo(res.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleMarkChange = (index, value) => {
    const updated = [...marks];
    if (value === "") {
      updated[index] = "";
    } else {
      const num = Number(value);
      if (num < 0 || num > 100) return;
      updated[index] = num;
    }
    setMarks(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (marks.some((m) => m === "")) {
      setError("Enter all marks");
      return;
    }
    const total = marks.reduce((a, b) => a + b, 0);
    const average = total / marks.length;
    const subjectResults = marks.map((m) => (m < 35 ? "FAIL" : "PASS"));
    const overallResult = subjectResults.includes("FAIL") ? "FAIL" : "PASS";

    const data = {
      title,
      rollNo,
      marks,
      total,
      average,
      subjectResults,
      result: overallResult,
      completed: false,
    };

    await axios.post("http://localhost:3333/todo", data);
    fetchTodos();
    setTitle("");
    setRollNo("");
    setMarks(["", "", "", "", "", ""]);
    setError("");
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:3333/todo/${id}`);
    fetchTodos();
  };

  const handleUpdate = async (t) => {
    await axios.put(`http://localhost:3333/todo/${t._id}`, {
      completed: !t.completed,
    });
    fetchTodos();
  };

  const passedStudents = todo
    .filter((t) => t.result === "PASS")
    .sort((a, b) => b.total - a.total)
    .map((t, index) => ({ ...t, rank: index + 1 }));

  const rankedTodos = todo.map((t) => {
    const passed = passedStudents.find((p) => p._id === t._id);
    return { ...t, rank: passed ? passed.rank : null };
  });

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />
      <div className="todo">
        <div className="part1">
          <form onSubmit={handleSubmit}>
            <h1>STUDENT MARKS</h1>

            <input
              type="text"
              placeholder="Student Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />

            <div className="marks">
              {subjects.map((sub, i) => (
                <input
                  key={i}
                  type="number"
                  placeholder={sub}
                  value={marks[i]}
                  onChange={(e) => handleMarkChange(i, e.target.value)}
                  required
                />
              ))}
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit">
              <i className="fa-solid fa-plus"></i> Add
            </button>
          </form>
        </div>

        <div className="part2">
          <div className="todo-container">
            {rankedTodos.map((t, i) => (
              <div
                className={`item ${t.completed ? "finished" : ""}`}
                key={i}
              >
                <h2>{t.title}</h2>
                <p>Roll No: {t.rollNo}</p>
                <p>
                  <b>Rank = {t.rank ?? "NIL"}</b>
                </p>

                <div className="marks-display">
                  {subjects.map((sub, idx) => (
                    <p
                      key={idx}
                      style={{
                        color: t.subjectResults[idx] === "FAIL" ? "red" : "black",
                      }}
                    >
                      {sub} = {t.marks[idx]} ({t.subjectResults[idx]})
                    </p>
                  ))}
                </div>

                <p>
                  <b>Total = {t.total}</b>
                </p>
                <p>
                  <b>Average = {t.average.toFixed(2)}</b>
                </p>

                <p>
                  <b>
                    Result ={" "}
                    <span
                      style={{ color: t.result === "FAIL" ? "red" : "green" }}
                    >
                      {t.result}
                    </span>
                  </b>
                </p>

                <div className="action">
                  <button className="com" onClick={() => handleUpdate(t)}>
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button className="del" onClick={() => handleDelete(t._id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Todo;
