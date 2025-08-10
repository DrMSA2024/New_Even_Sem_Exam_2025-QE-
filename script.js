// ========== CONFIG ========== //
const MAX_ATTEMPTS = 3;
const TEACHER_EMAIL = "mshadabalam@jamiahamdard.ac.in";

// ========== MAIN FUNCTIONS ========== //
async function generateQuestions() {
  try {
    // Get student details
    const name = document.getElementById("name").value;
    const rollNumber = document.getElementById("rollNumber").value;
    const email = document.getElementById("email").value;
    const className = document.getElementById("class").value;
    
    // Validate inputs
   // Validate inputs
if (!name || !rollNumber || !email || !className) {
  alert("Please fill all fields");
  return;
}

// Server-side attempt check
const attemptResponse = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ rollNumber })
});
const attemptResult = await attemptResponse.json();
if (attemptResult.error) {
  alert(attemptResult.error);
  return;
}

// Local browser check
if (!checkAttempts(rollNumber)) return;


    // Fetch encrypted questions
    const response = await fetch("questions.json");
    if (!response.ok) throw new Error("Failed to load questions");
    const { q1, other } = await response.json();

    // Decrypt questions
    const q1Questions = q1.map(q => atob(q));
    const otherQuestions = other.map(q => atob(q));

    // Select random questions
    const q1Selected = q1Questions[Math.floor(Math.random() * q1Questions.length)];
    const q2 = otherQuestions.splice(Math.floor(Math.random() * otherQuestions.length), 1)[0];
    const q3 = otherQuestions.splice(Math.floor(Math.random() * otherQuestions.length), 1)[0];

    // Display questions
    displayQuestions(name, rollNumber, className, [q1Selected, q2, q3]);

    // Send email (to teacher & student)
    await sendEmail(rollNumber, name, email, [q1Selected, q2, q3]);
  } catch (error) {
    console.error("Error:", error);
    alert("Error generating questions. Please try again.");
  }
}

function checkAttempts(rollNumber) {
  let attempts = parseInt(localStorage.getItem(`attempts_${rollNumber}`) || 0);

  if (attempts >= MAX_ATTEMPTS) {
    alert(`❌ You've reached the maximum attempts (${MAX_ATTEMPTS}).\nContact Dr. Mohd Shadab Alam.`);
    return false;
  }

  attempts++;
  localStorage.setItem(`attempts_${rollNumber}`, attempts);

  if (attempts === MAX_ATTEMPTS - 1) {
    alert(`⚠️ Warning: You have only 1 attempt left!`);
  }

  return true;
}


async function sendEmail(rollNumber, name, email, questions) {
  try {
    const emailData = {
      teacherEmail: TEACHER_EMAIL,
      studentEmail: email,
      subject: `EGD Exam Questions - ${name} (${rollNumber})`,
      message: `QUESTIONS:\n1. ${questions[0]}\n2. ${questions[1]}\n3. ${questions[2]}`
    };

    // Using FormSubmit.co (replace YOUR_EMAIL)
    await fetch("https://formsubmit.co/mshadabalam@jamiahamdard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData)
    });
  } catch (error) {
    console.error("Email failed:", error);
  }
}

function displayQuestions(name, rollNumber, className, questions) {
  document.getElementById("studentForm").style.display = "none";
  
  document.getElementById("studentDetails").innerHTML = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Roll No:</strong> ${rollNumber}</p>
    <p><strong>Class:</strong> ${className}</p>
  `;

  document.getElementById("questionList").innerHTML = `
    <div class="question"><strong>Q1 (Compulsory):</strong> ${questions[0]}</div>
    <div class="question"><strong>Q2:</strong> ${questions[1]}</div>
    <div class="question"><strong>Q3:</strong> ${questions[2]}</div>
    <div class="note">Note: 1. Q1 is compulsory<br>2. Attempt any one from Q2 or Q3</div>
  `;

  document.getElementById("questionsSection").style.display = "block";
}

function restartExam() {
  document.getElementById("studentForm").style.display = "block";
  document.getElementById("questionsSection").style.display = "none";
  document.getElementById("studentDetails").innerHTML = '';
  document.getElementById("questionList").innerHTML = '';
  document.querySelector('form').reset();
}