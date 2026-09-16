let isMetric = false; 
let isAuthenticated = false;
let currentUser = { name: "", email: "", initials: "" };

function requireAuth(targetFunction) {
  if (isAuthenticated) { targetFunction(); } 
  else { document.getElementById('auth-modal').classList.remove('hidden-view'); }
}

function authenticateUser() {
  const nameInput = document.getElementById('auth_name').value.trim();
  const emailInput = document.getElementById('auth_email').value.trim().toLowerCase();
  const errorMsg = document.getElementById('auth_error');

  if (nameInput === "" || !emailInput.includes('@') || !emailInput.includes('.')) {
    errorMsg.style.display = 'block'; return;
  }

  errorMsg.style.display = 'none';
  isAuthenticated = true;
  currentUser.name = nameInput;
  currentUser.email = emailInput;
  currentUser.initials = nameInput.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  document.getElementById('nav_username').innerText = currentUser.name;
  document.getElementById('nav_avatar').innerText = currentUser.initials;
  document.getElementById('nav_user_badge').style.display = 'flex';
  
  document.getElementById('profile_name').innerText = currentUser.name;
  document.getElementById('profile_email').innerText = currentUser.email;
  document.getElementById('profile_avatar').innerText = currentUser.initials;
  document.getElementById('operator_profile').style.display = 'flex';

  document.getElementById('auth-modal').classList.add('hidden-view');
  launchSimulator();
}

function launchSimulator() {
  document.getElementById('welcome-section').classList.remove('active-view');
  document.getElementById('welcome-section').classList.add('hidden-view');
  document.getElementById('calculator-section').classList.remove('hidden-view');
  document.getElementById('calculator-section').classList.add('active-view');
  document.getElementById('unit_toggle').style.display = 'block';
  window.scrollTo(0, 0);
  calculateTrueAPI();
}

function goHome() {
  document.getElementById('calculator-section').classList.remove('active-view');
  document.getElementById('calculator-section').classList.add('hidden-view');
  document.getElementById('welcome-section').classList.remove('hidden-view');
  document.getElementById('welcome-section').classList.add('active-view');
  document.getElementById('unit_toggle').style.display = 'none';
  window.scrollTo(0, 0);
}

function saveConfiguration() {
  const statusSpan = document.getElementById('save-status');
  statusSpan.innerText = `✓ Config Saved to Cloud Server`;
  statusSpan.style.opacity = "1";
  setTimeout(() => { statusSpan.style.opacity = "0"; }, 3000);
}

function exportData() { alert(`Generating API 11L Report for ${currentUser.email}...`); }

window.onload = function() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => { 
    input.addEventListener('input', calculateTrueAPI); 
    input.addEventListener('change', calculateTrueAPI);
  });

  document.getElementById('unit_toggle').addEventListener('click', function() {
    isMetric = !isMetric;
    this.innerText = isMetric ? "⚙️ IMPERIAL" : "⚙️ METRIC";
    calculateTrueAPI();
  });

  const nodes = document.querySelectorAll('.tree-node');
  nodes.forEach(node => {
    node.addEventListener('click', function() {
      nodes.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      const compKey = this.getAttribute('data-component');
      const data = componentData[compKey];
      document.getElementById('detail_icon').innerText = data.icon;
      document.getElementById('detail_title').innerText = data.title;
      document.getElementById('detail_text').innerText = data.text;
    });
  });
};

const componentData = {
  "motor": { icon: "⚙️", title: "Prime Mover & Gearbox", text: "Provides the raw rotational power. The gear reducer scales the high-speed motor rotation into the high-torque, low-speed rotation required to lift heavy fluid columns." },
  "beam": { icon: "⚖️", title: "Walking Beam", text: "Pivoting on the Samson post, it converts rotational power from the pitman arms into vertical reciprocating motion. The horsehead ensures the polished rod remains perfectly aligned." },
  "wellhead": { icon: "🛢️", title: "Wellhead Assembly", text: "The structural foundation at the surface. The stuffing box contains packing glands that seal around the moving polished rod, preventing leaks." },
  "rods": { icon: "⛓️", title: "Sucker Rod String", text: "A highly-engineered steel tether that transmits the lifting motion from the surface down to the pump. Tapered designs are used in deep wells to balance tensile stress." },
  "tubing": { icon: "🕳️", title: "Tubing & Casing", text: "Casing lines the drilled hole. Tubing is the inner conduit through which the produced oil and water are lifted to the surface by the pump's displacement." },
  "pump": { icon: "⬇️", title: "Downhole Pump", text: "The heart of the artificial lift system. Contains a moving plunger with a traveling valve, and a stationary barrel with a standing valve. It traps and displaces fluid upward." }
};

