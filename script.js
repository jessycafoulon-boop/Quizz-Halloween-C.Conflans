// Personnalise les textes et les réponses dans ce tableau.
const questions = [
  {
    type: "LES PUBLICATIONS DE LA VILLE",
    text: "Je raconte la vie de la mairie. On y retrouve les dernières nouvelles, des événements et des portraits.",
    hint: "Quel support faut-il consulter pour découvrir toute cette actualité ?",
    answers: ["Le journal municipal", "Le menu de la cantine", "Le TAC"],
    correct: 0,
    explanation: "Le journal municipal rassemble les actualités, les événements et les portraits de la ville."
  },
  {
    type: "LES COULISSES DE LA MAIRIE",
    text: "Quand tu cherches à comprendre qui dirige quel service, je suis la carte aux trésors des agents.",
    hint: "Quel document permet de visualiser l’organisation des services ?",
    answers: ["Le calendrier des fêtes", "L’organigramme", "Le plan des rues"],
    correct: 1,
    explanation: "L’organigramme présente les services et les liens hiérarchiques au sein de la mairie."
  },
  {
    type: "UN NOUVEL HABITANT ?",
    text: "J’ai quatre pattes, deux grandes oreilles et je viens de rejoindre la mairie.",
    hint: "Qui suis-je ? Remplace les propositions ci-dessous par le nom de la mascotte si nécessaire.",
    answers: ["La mascotte de la mairie", "Le fantôme des archives", "Le chat du voisin"],
    correct: 0,
    explanation: "Cette question vise la mascotte animale de la mairie. Pense à préciser son nom dans les réponses si tu le souhaites."
  },
  {
    type: "UN SIGLE À DÉCHIFFRER",
    text: "À Conflans, trois lettres résument une démarche : « Travailler À Conflans ».",
    hint: "Quel sigle correspond à cette expression ?",
    answers: ["TAC", "RER", "DGS"],
    correct: 0,
    explanation: "TAC signifie « Travailler À Conflans »."
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

// BONUS : modifie la question et la réponse lorsque le surnom officiel de la ville est confirmé.
const bonus = {
  type: "QUESTION BONUS — LE SECRET DE CONFLANS",
  text: "Sous quel surnom notre ville est-elle connue ?",
  hint: "Une dernière énigme pour les enquêteurs les plus attentifs.",
  answers: ["Réponse à personnaliser", "Autre proposition", "Autre proposition"],
  correct: 0,
  explanation: "Pense à remplacer les propositions par les surnoms que tu souhaites faire deviner."
};

let current = 0, score = 0, selected = null, locked = false, answersLog = [];
const $ = id => document.getElementById(id);
const screens = ["videoIntro","intro","quiz","result","review"];
function showScreen(id){ screens.forEach(s => $(s).classList.toggle("hidden", s !== id)); window.scrollTo({top:0,behavior:"smooth"}); }
function leaveVideoIntro(){
  const video=$("openingVideo");
  if(video && !video.paused) video.pause();
  showScreen("intro");
}
function startOpeningVideo(){
  const video=$("openingVideo");
  if(!video) return;
  // L'autoplay est autorisé plus largement avec le son coupé.
  video.muted=true;
  const attempt=video.play();
  if(attempt && typeof attempt.catch==="function"){
    attempt.catch(()=> {
      // Certains navigateurs bloquent l'autoplay : la vidéo reste visible et peut être lancée au clic.
      const note=document.querySelector(".video-intro-label");
      if(note) note.textContent="CLIQUE SUR LA VIDÉO POUR LANCER L’INTRODUCTION";
      video.controls=true;
    });
  }
}
function begin(){ current=0;score=0;selected=null;locked=false;answersLog=[];showScreen("quiz");renderQuestion(); }
function renderQuestion(){
  const q = current < questions.length ? questions[current] : bonus;
  const isBonus = current >= questions.length;
  $("questionCounter").textContent = isBonus ? "QUESTION BONUS" : `ÉNIGME ${String(current+1).padStart(2,"0")} / ${String(questions.length).padStart(2,"0")}`;
  $("scoreLabel").textContent = `${score} POINT${score>1?"S":""}`;
  $("progressBar").style.width = `${Math.min(100, current/questions.length*100)}%`;
  $("questionType").textContent=q.type;
  $("questionText").textContent=q.text;
  $("questionHint").textContent=q.hint;
  $("answers").innerHTML="";
  $("feedback").className="feedback hidden";$("feedback").textContent="";
  $("nextBtn").disabled=true;$("nextBtn").innerHTML=isBonus?'Découvrir mon résultat <span>→</span>':'Valider l’indice <span>→</span>';
  $("answerNote").textContent="Choisis une réponse pour continuer.";
  selected=null;locked=false;
  q.answers.forEach((answer,i)=>{
    const button=document.createElement("button");
    button.className="answer-option";button.type="button";
    button.innerHTML=`<span class="answer-key">${String.fromCharCode(65+i)}</span><span></span>`;
    button.querySelector("span:last-child").textContent=answer;
    button.addEventListener("click",()=>selectAnswer(i));
    $("answers").appendChild(button);
  });
}
function selectAnswer(i){
  if(locked)return;selected=i;
  [...$("answers").children].forEach((b,n)=>b.classList.toggle("selected",n===i));
  $("nextBtn").disabled=false;
  $("answerNote").textContent="Indice sélectionné. Prêt à vérifier ?";
}
function validateAnswer(){
  if(selected===null||locked)return;
  locked=true;
  const q=current<questions.length?questions[current]:bonus;
  const isCorrect=selected===q.correct;
  if(isCorrect)score++;
  answersLog.push({question:q.text, chosen:q.answers[selected], correct:q.answers[q.correct], isCorrect, explanation:q.explanation});
  [...$("answers").children].forEach((b,i)=>{
    b.disabled=true;
    if(i===q.correct)b.classList.add("correct");
    else if(i===selected)b.classList.add("incorrect");
  });
  $("feedback").className=`feedback ${isCorrect?"good":"bad"}`;
  $("feedback").textContent=(isCorrect?"✦ Bien joué ! ":"✦ Pas tout à fait. ")+q.explanation;
  $("nextBtn").innerHTML=current===questions.length?'Voir le résultat <span>→</span>':'Énigme suivante <span>→</span>';
  $("answerNote").textContent=isCorrect?"Un indice de plus dans ton carnet.":"L’enquête continue, ne baisse pas les bras.";
  $("scoreLabel").textContent=`${score} POINT${score>1?"S":""}`;
}
function nextQuestion(){
  if(!locked){validateAnswer();return;}
  current++;
  if(current>questions.length){showResult();return;}
  renderQuestion();
}
function showResult(){
  showScreen("result");$("progressBar").style.width="100%";
  $("finalScore").textContent=`${score}/${questions.length+1}`;
  const max=questions.length+1;
  let title="Le mystère reste entier…",message="Les archives ont encore quelques secrets.";
  if(score===max){title="Une enquête sans faute !";message="Tous les indices ont été déchiffrés. La mairie n’a plus de secrets pour toi.";}
  else if(score>=Math.ceil(max*.7)){title="Bien joué, enquêteur·rice !";message="Tu as retrouvé la plupart des indices cachés dans les coulisses de Conflans.";}
  else if(score>=Math.ceil(max*.4)){title="Une piste prometteuse…";message="Quelques mystères résistent encore. Tu peux rejouer pour compléter ton carnet.";}
  $("resultTitle").textContent=title;$("resultText").textContent=message;$("scoreMessage").textContent=`${score} bonne${score>1?"s":""} réponse${score>1?"s":""} sur ${max}`;
}
function showReview(){
  $("reviewList").innerHTML="";
  answersLog.forEach((a,i)=>{
    const item=document.createElement("article");item.className="review-item";
    const h=document.createElement("h3");h.textContent=`${String(i+1).padStart(2,"0")} — ${a.question}`;
    const p1=document.createElement("p");p1.textContent=`Ta réponse : ${a.chosen}`;
    const p2=document.createElement("p");p2.innerHTML="Réponse attendue : ";const strong=document.createElement("strong");strong.textContent=a.correct;p2.appendChild(strong);
    const p3=document.createElement("p");p3.textContent=a.explanation;
    item.append(h,p1,p2,p3);$("reviewList").appendChild(item);
  });
  showScreen("review");
}
$("startBtn").addEventListener("click",begin);
$("skipVideoBtn").addEventListener("click",leaveVideoIntro);
$("openingVideo").addEventListener("ended",leaveVideoIntro);
// Le clip s'affiche en premier. Si l'autoplay est bloqué, les contrôles permettent de le lancer.
window.addEventListener("load",startOpeningVideo);
$("nextBtn").addEventListener("click",nextQuestion);
$("replayBtn").addEventListener("click",begin);
$("reviewBtn").addEventListener("click",showReview);
$("backResultBtn").addEventListener("click",()=>showScreen("result"));
