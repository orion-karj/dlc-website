const express = require("express");
const path = require("path");
// Fix: Import sendEmail from the correct path (project root)
const sendEmail = require("../sendEmail"); // Go up one level from /api to project root
const dotenv = require("dotenv");

// Fix: Load config.env from project root
dotenv.config({ path: path.join(__dirname, "../config.env") });

const app = express();

// Fix: Set views directory relative to project root
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fix: Serve static files from project root public directory
app.use(express.static(path.join(__dirname, "../public")));

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Basic input sanitization helper
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
}

// רוט ל-Home page שמטען את כל התוכן
app.get("/", (req, res) => {
  res.render("index"); // נטען views/index.pug
});

// About page route
app.get("/about", (req, res) => {
  res.render("about");
});

// Contact page route
app.get("/contact", (req, res) => {
  const { success, error, fullName, email, phone, message } = req.query;
  res.render("contact", {
    success: success === "true",
    error: error ? decodeURIComponent(error) : null,
    fullName: fullName || "",
    email: email || "",
    phone: phone || "",
    message: message || "",
  });
});

// Gallery page route
app.get("/gallery", (req, res) => {
  res.render("gallery");
});

// Birthday Parties page route
app.get("/birthday-parties", (req, res) => {
  res.render("birthday-parties");
});

// Derech Lechaim project page route
app.get("/derech-lechaim", (req, res) => {
  res.render("derech-lechaim");
});

// Personal Training page route
app.get("/personal-training", (req, res) => {
  res.render("personal-training");
});

// School Events page route
app.get("/school-events", (req, res) => {
  res.render("school-events");
});

// Lectures page route
app.get("/lectures", (req, res) => {
  res.render("lectures");
});

// Football Training page route
app.get("/football-training", (req, res) => {
  res.render("football-training");
});

// Contact form submit POST /contact
app.post("/contact", async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Validate required fields
    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "אנא מלאו את כל השדות הנדרשים",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "אנא הזינו כתובת אימייל תקינה",
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      fullName: sanitizeInput(fullName),
      email: sanitizeInput(email),
      phone: phone ? sanitizeInput(phone) : "",
      message: sanitizeInput(message),
    };

    // Send email using your sendEmail utility
    await sendEmail({
      to: process.env.EMAIL_USER,
      subject: `פניה חדשה מאתר - הודעה מ${sanitizedData.fullName}`,
      text: `
      פניה חדשה מהאתר דרך לחיים

      שם מלא: ${sanitizedData.fullName}
      אימייל: ${sanitizedData.email}
      טלפון: ${sanitizedData.phone || "לא סופק"}

      הודעה:
      ${sanitizedData.message}

      ---
      נשלח בתאריך: ${new Date().toLocaleString()}
      `,
      html: `
        <h2>פניה חדשה מהאתר דרך לחיים</h2>
        <p><strong>שם מלא:</strong> ${sanitizedData.fullName}</p>
        <p><strong>אימייל:</strong> ${sanitizedData.email}</p>
        <p><strong>טלפון:</strong> ${sanitizedData.phone || "לא סופק"}</p>
        <h3>הודעה:</h3>
        <p>${sanitizedData.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>נשלח בתאריך: ${new Date().toLocaleString()}</small></p>
      `,
    });

    console.log(`Email sent successfully from ${sanitizedData.email}`);
    res.json({
      success: true,
      message: "הודעתכם נשלחה בהצלחה! נחזור אליכם בהקדם האפשרי.",
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({
      success: false,
      error: "שגיאה בשליחת המייל. אנא נסו שוב מאוחר יותר.",
    });
  }
});

module.exports = app;
