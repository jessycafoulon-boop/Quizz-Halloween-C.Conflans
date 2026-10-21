
/* =========================================================
   QUIZ : LES COULISSES DE LA MAIRIE DE CONFLANS
   Questions, score, résultats, musique et questionnaire
========================================================= */

// PERSONNALISE LES QUESTIONS ET LES RÉPONSES
const questions = [
  {
    type: "LES COULISSES DE LA MAIRIE",
    text: "Avec moi, les coulisses de la mairie et le quotidien des collègues n'ont plus aucun secret pour toi ! Je te raconte les dernières nouvelles, les événements passés ou à venir et te partage de jolis portraits !",
    hint: "Qui suis-je ?",
    answers: ["Le TAC", "Le menu de la cantine", "Le VAC"],
    correct: 0,
    explanation: "La bonne réponse est le TAC, ton journal interne ! Le nouveau numéro est en ligne, va vite le consulter pour connaître les dernières actualités !"
  },
  {
    type: "QUI FAIS QUOI ?",
    text: "Si tu cherches à joindre un collègue ou à connaître ses fonctions, je suis ta carte aux trésors",
    hint: "Sais-tu sur quel onglet cliquer dans C.Conflans pour y accéder ?",
    answers: ["Le calendrier des fêtes", "L’annuaire", "Le plan des rues"],
    correct: 1,
    explanation: "C'est bien sûr l’annuaire ! Pratique et intuitif, il te permettra de retrouver rapidement un collègue, sa fonction et même de l'appeler, juste en tapant son nom !"
  },
  {
    type: "UN NOUVEL AGENT TRÈS SPÉCIAL ?",
    text: "J’ai quatre pattes, deux grandes oreilles et je viens de rejoindre la mairie",
    hint: "Qui suis-je ?",
    answers: [
      "Matricule 300, chiot à la Police municipale",
      "Moka, lapin mascotte de la crèche Arlequin",
      "Gloria, la chèvre qui écopature au Parc du Prieuré"
    ],
    correct: 0,
    explanation: "La bonne réponse est Matricule 300 ! Cet adorable Malinois vient de rejoindre nos équipes 🥰 Si tu veux en savoir plus, consulte l'article qui lui a été consacré cette semaine !"
  },
  {
    type: "NOËL APPROCHE",
    text: "Quand aura lieu l'arbre de Noël du COS ?",
    hint: "Tu connais la date ?",
    answers: [
      "Le 12 décembre à partir de 14h00",
      "Le 25 décembre à minuit",
      "Lundi de Pâques"
    ],
    correct: 0,
    explanation: "Et oui, le 12 décembre prochain, petits et grands sont invités à partager un moment festif et plein de surprises, à condition de s'y être inscrits bien sûr !"
  },
  {
    type: "L’ORGANISATION MUNICIPALE",
    text: "Je permets de comprendre comment les services de la mairie sont organisés et à qui ils sont rattachés.",
    hint: "Quel outil est décrit ici ?",
    answers: [
      "L’organigramme",
      "Le journal municipal",
      "Le menu de la cantine"
    ],
    correct: 0,
    explanation: "L’organigramme aide à comprendre la structure des services municipaux."
  }
];

// QUESTION BONUS
const bonus = {
  type: "QUESTION BONUS — LE SECRET DE CONFLANS",
  text: "Sous quel surnom notre ville est-elle connue ?",
  hint: "Une dernière énigme pour les enquêteurs les plus attentifs.",
  answers: [
    "La capitale de la batellerie",
    "Le royaume du roi Arthur",
    "Le Confluent"
  ],
  correct: 0,
  explanation: "La capitale de la batellerie ! Fière de ce surnom, notre ville possède un joli musée dédié à l'histoire de notre ville. Si ce n'est pas déjà fait, va vite le visiter !"
};

// =========================================================
// VARIABLES DU QUIZ
// =========================================================

let current = 0;
let score = 0;
let selected = null;
let locked = false;
let answersLog = [];

const $ = id => document.getElementById(id);

const screens = [
  "videoIntro",
  "intro",
  "quiz",
  "result",
  "review",
  "survey"
];