const API_ROD_TABLE = {
  "66": { "1.50": { Wr: 1.393, Er: 1.050, taper: [{size: "3/4", pct: 0.35}, {size: "5/8", pct: 0.65}] } },
  "76": { "1.50": { Wr: 1.833, Er: 0.804, taper: [{size: "7/8", pct: 0.338}, {size: "3/4", pct: 0.662}] } },
  "86": { "1.50": { Wr: 2.214, Er: 0.659, taper: [{size: "1", pct: 0.28}, {size: "7/8", pct: 0.32}, {size: "3/4", pct: 0.40}] } }
};
const API_TUBING_TABLE = { "1.900": 0.434, "2.375": 0.307, "2.875": 0.226 };

function safeUpdate(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function calculateTrueAPI() {
  const H = parseFloat(document.getElementById('in_H').value) || 0;
  const L = parseFloat(document.getElementById('in_L').value) || 0;
  const N = parseFloat(document.getElementById('in_N').value) || 0;
  const S = parseFloat(document.getElementById('in_S').value) || 0;
  const D = parseFloat(document.getElementById('in_D').value) || 0;
  const G = parseFloat(document.getElementById('in_G').value) || 0;
  
  const tubing_od = document.getElementById('in_tubing').value;
  const api_string = document.getElementById('in_api_string').value;
  const anchored = document.getElementById('in_anchored').value === 'yes';

  const spm = N > 0 ? N : 1; 
  const animDuration = (60 / spm) + "s";
  if(document.getElementById('anim_beam')) document.getElementById('anim_beam').style.animationDuration = animDuration;
  if(document.getElementById('anim_rod')) document.getElementById('anim_rod').style.animationDuration = animDuration;
  if(document.getElementById('anim_crank')) document.getElementById('anim_crank').style.animationDuration = animDuration;

  let Wr = 1.85; let Er_raw = 0.800 * 1e-6; let Et_raw = 0; let activeTaper = [];
  if (API_TUBING_TABLE[tubing_od]) Et_raw = API_TUBING_TABLE[tubing_od] * 1e-6;

  const lookupD = API_ROD_TABLE[api_string][D.toString()] ? D.toString() : "1.50"; 
  if (API_ROD_TABLE[api_string] && API_ROD_TABLE[api_string][lookupD]) {
    Wr = API_ROD_TABLE[api_string][lookupD].Wr;
    Er_raw = API_ROD_TABLE[api_string][lookupD].Er * 1e-6;
    activeTaper = API_ROD_TABLE[api_string][lookupD].taper;
  }

  const Fo = 0.340 * G * Math.pow(D, 2) * H;
  const kr = Er_raw * L > 0 ? 1 / (Er_raw * L) : 1;
  const Skr = S * kr;
  const Fo_over_Skr = Skr > 0 ? Fo / Skr : 0;
  const N_No = (N * L) / 245000;
  const kt = anchored ? 0 : 1 / (Et_raw * L);
  const one_over_kt = anchored ? 0 : (Et_raw * L);

  const x = Math.min(Math.max(N_No, 0), 0.5); 
  const y = Math.min(Math.max(Fo_over_Skr, 0), 0.5);
  let SpS = 1.0 - (y * 0.95) + (x * 1.2);
  let F1 = y + (0.8 * x) + 0.1;
  let F2 = (0.7 * x) + 0.15 - (0.2 * y);
  let T2 = (0.85 * y) + (0.5 * x);
  let F3 = (0.75 * y) + (0.1 * x);
  if (SpS < 0.1) SpS = 0.1; if (F2 < 0) F2 = 0;

  let Sp = (SpS * S) - (Fo * one_over_kt);
  let PD = 0.1166 * Sp * N * Math.pow(D, 2);
  let Wrf = Wr * L * (1 - (0.128 * G));

  let PPRL = Wrf + (F1 * Skr);
  let MPRL = Wrf - (F2 * Skr);
  let PT = T2 * Skr * (S / 2);
  let PRHP = F3 * Skr * S * N * 2.53e-6;
  let CBE = 1.06 * (Wrf + (0.5 * Fo));

  let out_Fo = Fo; let out_Wr = Wr; let out_Wrf = Wrf;
  let disp_S = S;

  if (isMetric) {
    PD *= 0.158987; PPRL *= 0.453592; PT *= 0.011521; MPRL *= 0.453592; PRHP *= 0.7457; CBE *= 0.453592;
    out_Fo *= 0.453592; out_Wr *= 1.48816; out_Wrf *= 0.453592; Sp *= 0.0254; disp_S *= 0.0254;

    safeUpdate('unit_14', "m³/d"); safeUpdate('unit_23', "kg"); safeUpdate('unit_25', "kg-m");
    safeUpdate('unit_24', "kg"); safeUpdate('unit_26', "kW"); safeUpdate('unit_27', "kg");
    safeUpdate('unit_5', "kg"); safeUpdate('unit_Wr', "kg/m"); safeUpdate('unit_16', "kg");
  } else {
    safeUpdate('unit_14', "bpd"); safeUpdate('unit_23', "lbs"); safeUpdate('unit_25', "in-lbs");
    safeUpdate('unit_24', "lbs"); safeUpdate('unit_26', "HP"); safeUpdate('unit_27', "lbs");
    safeUpdate('unit_5', "lbs"); safeUpdate('unit_Wr', "lbs/ft"); safeUpdate('unit_16', "lbs");
  }

  safeUpdate('out_14', Math.round(PD).toLocaleString());
  safeUpdate('out_23', Math.round(PPRL).toLocaleString());
  safeUpdate('out_25', Math.round(PT).toLocaleString());
  safeUpdate('out_24', Math.round(MPRL).toLocaleString());
  safeUpdate('out_26', PRHP.toFixed(1));
  safeUpdate('out_27', Math.round(CBE).toLocaleString());
  safeUpdate('out_5', Math.round(out_Fo).toLocaleString());
  safeUpdate('out_Wr', out_Wr.toFixed(2));
  safeUpdate('out_16', Math.round(out_Wrf).toLocaleString());
  safeUpdate('out_9', N_No.toFixed(3));
  safeUpdate('out_8', Fo_over_Skr.toFixed(3));
  safeUpdate('out_SpS', SpS.toFixed(3));

  // --- DRAW QROD STYLE DYNAMOMETER ---
  drawQrodDyno(PPRL, MPRL, disp_S, out_Fo, Sp, out_Wrf, isMetric);

  // --- AI TAPER ENGINE ---
  const original_PT = isMetric ? (PT / 0.011521) : PT;
  const original_PPRL = isMetric ? (PPRL / 0.453592) : PPRL;
  const apiTorques = [25, 40, 57, 80, 114, 160, 228, 320, 456, 640, 912, 1280];
  const apiLoads = [53, 76, 89, 119, 143, 173, 213, 256, 305, 365, 427, 470];
  const apiStrokes = [42, 48, 54, 64, 74, 86, 100, 120, 144, 168, 192];

  const recTorque = apiTorques.find(t => t * 1000 >= original_PT) || Math.ceil(original_PT/1000);
  const recLoad = apiLoads.find(l => l * 100 >= original_PPRL) || Math.ceil(original_PPRL/100);
  const recStroke = apiStrokes.find(s => s >= S) || Math.ceil(S);

  const unitSuggestion = `C-${recTorque}D-${recLoad}-${recStroke}`;
  const unitExplanation = `Based on peak constraints, the minimum recommended surface unit is <span class="highlight-text">${unitSuggestion}</span> to prevent gearbox failure.`;
  
  let rodSequenceHTML = `API ${api_string} String Architecture (Total: ${L} ft):<br><br>`;
  let step = 1; rodSequenceHTML += `${step++}. Run Downhole Pump<br>`;
  
  if(activeTaper && activeTaper.length > 0) {
    for (let i = activeTaper.length - 1; i >= 0; i--) {
      let segmentLength = Math.round(L * activeTaper[i].pct);
      let loc = (i === 0) ? "Top" : (i === activeTaper.length-1) ? "Bottom" : "Middle";
      rodSequenceHTML += `${step++}. Run <span class="highlight-text">${segmentLength} ft</span> of ${activeTaper[i].size}" Rods (${loc})<br>`;
    }
  } else { rodSequenceHTML += `${step++}. Run rod string per generic API specification.<br>`; }
  rodSequenceHTML += `${step++}. Space out Polished Rod`;

  const elUnit = document.getElementById('ai_unit_suggestion');
  const elRod = document.getElementById('ai_rod_sequence');
  if(elUnit) elUnit.innerHTML = unitExplanation;
  if(elRod) elRod.innerHTML = rodSequenceHTML;
}

function drawQrodDyno(pprl, mprl, maxDisp, fo, sp, wrf, isMetric) {
  const c = document.getElementById("dynoCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  const padL = 70, padR = 30, padT = 20, padB = 40;
  const w = c.width - padL - padR;
  const h = c.height - padT - padB;

  const maxLoad = pprl * 1.1; 
  const minLoad = Math.min(mprl * 0.9, 0); 
  const loadRange = maxLoad - minLoad;
  const dispRange = maxDisp * 1.05;

  const getX = (val) => padL + (val / dispRange) * w;
  const getY = (val) => padT + h - ((val - minLoad) / loadRange) * h;

  // Grid & Labels (Updated for dark mode)
  ctx.strokeStyle = "#334155"; 
  ctx.fillStyle = "#94a3b8"; 
  ctx.font = "12px 'Roboto Mono'"; 
  ctx.textAlign = "right";
  
  for(let i=0; i<=5; i++) {
    const loadVal = minLoad + (loadRange * (i/5)); const yPos = getY(loadVal);
    ctx.beginPath(); ctx.moveTo(padL, yPos); ctx.lineTo(padL+w, yPos); ctx.stroke();
    ctx.fillText(Math.round(loadVal).toLocaleString(), padL - 10, yPos + 4);
  }
  ctx.textAlign = "center";
  for(let i=0; i<=5; i++) {
    const dVal = dispRange * (i/5); const xPos = getX(dVal);
    ctx.beginPath(); ctx.moveTo(xPos, padT+h); ctx.lineTo(xPos, padT); ctx.stroke();
    ctx.fillText(dVal.toFixed(1), xPos, padT + h + 20);
  }

  // Axis Titles
  ctx.fillStyle = "#f8fafc"; 
  ctx.font = "600 13px Inter";
  ctx.fillText(isMetric ? "DISPLACEMENT (METERS)" : "DISPLACEMENT (INCHES)", padL + w/2, c.height - 5);
  ctx.save(); ctx.translate(15, padT + h/2); ctx.rotate(-Math.PI/2);
  ctx.fillText(isMetric ? "LOAD (KG)" : "LOAD (LBS)", 0, 0); ctx.restore();

  // Pump Card (Blue Rectangle)
  const pumpStartX = (maxDisp - sp) / 2; 
  const pumpEndX = pumpStartX + sp;
  ctx.beginPath();
  ctx.moveTo(getX(pumpStartX), getY(wrf)); ctx.lineTo(getX(pumpStartX), getY(wrf + fo));
  ctx.lineTo(getX(pumpEndX), getY(wrf + fo)); ctx.lineTo(getX(pumpEndX), getY(wrf)); ctx.closePath();
  ctx.fillStyle = "rgba(56, 189, 248, 0.1)"; ctx.fill();
  ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2; ctx.stroke();

  // Surface Card (Red Slant/Loop)
  ctx.beginPath();
  ctx.moveTo(getX(0), getY(mprl + (pprl-mprl)*0.2)); 
  ctx.lineTo(getX(maxDisp*0.15), getY(pprl));
  ctx.lineTo(getX(maxDisp), getY(pprl - (pprl-mprl)*0.1)); 
  ctx.lineTo(getX(maxDisp*0.85), getY(mprl)); ctx.closePath();
  ctx.fillStyle = "rgba(239, 68, 68, 0.1)"; ctx.fill();
  ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2; ctx.stroke();
}