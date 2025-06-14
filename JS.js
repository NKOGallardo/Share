const quizTitleInput = document.getElementById("quizTitle");
const questionInput = document.getElementById("questionInput");
const optionInputs = document.querySelectorAll(".option");
const correctAnswerSelect = document.getElementById("correctAnswer");
const preview = document.getElementById("preview");
const quizTitlePreview = document.getElementById("quizTitlePreview");
const shareLinkInput = document.getElementById("shareLink");
const darkModeBtn = document.getElementById("darkModeBtn");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const loadDraftBtn = document.getElementById("loadDraftBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");

let questions = [];
let timerInterval = null;
let timeLeft = 0;

// --- Dark Mode ---
if (darkModeBtn) {
  darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("quiz_dark", document.body.classList.contains("dark-mode"));
  });
  if (localStorage.getItem("quiz_dark") === "true") {
    document.body.classList.add("dark-mode");
  }
}

// --- Save/Load Draft ---
if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", () => {
    const draft = {
      title: quizTitleInput.value.trim(),
      questions
    };
    localStorage.setItem("quiz_draft", JSON.stringify(draft));
    alert("Draft saved!");
  });
}
if (loadDraftBtn) {
  loadDraftBtn.addEventListener("click", () => {
    const draft = localStorage.getItem("quiz_draft");
    if (draft) {
      const data = JSON.parse(draft);
      quizTitleInput.value = data.title;
      quizTitlePreview.textContent = data.title;
      questions = data.questions;
      renderPreview();
      alert("Draft loaded!");
    } else {
      alert("No draft found.");
    }
  });
}

// --- Export/Import ---
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const data = {
      title: quizTitleInput.value.trim(),
      questions
    };
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}
if (importBtn && importInput) {
  importBtn.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const data = JSON.parse(ev.target.result);
        quizTitleInput.value = data.title;
        quizTitlePreview.textContent = data.title;
        questions = data.questions;
        renderPreview();
        alert("Quiz imported!");
      } catch {
        alert("Invalid file.");
      }
    };
    reader.readAsText(file);
  });
}

// --- Quiz Builder / Answer Mode ---
const urlParams = new URLSearchParams(window.location.search);
const quizParam = urlParams.get("quiz");

if (quizParam) {
  document.querySelectorAll("input, select, button:not(.share-buttons button)").forEach(el => el.style.display = "none");
  quizTitlePreview.style.display = "none";
  shareLinkInput.style.display = "none";
  document.querySelector(".share-buttons").style.display = "none";
  document.querySelector("h1").textContent = "Answer the Quiz";
  const quizData = JSON.parse(decodeURIComponent(quizParam));
  renderQuizToAnswer(quizData);
} else {
  quizTitleInput.addEventListener("input", () => {
    quizTitlePreview.textContent = quizTitleInput.value;
  });
  // Load draft if exists
  if (localStorage.getItem("quiz_draft")) {
    const draft = JSON.parse(localStorage.getItem("quiz_draft"));
    quizTitleInput.value = draft.title;
    quizTitlePreview.textContent = draft.title;
    questions = draft.questions;
    renderPreview();
  }
}

function addQuestion() {
  const question = questionInput.value.trim();
  const options = Array.from(optionInputs).map(opt => opt.value.trim());
  const answer = parseInt(correctAnswerSelect.value);

  if (!question || options.some(opt => !opt)) {
    alert("Please fill in all fields.");
    return;
  }
  questions.push({ question, options, answer });
  renderPreview();
  questionInput.value = "";
  optionInputs.forEach(input => (input.value = ""));
  correctAnswerSelect.value = 0;
}

