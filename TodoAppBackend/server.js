import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());

// Allow frontend origin — set CORS_ORIGIN env var on Render to your frontend URL
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studentmarks";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

const studentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rollNo: { type: String, required: true },
  studentClass: { type: String, default: "" },
  section: { type: String, default: "" },
  userId: { type: String, required: true },
  electiveSubject: { type: String, enum: ["Biology", "Computer Science"], default: "Biology" },
  marks: {
    type: [Number],
    required: true,
    validate: {
      validator: (arr) => arr.length === 6 && arr.every((m) => m >= 0 && m <= 100),
      message: "Each mark must be between 0 and 100 and there must be 6 marks",
    },
  },
  subjectResults: { type: [String], required: true },
  total: { type: Number, required: true },
  average: { type: Number, required: true },
  result: { type: String, enum: ["PASS", "FAIL"], required: true },
  completed: { type: Boolean, default: false },
});

const Student = mongoose.model("Student", studentSchema);

app.post("/todo", async (req, res) => {
  try {
    const { title, rollNo, studentClass, section, userId, electiveSubject, marks } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    if (!marks || marks.length !== 6) {
      return res.status(400).json({ message: "Provide 6 marks" });
    }

    if (marks.some((m) => m < 0 || m > 100)) {
      return res.status(400).json({ message: "Marks must be between 0 and 100" });
    }

    const subjectResults = marks.map((m) => (m < 35 ? "FAIL" : "PASS"));
    const total = marks.reduce((a, b) => a + b, 0);
    const average = total / marks.length;
    const result = subjectResults.includes("FAIL") ? "FAIL" : "PASS";

    console.log("Adding student:", req.body);
    const student = new Student({
      title,
      rollNo,
      studentClass: studentClass || "",
      section: section || "",
      userId,
      electiveSubject: electiveSubject || "Biology",
      marks,
      subjectResults,
      total,
      average,
      result,
      completed: false,
    });

    await student.save();
    console.log("Student saved!");
    res.status(201).json(student);
  } catch (err) {
    console.error("POST /todo error:", err);
    res.status(400).json({ message: err.message });
  }
});

app.get("/todo", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "UserId query parameter is required" });
    }
    const students = await Student.find({ userId });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/todo/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "UserId is required for updates" });
    }

    const updated = await Student.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Student record not found or unauthorized" });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/todo/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "UserId query parameter is required for deletion" });
    }

    const deleted = await Student.findOneAndDelete({ _id: req.params.id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Student record not found or unauthorized" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
