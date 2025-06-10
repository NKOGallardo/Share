 const quizTitleInput = document.getElementById("quizTitle");
    const questionInput = document.getElementById("questionInput");
    const optionInputs = document.querySelectorAll(".option");
    const correctAnswerSelect = document.getElementById("correctAnswer");
    const preview = document.getElementById("preview");
    const quizTitlePreview = document.getElementById("quizTitlePreview");
    const shareLinkInput = document.getElementById("shareLink");

    const questions = [];

    quizTitleInput.addEventListener("input", () => {
      quizTitlePreview.textContent = quizTitleInput.value;
    });

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

    function shareQuiz() {
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