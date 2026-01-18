<script src="badge-manager.js">
 /* badge-manager.js — URGENCES
   Enregistre le badge à la fin du scénario, sans toucher au code interne.
*/

(function(){
  // ---------- helpers ----------
  function getDiffLabel(){
    const raw =
      (typeof window.niveau !== "undefined" && window.niveau) ? String(window.niveau) :
      (localStorage.getItem("niveau") || localStorage.getItem("difficulty") || "débutant");
    const d = String(raw).toLowerCase();
    if(d.includes("expert")) return "EXPERT";
    if(d.includes("inter"))  return "INTERMÉDIAIRE";
    return "DÉBUTANT";
  }

  function computeBadge(scoreFinal){
    if(scoreFinal >= 90) return { badgeLevel:"OR",     badgeImage:"assets/or.png" };
    if(scoreFinal >= 70) return { badgeLevel:"ARGENT", badgeImage:"assets/argent.png" };
    return { badgeLevel:"BRONZE", badgeImage:"assets/bronze.png" };
  }

  function safeGetScore(){
    const s = parseInt(localStorage.getItem("score") || "0", 10);
    return isNaN(s) ? 0 : s;
  }

  function saveBadgeFromGlobals(){
    // SCENARIO doit exister dans tes quiz (tu l’as déjà)
    if(typeof window.SCENARIO === "undefined" || !window.SCENARIO) return;

    const diffLabel = getDiffLabel();
    const score = safeGetScore();

    const b = computeBadge(score);

    const badgeData = {
      scenarioId: window.SCENARIO.id,
      scenarioLabel: window.SCENARIO.label,
      mission: window.SCENARIO.mission,
      difficulty: diffLabel,
      badgeLevel: b.badgeLevel,
      badgeImage: b.badgeImage,
      score: score,
      date: Date.now()
    };

    const badgeKey = `badge_s${window.SCENARIO.id}_${diffLabel}`;
    localStorage.setItem(badgeKey, JSON.stringify(badgeData));
    localStorage.setItem("last_badge_key", badgeKey);

    // (optionnel) historique global
    const histKey = "badges_history";
    const arr = JSON.parse(localStorage.getItem(histKey) || "[]");
    arr.push(badgeData);
    localStorage.setItem(histKey, JSON.stringify(arr));
  }

  // ---------- branchement automatique ----------
  // 1) Si endScenario() existe, on le "wrap" : on exécute ton endScenario puis on sauvegarde.
  if(typeof window.endScenario === "function"){
    const original = window.endScenario;
    window.endScenario = function(){
      // on appelle ton code d'origine
      const r = original.apply(this, arguments);
      // puis on enregistre le badge
      try { saveBadgeFromGlobals(); } catch(e) {}
      return r;
    };
    return;
  }

  // 2) fallback : si endScenario n’est pas global (rare), on écoute un signal via localStorage.
  // Si tu veux, on peut aussi déclencher un customEvent dans ton code plus tard.
})();
 
  
  
</script>
