document.addEventListener("DOMContentLoaded", function () {
    // --- 1. DEFINE QUIZ DATA ---
    const quizData = [
      { type: "Membaca", instruction: "Please read the following sentence aloud:", text: "The quick brown fox jumps over the lazy dog." },
      { type: "Membaca", instruction: "Please read this question aloud:", text: "What is your favorite color and why?" },
      { type: "Mendeskripsikan", instruction: "Please describe this image in as much detail as you can.", image: "https://i.ibb.co/6r0MSKr/family-picnic.jpg" },
      { type: "Mendeskripsikan", instruction: "Please describe what is happening in this picture.", image: "https://i.ibb.co/3Wf5x1g/busy-street.jpg" },
      { type: "Menjawab", instruction: "Please answer the following question:", text: "What are your hobbies?" },
      { type: "Menjawab", instruction: "Please answer the following question:", text: "Describe your last holiday." },
    ];
  
    // --- 2. GET HTML ELEMENTS ---
    const usernameInput = document.getElementById("username-input");
    const homepageView = document.getElementById("homepage-view");
    const assessmentView = document.getElementById("assessment-view");
    const quizView = document.getElementById("quiz-view");
    const endView = document.getElementById("end-view");
    const startBtnNav = document.getElementById("start-btn-nav");
    const startBtnHero = document.getElementById("start-btn-hero");
    const nextBtn = document.getElementById("next-btn");
    const restartBtn = document.getElementById("restart-btn");
    const stepperContainer = document.getElementById("progress-stepper");
    const questionTypeEl = document.getElementById("question-type");
    const questionInstructionEl = document.getElementById("question-instruction");
    const questionTextEl = document.getElementById("question-text");
    const recordButton = document.getElementById("recordButton");
    const statusEl = document.getElementById("status");
    const resultEl = document.getElementById("result");
    const timerEl = document.getElementById("timer");
  
    // --- 3. STATE MANAGEMENT ---
    let username = "";
    let currentQuestionIndex = 0;
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    let timerInterval;
    const TIME_LIMIT = 60;
  
    // --- ICONS ---
    const micIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-mic-fill" viewBox="0 0 16 16"><path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/></svg>`;
    const stopIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>`;
  
    // --- 4. FUNCTIONS ---
  
    function showHomepage() {
      homepageView.classList.remove('d-none');
      assessmentView.classList.add('d-none');
      endView.classList.add('d-none');
      resetTimer();
    }
  
    function startQuiz() {
      const nameValue = usernameInput.value.trim();
      if (nameValue === "") {
        alert("Harap masukkan nama Anda untuk memulai tes.");
        return;
      }
      username = nameValue;
  
      homepageView.classList.add('d-none');
      assessmentView.classList.remove('d-none');
      quizView.classList.remove('d-none');
      endView.classList.add('d-none');
      currentQuestionIndex = 0;
      buildStepper();
      loadQuestion();
    }
  
    function buildStepper() {
        stepperContainer.innerHTML = "";
        quizData.forEach((question, index) => {
            const stepItem = document.createElement("div");
            stepItem.classList.add("stepper-item");
            stepItem.innerHTML = `<div class="step-counter">${index + 1}</div><div class="step-name">${question.type}</div>`;
            stepperContainer.appendChild(stepItem);
        });
    }

    function updateStepper() {
        const steps = stepperContainer.querySelectorAll(".stepper-item");
        steps.forEach((step, index) => {
            const stepCounter = step.querySelector('.step-counter');
            if (index < currentQuestionIndex) {
                step.classList.add("completed");
                stepCounter.innerHTML = `<i class="fas fa-check"></i>`;
            } else if (index === currentQuestionIndex) {
                step.classList.add("active");
                step.classList.remove("completed");
                stepCounter.innerHTML = `${index + 1}`;
            } else {
                step.classList.remove("active", "completed");
                stepCounter.innerHTML = `${index + 1}`;
            }
        });
        const progressPercentage = (currentQuestionIndex / (quizData.length - 1)) * 100;
        stepperContainer.style.setProperty("--progress-width", `${progressPercentage}%`);
    }
  
    function loadQuestion() {
      if (currentQuestionIndex < quizData.length) {
        const question = quizData[currentQuestionIndex];
        questionTypeEl.textContent = question.type;
        questionInstructionEl.textContent = question.instruction;
        questionTextEl.innerHTML = '';
  
        if (question.image) {
          questionTextEl.classList.remove('fs-2');
          const img = document.createElement('img');
          img.src = question.image;
          img.alt = "Assessment Image";
          img.classList.add('img-fluid', 'rounded', 'my-3');
          questionTextEl.appendChild(img);
        } else {
          questionTextEl.classList.add('fs-2');
          questionTextEl.textContent = question.text;
        }
  
        statusEl.textContent = "Press the button to start recording";
        resultEl.textContent = "";
        recordButton.disabled = false;
        recordButton.innerHTML = micIcon;
        recordButton.classList.remove('is-recording');
        nextBtn.disabled = true;
        resetTimer();
        updateStepper();
      } else {
        quizView.classList.add("d-none");
        endView.classList.remove("d-none");
      }
    }
  
    function startTimer() {
      let timeLeft = TIME_LIMIT;
      timerEl.textContent = `01:00`;
      timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          statusEl.textContent = "Time's up! Processing...";
          handleRecording();
        }
      }, 1000);
    }
  
    function stopTimer() {
      clearInterval(timerInterval);
    }
  
    function resetTimer() {
      stopTimer();
      timerEl.textContent = "01:00";
    }
  
    async function handleRecording() {
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
  
          isRecording = true;
          recordButton.classList.add("is-recording");
          recordButton.innerHTML = stopIcon;
          statusEl.textContent = "Recording...";
          resultEl.textContent = "";
          audioChunks = [];
          startTimer();
  
          mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            sendAudioToServer(audioBlob);
            stream.getTracks().forEach((track) => track.stop());
          };
        } catch (err) {
          console.error("Error accessing microphone:", err);
          statusEl.textContent = "Error: Could not access microphone.";
        }
      } else {
        stopTimer();
        mediaRecorder.stop();
        isRecording = false;
        recordButton.classList.remove("is-recording");
        recordButton.innerHTML = micIcon;
        statusEl.textContent = "Processing...";
      }
    }
  
    async function sendAudioToServer(audioBlob) {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("questionNumber", currentQuestionIndex + 1);
      formData.append("audioFile", audioBlob, "assessment.wav");
  
      statusEl.textContent = "Submitting answer...";
      try {
        const response = await fetch("/assess", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        const resultText = await response.text();
  
        resultEl.textContent = `Server Response: ${resultText}`;
        statusEl.textContent = "Answer submitted!";
        nextBtn.disabled = false;
        recordButton.disabled = true;
      } catch (error) {
        console.error("Error uploading file:", error);
        resultEl.textContent = "Error";
        statusEl.textContent = "Failed to submit. Please try again.";
        recordButton.disabled = false;
      }
    }
  
    // --- 5. EVENT LISTENERS ---
    startBtnNav.addEventListener("click", (e) => { e.preventDefault(); startQuiz(); });
    startBtnHero.addEventListener("click", (e) => { e.preventDefault(); startQuiz(); });
    restartBtn.addEventListener("click", showHomepage);
    nextBtn.addEventListener("click", () => { currentQuestionIndex++; loadQuestion(); });
    recordButton.addEventListener("click", handleRecording);
  });