function showScreen(id) {
  screens.forEach(screen => {
    const element = $(screen);
    if (element) {
      element.classList.toggle("hidden", screen !== id);
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================================================
// QUESTIONNAIRE QUESTIONNAIREWEB
// =========================================================

function showSurvey() {
  showScreen("survey");
}

// =========================================================
// VIDÉO D'INTRODUCTION
// =========================================================

function leaveVideoIntro() {
  const video = $("openingVideo");

  if (video && !video.paused) {
    video.pause();
  }

  showScreen("intro");
}

function startOpeningVideo() {
  const video = $("openingVideo");

  if (!video) return;

  video.muted = true;

  const attempt = video.play();

  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(() => {
      const note = document.querySelector(".video-intro-label");

      if (note) {
        note.textContent =
          "CLIQUE SUR LA VIDÉO POUR LANCER L’INTRODUCTION";
      }

      video.controls = true;
    });
  }
}

// =========================================================
// DÉMARRAGE ET AFFICHAGE DU QUIZ
// =========================================================

function begin() {
  current = 0;
  score = 0;
  selected = null;
  locked = false;
  answersLog = [];

  showScreen("quiz");
  renderQuestion();

  startMissionMusic();
}

function renderQuestion() {
  const q = current < questions.length
    ? questions[current]
    : bonus;

  const isBonus = current >= questions.length;

  $("questionCounter").textContent = isBonus
    ? "QUESTION BONUS"
    : `ÉNIGME ${String(current + 1).padStart(2, "0")} / ${String(questions.length).padStart(2, "0")}`;

  $("scoreLabel").textContent =
    `${score} POINT${score > 1 ? "S" : ""}`;

  $("progressBar").style.width =
    `${Math.min(100, current / questions.length * 100)}%`;

  $("questionType").textContent = q.type;
  $("questionText").textContent = q.text;
  $("questionHint").textContent = q.hint;

  $("answers").innerHTML = "";

  $("feedback").className = "feedback hidden";
  $("feedback").textContent = "";

  $("nextBtn").disabled = true;

  $("nextBtn").innerHTML = isBonus
    ? 'Découvrir mon résultat <span>→</span>'
    : 'Valider l’indice <span>→</span>';

  $("answerNote").textContent =
    "Choisis une réponse pour continuer.";

  selected = null;
  locked = false;

  q.answers.forEach((answer, i) => {
    const button = document.createElement("button");

    button.className = "answer-option";
    button.type = "button";

    button.innerHTML =
      `<span class="answer-key">${String.fromCharCode(65 + i)}</span><span></span>`;

    button.querySelector("span:last-child").textContent = answer;

    button.addEventListener("click", () => selectAnswer(i));

    $("answers").appendChild(button);
  });
}

function selectAnswer(i) {
  if (locked) return;

  selected = i;

  [...$("answers").children].forEach((button, n) => {
    button.classList.toggle("selected", n === i);
  });

  $("nextBtn").disabled = false;

  $("answerNote").textContent =
    "Indice sélectionné. Prêt à vérifier ?";
}

// =========================================================
// VALIDATION DES RÉPONSES
// =========================================================

function validateAnswer() {
  if (selected === null || locked) return;

  locked = true;

  const q = current < questions.length
    ? questions[current]
    : bonus;

  const isCorrect = selected === q.correct;

  if (isCorrect) score++;

  answersLog.push({
    question: q.text,
    chosen: q.answers[selected],
    correct: q.answers[q.correct],
    isCorrect,
    explanation: q.explanation
  });

  [...$("answers").children].forEach((button, i) => {
    button.disabled = true;

    if (i === q.correct) {
      button.classList.add("correct");
    } else if (i === selected) {
      button.classList.add("incorrect");
    }
  });

  $("feedback").className =
    `feedback ${isCorrect ? "good" : "bad"}`;

  $("feedback").textContent =
    (isCorrect ? "✦ Bien joué ! " : "✦ Pas tout à fait. ") +
    q.explanation;

  $("nextBtn").innerHTML =
    current === questions.length
      ? 'Voir le résultat <span>→</span>'
      : 'Énigme suivante <span>→</span>';

  $("answerNote").textContent = isCorrect
    ? "Un indice de plus dans ton carnet."
    : "L’enquête continue, ne baisse pas les bras.";

  $("scoreLabel").textContent =
    `${score} POINT${score > 1 ? "S" : ""}`;
}

function nextQuestion() {
  if (!locked) {
    validateAnswer();
    return;
  }

  current++;

  if (current > questions.length) {
    showResult();
    return;
  }

  renderQuestion();
}

// =========================================================
// ÉCRAN DES RÉSULTATS
// =========================================================

function showResult() {
  showScreen("result");

  $("progressBar").style.width = "100%";

  const max = questions.length + 1;

  $("finalScore").textContent = `${score}/${max}`;

  let title = "Le mystère reste entier…";
  let message = "Les archives ont encore quelques secrets.";

  if (score === max) {
    title = "Une enquête sans faute !";
    message =
      "Tous les indices ont été déchiffrés. La mairie n’a plus de secrets pour toi.";
  } else if (score >= Math.ceil(max * 0.7)) {
    title = "Bien joué, enquêteur·rice !";
    message =
      "Tu as retrouvé la plupart des indices cachés dans les coulisses de Conflans.";
  } else if (score >= Math.ceil(max * 0.4)) {
    title = "Une piste prometteuse…";
    message =
      "Quelques mystères résistent encore. Tu peux rejouer pour compléter ton carnet.";
  }

  $("resultTitle").textContent = title;
  $("resultText").textContent = message;

  $("scoreMessage").textContent =
    `${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} sur ${max}`;
}

// =========================================================
// CORRECTION DES RÉPONSES
// =========================================================

function showReview() {
  $("reviewList").innerHTML = "";

  answersLog.forEach((a, i) => {
    const item = document.createElement("article");
    item.className = "review-item";

    const h = document.createElement("h3");
    h.textContent =
      `${String(i + 1).padStart(2, "0")} — ${a.question}`;

    const p1 = document.createElement("p");
    p1.textContent = `Ta réponse : ${a.chosen}`;

    const p2 = document.createElement("p");
    p2.textContent = "Réponse attendue : ";

    const strong = document.createElement("strong");
    strong.textContent = a.correct;

    p2.appendChild(strong);

    const p3 = document.createElement("p");
    p3.textContent = a.explanation;

    item.append(h, p1, p2, p3);

    $("reviewList").appendChild(item);
  });

  showScreen("review");
}

// =========================================================
// MUSIQUE LOCALE
// Place le MP3 dans le même dossier que index.html.
// =========================================================

let missionMusicActive = false;
let missionAudio = null;

function ensureMissionAudio() {
  if (missionAudio) return missionAudio;

  missionAudio = document.getElementById("missionMusic");

  if (!missionAudio) {
    missionAudio = document.createElement("audio");
    missionAudio.id = "missionMusic";
    missionAudio.src = "./Sinister%20-%20Anno%20Domini%20Beats.mp3";
    missionAudio.loop = true;
    missionAudio.preload = "auto";
    missionAudio.setAttribute("aria-hidden", "true");
    missionAudio.style.display = "none";
    document.body.appendChild(missionAudio);
  }

  missionAudio.loop = true;
  missionAudio.preload = "auto";
  missionAudio.volume = 0.5;

  return missionAudio;
}

function prepareMissionMusic() {
  const audio = ensureMissionAudio();
  const attempt = audio.play();

  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(() => {});
  }
}

function startMissionMusic() {
  const audio = ensureMissionAudio();
  missionMusicActive = true;

  const attempt = audio.play();

  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(error => {
      console.warn("Impossible de démarrer la musique :", error);
    });
  }
}

function stopMissionMusic() {
  missionMusicActive = false;
  if (missionAudio) missionAudio.pause();
}

function resumeMissionMusicIfNeeded() {
  if (!missionMusicActive || !missionAudio) return;

  const attempt = missionAudio.play();

  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(() => {});
  }
}

