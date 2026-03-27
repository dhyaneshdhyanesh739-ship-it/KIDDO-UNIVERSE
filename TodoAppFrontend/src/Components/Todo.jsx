import React, { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333";

const translations = {
  English: {
    title: "STUDENT MARKS",
    namePlace: "Student Name",
    rollPlace: "Roll No",
    classPlace: "Class",
    sectionPlace: "Section",
    tamil: "Tamil",
    english: "English",
    maths: "Maths",
    physics: "Physics",
    chemistry: "Chemistry",
    biology: "Biology",
    cs: "Computer Science",
    elective: "Elective",
    markPlace: "Mark",
    addBtn: "Add",
    rank: "Rank",
    total: "Total",
    average: "Average",
    result: "Result",
    pass: "PASS",
    fail: "FAIL",
    nil: "NIL",
    doneTip: "Mark as Done",
    shareTip: "Share Details",
    delTip: "Delete",
    reportTitle: "Student Report Card",
    copyMsg: "Student details copied to clipboard!",
    errorAll: "Enter all marks",
    errorClass: "Please select Class and Section",
  },
  Tamil: {
    title: "மாணவர் மதிப்பெண்கள்",
    namePlace: "மாணவர் பெயர்",
    rollPlace: "வரிசை எண்",
    classPlace: "வகுப்பு",
    sectionPlace: "பிரிவு",
    tamil: "தமிழ்",
    english: "ஆங்கிலம்",
    maths: "கணிதம்",
    physics: "இயற்பியல்",
    chemistry: "வேதியியல்",
    biology: "உயிரியல்",
    cs: "கணினி அறிவியல்",
    elective: "விருப்பப் பாடம்",
    markPlace: "மதிப்பெண்",
    addBtn: "சேர்",
    rank: "தரம்",
    total: "மொத்தம்",
    average: "சராசரி",
    result: "முடிவு",
    pass: "தேர்ச்சி",
    fail: "தோல்வி",
    nil: "எதுவுமில்லை",
    doneTip: "முடித்ததாகக் குறிக்கவும்",
    shareTip: "பகிரவும்",
    delTip: "நீக்கு",
    reportTitle: "மாணவர் அறிக்கை அட்டை",
    copyMsg: "மாணவர் விவரங்கள் நகலெடுக்கப்பட்டன!",
    errorAll: "அனைத்து மதிப்பெண்களையும் உள்ளிடவும்",
    errorClass: "வகுப்பு மற்றும் பிரிவைத் தேர்ந்தெடுக்கவும்",
  },
};

const Todo = () => {
  const [todo, setTodo] = useState([]);
  const [title, setTitle] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [section, setSection] = useState("");
  const [electiveSubject, setElectiveSubject] = useState("Biology");
  const [marks, setMarks] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  const [lang, setLang] = useState(() => localStorage.getItem("todo_lang") || "English");

  const t = (key) => translations[lang][key] || key;

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem("todo_lang", newLang);
  };

  const [userId] = useState(() => {
    let id = localStorage.getItem("todo_user_id");
    if (!id) {
      id = "user_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("todo_user_id", id);
    }
    return id;
  });

  const subjects = [
    t("tamil"),
    t("english"),
    t("maths"),
    t("physics"),
    t("chemistry"),
    t("elective"),
  ];

  const fetchTodos = async () => {
    try {
      const res = await axios.get(`${API_URL}/todo`, { params: { userId } });
      setTodo(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
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
      setError(t("errorAll"));
      return;
    }
    const total = marks.reduce((a, b) => a + b, 0);
    const average = total / marks.length;
    const subjectResults = marks.map((m) => (m < 35 ? "FAIL" : "PASS"));
    const overallResult = subjectResults.includes("FAIL") ? "FAIL" : "PASS";

    if (!studentClass || !section) {
      setError(t("errorClass"));
      return;
    }

    const data = {
      title,
      rollNo,
      studentClass,
      section,
      userId,
      electiveSubject,
      marks,
      total,
      average,
      subjectResults,
      result: overallResult,
      completed: false,
    };

    try {
      await axios.post(`${API_URL}/todo`, data);
      fetchTodos();
      setTitle("");
      setRollNo("");
      setStudentClass("");
      setSection("");
      setElectiveSubject("Biology");
      setMarks(["", "", "", "", "", ""]);
      setError("");
    } catch (err) {
      console.error("Add Error:", err);
      alert("Failed to add student. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/todo/${id}`, { params: { userId } });
      fetchTodos();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleUpdate = async (t) => {
    try {
      await axios.put(`${API_URL}/todo/${t._id}`, {
        completed: !t.completed,
        userId,
      });
      fetchTodos();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleShare = (t) => {
    const subjectLines = subjects
      .map((sub, idx) => {
        const subName = idx === 5 ? (t.electiveSubject === "Biology" ? t("biology") : t("cs")) : sub;
        return `${subName} = ${t.marks[idx]} (${t.subjectResults[idx] === "PASS" ? t("pass") : t("fail")})`;
      })
      .join("\n");
    const text =
      `📋 ${t("reportTitle")}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 ${t("namePlace")}    : ${t.title}\n` +
      `🔢 ${t("rollPlace")} : ${t.rollNo}\n` +
      `🎓 ${t("classPlace")}   : ${t.studentClass ?? "-"}\n` +
      `🔠 ${t("sectionPlace")} : ${t.section ?? "-"}\n` +
      `🏆 ${t("rank")}    : ${t.rank ?? t("nil")}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `${subjectLines}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 ${t("total")}   : ${t.total}\n` +
      `📈 ${t("average")} : ${t.average.toFixed(2)}\n` +
      `✅ ${t("result")}  : ${t.result === "PASS" ? t("pass") : t("fail")}`;

    if (navigator.share) {
      navigator.share({ title: `${t.title}'s ${t("reportTitle")}`, text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert(t("copyMsg"));
      });
    }
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
          <div className="lang-switcher">
            <button 
              className={lang === "English" ? "active" : ""} 
              onClick={() => handleLangChange("English")}
            >EN</button>
            <button 
              className={lang === "Tamil" ? "active" : ""} 
              onClick={() => handleLangChange("Tamil")}
            >தமிழ்</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="logo-container">
              <img src={logo} alt="Kiddo Logo" className="logo" />
            </div>
            <h1>{t("title")}</h1>

            <input
              type="text"
              placeholder={t("namePlace")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder={t("rollPlace")}
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />

            <div className="class-section-row">
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                required
              >
                <option value="" disabled>{t("classPlace")}</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((c) => (
                  <option key={c} value={c}>{c}th Std</option>
                ))}
              </select>

              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
              >
                <option value="" disabled>{t("sectionPlace")}</option>
                {["A1","A2","A3","A4","B1","B2","B3","C1","C2","C3","D1","D2","D3"].map((s) => (
                  <option key={s} value={s}>{t("sectionPlace")} {s}</option>
                ))}
              </select>
            </div>

            <div className="marks">
              {subjects.slice(0, 5).map((sub, i) => (
                <input
                  key={i}
                  type="number"
                  placeholder={sub}
                  value={marks[i]}
                  onChange={(e) => handleMarkChange(i, e.target.value)}
                  required
                />
              ))}
              <div className="elective-row">
                <select
                  className="elective-select"
                  value={electiveSubject}
                  onChange={(e) => setElectiveSubject(e.target.value)}
                  required
                >
                  <option value="Biology">{t("biology")}</option>
                  <option value="Computer Science">{t("cs")}</option>
                </select>
                <input
                  type="number"
                  placeholder={t("markPlace")}
                  value={marks[5]}
                  onChange={(e) => handleMarkChange(5, e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button type="submit">
              <i className="fa-solid fa-plus"></i> {t("addBtn")}
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

                <div className="card-meta-row">
                  <span className="meta-badge roll">
                    <i className="fa-solid fa-id-badge"></i> {t("rollPlace")}: {t.rollNo}
                  </span>
                  {t.studentClass && (
                    <span className="meta-badge class-badge">
                      <i className="fa-solid fa-graduation-cap"></i> {t("classPlace")} {t.studentClass}
                    </span>
                  )}
                  {t.section && (
                    <span className="meta-badge section-badge">
                      <i className="fa-solid fa-layer-group"></i> {t("sectionPlace")} {t.section}
                    </span>
                  )}
                  <span className="meta-badge rank-badge">
                    <i className="fa-solid fa-trophy"></i> {t("rank")}: {t.rank ?? t("nil")}
                  </span>
                </div>

                <div className="marks-display">
                  {subjects.map((sub, idx) => {
                    const subName = idx === 5 ? (t.electiveSubject === "Biology" ? t("biology") : t("cs")) : sub;
                    return (
                      <p
                        key={idx}
                        style={{
                          color: t.subjectResults[idx] === "FAIL" ? "red" : "black",
                        }}
                      >
                        {subName} = {t.marks[idx]} ({t.subjectResults[idx] === "PASS" ? t("pass") : t("fail")})
                      </p>
                    );
                  })}
                </div>

                <p>
                  <b>{t("total")} = {t.total}</b>
                </p>
                <p>
                  <b>{t("average")} = {t.average.toFixed(2)}</b>
                </p>

                <p>
                  <b>
                    {t("result")} ={" "}
                    <span
                      style={{ color: t.result === "FAIL" ? "red" : "green" }}
                    >
                      {t.result === "PASS" ? t("pass") : t("fail")}
                    </span>
                  </b>
                </p>

                <div className="action">
                  <button className="com" onClick={() => handleUpdate(t)} title={t("doneTip")}>
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button className="share" onClick={() => handleShare(t)} title={t("shareTip")}>
                    <i className="fa-solid fa-share-nodes"></i>
                  </button>
                  <button className="del" onClick={() => handleDelete(t._id)} title={t("delTip")}>
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