function renderPreview() {
  preview.innerHTML = "";
  questions.forEach((q, idx) => {
    const box = document.createElement("div");
    box.className = "question-box";
    // Edit/Delete buttons
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.type = "button";
    editBtn.style.marginRight = "8px";
    editBtn.onclick = () => editQuestion(idx);
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.type = "button";
    delBtn.onclick = () => {
      questions.splice(idx, 1);
      renderPreview();
    };
    box.appendChild(editBtn);
    box.appendChild(delBtn);

    const qText = document.createElement("p");
    qText.textContent = `${idx + 1}. ${q.question}`;
    box.appendChild(qText);

    const ul = document.createElement("ul");
    q.options.forEach((opt, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${opt}`;
      if (i === q.answer) li.classList.add("correct");
      ul.appendChild(li);
    });
    box.appendChild(ul);
    preview.appendChild(box);
  });
}

function editQuestion(idx) {
  const q = questions[idx];
  questionInput.value = q.question;
  optionInputs.forEach((input, i) => input.value = q.options[i]);
  correctAnswerSelect.value = q.answer;
  questions.splice(idx, 1);
  renderPreview();
}

function shareQuiz() {
  if (questions.length < 2) {
    alert("Please add at least 2 questions before sharing.");
    return;
  }
  const quizData = {
    title: quizTitleInput.value.trim(),
    questions: questions
  };
  const encoded = encodeURIComponent(JSON.stringify(quizData));
  const url = `${location.origin}${location.pathname}?quiz=${encoded}`;
  shareLinkInput.value = url;
  shareLinkInput.style.display = "block";
  shareLinkInput.select();
  document.execCommand("copy");
  alert("Quiz link copied to clipboard!");
}

function shareWhatsApp() {
  const link = shareLinkInput.value;
  const text = encodeURIComponent(`Check out this quiz: ${link}`);
  window.open(`https://wa.me/?text=${text}`, "_blank");
}

function shareTwitter() {
  const link = shareLinkInput.value;
  const text = encodeURIComponent(`Try out my quiz!`);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, "_blank");
}

function webShare() {
  const link = shareLinkInput.value;
  if (navigator.share) {
    navigator
      .share({
        title: "Quiz Builder",
        text: "Try out this quiz!",
        url: link,
      })
      .catch((err) => console.error("Share failed:", err));
  } else {
    alert("Web Share not supported on this browser. Copy the link manually.");
  }
}

// --- Answering mode ---
function renderQuizToAnswer(quizData) {
  preview.innerHTML = "";
  let current = 0;
  let userAnswers = [];
  let timerDisplay = document.createElement("div");
  timerDisplay.id = "timerDisplay";
  preview.appendChild(timerDisplay);

  // Timer: 30 seconds per question
  timeLeft = quizData.questions.length * 30;
  timerDisplay.textContent = `Time left: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResults();
    }
  }, 1000);

  function showQuestion(idx) {
    preview.querySelectorAll(".question-box, form, .progress").forEach(el => el.remove());
    const form = document.createElement("form");
    form.id = "answerForm";
    // Progress indicator
    const progress = document.createElement("div");
    progress.className = "progress";
    progress.textContent = `Question ${idx + 1} of ${quizData.questions.length}`;
    preview.appendChild(progress);

    const q = quizData.questions[idx];
    const box = document.createElement("div");
    box.className = "question-box";
    const qText = document.createElement("p");
    qText.textContent = `${idx + 1}. ${q.question}`;
    box.appendChild(qText);

    q.options.forEach((opt, i) => {
      const label = document.createElement("label");
      label.style.display = "block";
      label.setAttribute("tabindex", "0");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `q${idx}`;
      radio.value = i;
      radio.required = true;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt));
      box.appendChild(label);
    });

    form.appendChild(box);

    const nextBtn = document.createElement("button");
    nextBtn.type = "submit";
    nextBtn.textContent = idx === quizData.questions.length - 1 ? "Submit Answers" : "Next";
    nextBtn.style.marginTop = "20px";
    form.appendChild(nextBtn);

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const selected = form.querySelector(`input[name="q${idx}"]:checked`);
      userAnswers[idx] = selected ? Number(selected.value) : null;
      if (idx === quizData.questions.length - 1) {
        clearInterval(timerInterval);
        showResults();
      } else {
        showQuestion(idx + 1);
      }
    });

    preview.appendChild(form);
  }

  function showResults() {
    preview.innerHTML = "";
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) score++;
    });
    const result = document.createElement("div");
    result.innerHTML = `<h2>Your Score: ${score} / ${quizData.questions.length}</h2>`;
    // Show correct/incorrect answers
    quizData.questions.forEach((q, idx) => {
      const box = document.createElement("div");
      box.className = "question-box";
      const qText = document.createElement("p");
      qText.textContent = `${idx + 1}. ${q.question}`;
      box.appendChild(qText);
      q.options.forEach((opt, i) => {
        const span = document.createElement("span");
        span.textContent = opt;
        span.style.display = "block";
        if (i === q.answer) span.style.color = "#28a745";
        if (userAnswers[idx] === i && i !== q.answer) span.style.color = "#dc3545";
        if (userAnswers[idx] === i) span.style.fontWeight = "bold";
        box.appendChild(span);
      });
      result.appendChild(box);
    });
    preview.appendChild(result);
  }

  showQuestion(0);
}
