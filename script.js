/* =========================================================
   QUIZ : LES COULISSES DE LA MAIRIE DE CONFLANS
   Questions, score, résultats et musique locale
========================================================= */

// PERSONNALISE LES QUESTIONS ET LES RÉPONSES
const questions = [
  {
    type: "LES COULISSES DE LA MAIRIE",
    text: "Avec moi, les coulisses de la mairie et le quotidien des agents n'ont plus de scret pour toi ! Je te raconte les dernières nouvelles, les événements passés ou à venir et te partage de jolis portraits des collègues.",
    hint: "Qui suis-je ?",
    answers: ["Le TAC", "Le menu de la cantine", "Le VAC"],
    correct: 0,
    explanation: "Le TAC, est ton journal interne, incontournable et riche en informations pour te tenir informé des dernières actualités !"
  },
  {
    type: "QUI FAIS QUOI ?",
    text: "Quand tu cherches à joindre un collègue ou à connaître ses fonctions, je suis ta carte aux trésors",
    hint: "Quel onglet tu peux consulter dans C.conflans pour retrouver ces informations ?",
    answers: ["Le calendrier des fêtes", "L’annuaire", "Le plan des rues"],
    correct: 1,
    explanation: "L’annuaire te permettra de retrouver rapidement, juste en tapant son nom, un collègue et sa fonction au sein de la mairie !"
  },
  {
    type: "UN NOUVEL AGENT TRÈS SPÉCIAL ?",
    text: "J’ai quatre pattes, deux grandes oreilles et je viens de rejoindre la mairie.",
    hint: "Qui suis-je ?",
    answers: ["Matricule 300, chiot à la Police municipale", "Moka, le lapin mascotte de la crèche Arlequin", "Gloria, la chèvre qui écopature au Parc du Prieuré"],
    correct: 0,
    explanation: "Cet adorable malinois vient de rejoindre nos équipes ! Si tu veux en savoir plus, vas voir l'article qui lui a été consacré cette semaine !"
  },
  {
    type: "NOËL APPROCHE",
    text: "Quand auras lieu l'arbre de Noël du COS ? ».",
    hint: "Connaissez-vous la date ?",
    answers: ["Le 12 décembre à partir de 14h00", "le 25 décembre à minuit", "lundi de Pâques"],
    correct: 0,
    explanation: "Et oui, le 12 décembre prochain, petits et grands sont invités à partagés un moment festif et plein de surprises, à condition de s'y être incrit bien sûr  »."
  },
  {
    type: "L’ORGANISATION MUNICIPALE",
    text: "Je permets de comprendre comment les services de la mairie sont organisés et à qui ils sont rattachés.",
    hint: "Quel outil est décrit ici ?",
    answers: ["L’organigramme", "Le journal municipal", "Le menu de la cantine"],
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
  explanation: "Pense à remplacer les propositions par les surnoms que tu souhaites faire deviner."
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
  "review"
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

  // La musique est demandée après le clic de l'utilisateur.
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
// INTÉGRATION MUSICALE — FICHIER MP3 LOCAL INVISIBLE
// Place « Sinister - Anno Domini Beats.mp3 » dans le même dossier
// que index.html et script.js.
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

// Prépare la musique dès l'ouverture et tente de la lancer.
// Certains navigateurs bloquent la lecture automatique avec le son.
function prepareMissionMusic() {
  const audio = ensureMissionAudio();
  const attempt = audio.play();

  if (attempt && typeof attempt.catch === "function") {
    attempt.catch(() => {
      // Le son sera relancé lors de la première interaction de l'utilisateur.
    });
  }
}

// Appelée depuis un clic : les navigateurs autorisent plus souvent
// la lecture audio lorsqu'elle répond directement à une interaction.
function startMissionMusic() {
  const audio = ensureMissionAudio();
  missionMusicActive = true;

  const attempt = audio.play();
  if (attempt && typeof attempt.catch === "function") {
    attempt.catch((error) => {
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

  // Prépare le fichier MP3 et tente la lecture dès l'ouverture du site.
  prepareMissionMusic();
});

// Si l'autoplay sonore est bloqué, la première interaction du visiteur
// réessaie de lancer la musique.
document.addEventListener("click", function () {
  if (!missionMusicActive) {
    startMissionMusic();
  }
}, { once: true, capture: true });

$("nextBtn").addEventListener("click", nextQuestion);

$("replayBtn").addEventListener("click", begin);

$("reviewBtn").addEventListener("click", showReview);

$("backResultBtn").addEventListener("click", () => {
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