// =========================================================
// INITIALISATION DES BOUTONS ET ÉVÉNEMENTS
// =========================================================

$("startBtn").addEventListener("click", begin);

$("skipVideoBtn").addEventListener("click", leaveVideoIntro);

$("openingVideo").addEventListener("ended", leaveVideoIntro);

window.addEventListener("load", function () {
  startOpeningVideo();
  prepareMissionMusic();
});

// Relance la musique lors de la première interaction si nécessaire.
document.addEventListener("click", function () {
  if (!missionMusicActive) {
    startMissionMusic();
  }
}, { once: true, capture: true });

$("nextBtn").addEventListener("click", nextQuestion);

$("replayBtn").addEventListener("click", begin);

$("reviewBtn").addEventListener("click", showReview);

// Retour du carnet de correction au résultat.
$("backResultBtn").addEventListener("click", () => {
  showScreen("result");
});

// Accès au questionnaire.
$("surveyBtn").addEventListener("click", showSurvey);

// Retour du questionnaire au résultat.
$("backToResultBtn").addEventListener("click", () => {
  showScreen("result");
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    resumeMissionMusicIfNeeded();
  }
});

window.addEventListener("focus", () => {
  resumeMissionMusicIfNeeded();
});
const surveyBtn = document.getElementById("surveyBtn");
const backToResultBtn = document.getElementById("backToResultBtn");

if (surveyBtn) {
  surveyBtn.addEventListener("click", showSurvey);
}

if (backToResultBtn) {
  backToResultBtn.addEventListener("click", () => {
    showScreen("result");
  });
}
