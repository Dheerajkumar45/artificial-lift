// --- GLOBAL STATE ---
let isMetric = false; 
let isAuthenticated = false;
let currentUser = { name: "", email: "", initials: "" };

// --- AUTHENTICATION LOGIC ---
function requireAuth(targetFunction) {
  if (isAuthenticated) {
    targetFunction();
  } else {
    document.getElementById('auth-modal').classList.remove('hidden-view');
  }
}

function authenticateUser() {
  const nameInput = document.getElementById('auth_name').value.trim();
  const emailInput = document.getElementById('auth_email').value.trim().toLowerCase();
  const errorMsg = document.getElementById('auth_error');

  // Basic Validation (Requires @ongc.co.in domain)
  if (nameInput === "" || !emailInput.endsWith('@ongc.co.in')) {
    errorMsg.style.display = 'block';
    return;
  }

  // Set User Data
  errorMsg.style.display = 'none';
  isAuthenticated = true;
  currentUser.name = nameInput;
  currentUser.email = emailInput;
  currentUser.initials = nameInput.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  // Populate UI
  document.getElementById('nav_username').innerText = currentUser.name;
  document.getElementById('nav_avatar').innerText = currentUser.initials;
  document.getElementById('nav_user_badge').style.display = 'flex';
  
  document.getElementById('profile_name').innerText = currentUser.name;
  document.getElementById('profile_email').innerText = currentUser.email;
  document.getElementById('profile_avatar').innerText = currentUser.initials;
  document.getElementById('operator_profile').style.display = 'block';

  // Close Modal & Proceed to Simulator
  document.getElementById('auth-modal').classList.add('hidden-view');
  launchSimulator();
}

// --- PAGE NAVIGATION LOGIC ---
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

// --- ACTION BAR LOGIC ---
function saveConfiguration() {
  const statusSpan = document.getElementById('save-status');
  statusSpan.innerText = `✓ Config Saved for ${currentUser.name}`;
  statusSpan.style.opacity = "1";
  setTimeout(() => { statusSpan.style.opacity = "0"; }, 3000);
}

function exportData() {
  alert(`Generating API 11L Report for ${currentUser.email}...`);
}

// --- APP INITIALIZATION ---
window.onload = function() {
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => { 
    input.addEventListener('input', calculateTrueAPI); 
    input.addEventListener('change', calculateTrueAPI);
  });

  document.getElementById('unit_toggle').addEventListener('click', function() {
    isMetric = !isMetric;
    this.innerText = isMetric ? "⚙️ Switch to Imperial (lbs, in)" : "⚙️ Switch to Metric (kg, m)";
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


// --- INTERACTIVE SYSTEM ARCHITECTURE DATA ---
const componentData = {
  "motor": { icon: "⚙️", title: "Prime Mover & Gearbox", text: "Provides the raw rotational power (electric motor or gas engine). The gear reducer scales the high-speed motor rotation into the high-torque, low-speed rotation required to lift heavy fluid columns." },
  "beam": { icon: "⚖️", title: "Walking Beam & Horsehead", text: "Pivoting on the Samson post, it converts rotational power from the pitman arms into vertical reciprocating motion. The horsehead ensures the polished rod remains perfectly aligned with the wellbore." },
  "wellhead": { icon: "🛢️", title: "Christmas Tree & Stuffing Box", text: "The structural foundation at the surface. The stuffing box contains packing glands that seal around the moving polished rod, preventing high-pressure fluid leaks while allowing the rod to stroke." },
  "rods": { icon: "⛓️", title: "Sucker Rod String", text: "A highly-engineered steel tether that transmits the lifting motion from the surface down to the pump. Tapered designs (using multiple diameters) are used in deep wells to balance tensile stress." },
  "tubing": { icon: "🕳️", title: "Tubing & Casing", text: "Casing lines the drilled hole to prevent collapse. Tubing is the inner conduit through which the produced oil and water are lifted to the surface by the pump's displacement." },
  "pump": { icon: "⬇️", title: "Downhole Pump Assembly", text: "The heart of the artificial lift system. Contains a moving plunger with a traveling valve, and a stationary barrel with a standing valve. It traps and displaces fluid upward on every stroke cycle." }
};

const API_ROD_TABLE = {
  "66": { "1.0625": { Wr: 1.258, Er: 1.164 }, "1.25": { Wr: 1.309, Er: 1.118 }, "1.50": { Wr: 1.393, Er: 1.050 }, "1.75": { Wr: 1.488, Er: 0.983 } },
  "76": { "1.0625": { Wr: 1.761, Er: 0.832 }, "1.25": { Wr: 1.801, Er: 0.817 }, "1.50": { Wr: 1.833, Er: 0.804 }, "1.75": { Wr: 1.931, Er: 0.767 }, "2.00": { Wr: 2.001, Er: 0.741 }, "2.25": { Wr: 2.091, Er: 0.706 } },
  "86": { "1.25": { Wr: 2.164, Er: 0.674 }, "1.50": { Wr: 2.214, Er: 0.659 }, "1.75": { Wr: 2.269, Er: 0.643 }, "2.00": { Wr: 2.348, Er: 0.620 }, "2.25": { Wr: 2.404, Er: 0.603 }, "2.50": { Wr: 2.478, Er: 0.582 } }
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

  // Animation Sync 
  const spm = N > 0 ? N : 1; 
  const animDuration = (60 / spm) + "s";
  if(document.getElementById('anim_beam')) document.getElementById('anim_beam').style.animationDuration = animDuration;
  if(document.getElementById('anim_rod')) document.getElementById('anim_rod').style.animationDuration = animDuration;
  if(document.getElementById('anim_crank')) document.getElementById('anim_crank').style.animationDuration = animDuration;

  let Wr = 0; let Er_raw = 0; let Et_raw = 0;
  if (API_TUBING_TABLE[tubing_od]) Et_raw = API_TUBING_TABLE[tubing_od] * 1e-6;

  if (API_ROD_TABLE[api_string] && API_ROD_TABLE[api_string][D.toString()]) {
    Wr = API_ROD_TABLE[api_string][D.toString()].Wr;
    Er_raw = API_ROD_TABLE[api_string][D.toString()].Er * 1e-6;
  } else {
    Wr = 1.85; Er_raw = 0.800 * 1e-6; 
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

  let out_Fo = Fo;
  let out_Wr = Wr;

  if (isMetric) {
    PD = PD * 0.158987;           
    PPRL = PPRL * 0.453592;       
    PT = PT * 0.011521;           
    MPRL = MPRL * 0.453592;       
    PRHP = PRHP * 0.7457;         
    CBE = CBE * 0.453592;         
    out_Fo = out_Fo * 0.453592;   
    out_Wr = out_Wr * 1.48816;    
    Wrf = Wrf * 0.453592;         
    Sp = Sp * 0.0254;             

    safeUpdate('unit_14', "m³/d");
    safeUpdate('unit_23', "kg");
    safeUpdate('unit_25', "kg-m");
    safeUpdate('unit_24', "kg");
    safeUpdate('unit_26', "kW");
    safeUpdate('unit_27', "kg");
    safeUpdate('unit_5', "kg");
    safeUpdate('unit_Wr', "kg/m");
    safeUpdate('unit_16', "kg");
    safeUpdate('unit_13', "meters");
  } else {
    safeUpdate('unit_14', "bpd");
    safeUpdate('unit_23', "lbs");
    safeUpdate('unit_25', "in-lbs");
    safeUpdate('unit_24', "lbs");
    safeUpdate('unit_26', "HP");
    safeUpdate('unit_27', "lbs");
    safeUpdate('unit_5', "lbs");
    safeUpdate('unit_Wr', "lbs/ft");
    safeUpdate('unit_16', "lbs");
    safeUpdate('unit_13', "inches");
  }

  safeUpdate('out_14', Math.round(PD).toLocaleString());
  safeUpdate('out_23', Math.round(PPRL).toLocaleString());
  safeUpdate('out_25', Math.round(PT).toLocaleString());
  safeUpdate('out_24', Math.round(MPRL).toLocaleString());
  safeUpdate('out_26', PRHP.toFixed(1));
  safeUpdate('out_27', Math.round(CBE).toLocaleString());
  safeUpdate('out_5', Math.round(out_Fo).toLocaleString());
  safeUpdate('out_Wr', out_Wr.toFixed(2));
  safeUpdate('out_16', Math.round(Wrf).toLocaleString());
  safeUpdate('out_Er', (Er_raw * 1e6).toFixed(3));
  
  safeUpdate('out_13', isMetric ? Sp.toFixed(2) : Sp.toFixed(1));
  safeUpdate('out_9', N_No.toFixed(3));
  safeUpdate('out_8', Fo_over_Skr.toFixed(3));
  safeUpdate('out_SpS', SpS.toFixed(3));
  safeUpdate('out_F1', F1.toFixed(3));
  safeUpdate('out_T2', T2.toFixed(3));

  const original_PT = isMetric ? (PT / 0.011521) : PT;
  const original_PPRL = isMetric ? (PPRL / 0.453592) : PPRL;

  const apiTorques = [25, 40, 57, 80, 114, 160, 228, 320, 456, 640, 912, 1280];
  const apiLoads = [53, 76, 89, 119, 143, 173, 213, 256, 305, 365, 427, 470];
  const apiStrokes = [42, 48, 54, 64, 74, 86, 100, 120, 144, 168, 192];

  const recTorque = apiTorques.find(t => t * 1000 >= original_PT) || Math.ceil(original_PT/1000);
  const recLoad = apiLoads.find(l => l * 100 >= original_PPRL) || Math.ceil(original_PPRL/100);
  const recStroke = apiStrokes.find(s => s >= S) || Math.ceil(S);

  const unitSuggestion = `C-${recTorque}D-${recLoad}-${recStroke}`;
  const unitExplanation = `Based on peak loading constraints, the optimal surface unit configuration is a <span class="highlight-text">${unitSuggestion}</span> to safely accommodate the required torque and structural stress without gearbox failure.`;
  
  let rodSequence = "";
  if (api_string === "76") {
    rodSequence = `1. Run Downhole Pump<br>2. Run Sinker Bars<br>3. Run <span class="highlight-text">3/4" Rods</span> (Bottom)<br>4. Run <span class="highlight-text">7/8" Rods</span> (Top)<br>5. Space out Polished Rod`;
  } else if (api_string === "86") {
    rodSequence = `1. Run Downhole Pump<br>2. Run Sinker Bars<br>3. Run <span class="highlight-text">3/4" Rods</span> (Bottom)<br>4. Run <span class="highlight-text">7/8" Rods</span> (Middle)<br>5. Run <span class="highlight-text">1" Rods</span> (Top)`;
  } else if (api_string === "66") {
    rodSequence = `1. Run Downhole Pump<br>2. Run Sinker Bars<br>3. Run <span class="highlight-text">5/8" Rods</span> (Bottom)<br>4. Run <span class="highlight-text">3/4" Rods</span> (Top)`;
  }

  const elUnit = document.getElementById('ai_unit_suggestion');
  const elRod = document.getElementById('ai_rod_sequence');
  if(elUnit) elUnit.innerHTML = unitExplanation;
  if(elRod) elRod.innerHTML = rodSequence;
}const API_TUBING_TABLE = { "1.900": 0.434, "2.375": 0.307, "2.875": 0.226 };

window.onload = function() {
  calculateTrueAPI();
  
  // Math Listeners
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => { 
    input.addEventListener('input', calculateTrueAPI); 
    input.addEventListener('change', calculateTrueAPI);
  });

  // Unit Toggle Listener
  document.getElementById('unit_toggle').addEventListener('click', function() {
    isMetric = !isMetric;
    this.innerText = isMetric ? "⚙️ Switch to Imperial (lbs, in)" : "⚙️ Switch to Metric (kg, m)";
    calculateTrueAPI();
  });

  // --- NEW: Interactive Schematic Listeners ---
  const nodes = document.querySelectorAll('.tree-node');
  nodes.forEach(node => {
    node.addEventListener('click', function() {
      // Remove active class from all
      nodes.forEach(n => n.classList.remove('active'));
      // Add active to clicked
      this.classList.add('active');
      
      // Update Panel Data
      const compKey = this.getAttribute('data-component');
      const data = componentData[compKey];
      
      document.getElementById('detail_icon').innerText = data.icon;
      document.getElementById('detail_title').innerText = data.title;
      document.getElementById('detail_text').innerText = data.text;
    });
  });
};

function calculateTrueAPI() {
  // 1. Fetch Inputs
  const H = parseFloat(document.getElementById('in_H').value) || 0;
  const L = parseFloat(document.getElementById('in_L').value) || 0;
  const N = parseFloat(document.getElementById('in_N').value) || 0;
  const S = parseFloat(document.getElementById('in_S').value) || 0;
  const D = parseFloat(document.getElementById('in_D').value) || 0;
  const G = parseFloat(document.getElementById('in_G').value) || 0;
  
  const tubing_od = document.getElementById('in_tubing').value;
  const api_string = document.getElementById('in_api_string').value;
  const anchored = document.getElementById('in_anchored').value === 'yes';

  // Animation Sync
  const spm = N > 0 ? N : 1; 
  const animDuration = (60 / spm) + "s";
  document.getElementById('anim_beam').style.animationDuration = animDuration;
  document.getElementById('anim_rod').style.animationDuration = animDuration;

  // 2. Query API Database
  let Wr = 0; let Er_raw = 0; let Et_raw = 0;
  if (API_TUBING_TABLE[tubing_od]) Et_raw = API_TUBING_TABLE[tubing_od] * 1e-6;

  if (API_ROD_TABLE[api_string] && API_ROD_TABLE[api_string][D.toString()]) {
    Wr = API_ROD_TABLE[api_string][D.toString()].Wr;
    Er_raw = API_ROD_TABLE[api_string][D.toString()].Er * 1e-6;
  } else {
    Wr = 1.85; Er_raw = 0.800 * 1e-6; 
  }

  // 3. API Non-Dimensional Variables
  const Fo = 0.340 * G * Math.pow(D, 2) * H;
  const kr = Er_raw * L > 0 ? 1 / (Er_raw * L) : 1;
  const Skr = S * kr;
  const Fo_over_Skr = Skr > 0 ? Fo / Skr : 0;
  const N_No = (N * L) / 245000;
  const kt = anchored ? 0 : 1 / (Et_raw * L);
  const one_over_kt = anchored ? 0 : (Et_raw * L);

  // 4. API Chart Curves
  const x = Math.min(Math.max(N_No, 0), 0.5); 
  const y = Math.min(Math.max(Fo_over_Skr, 0), 0.5);
  let SpS = 1.0 - (y * 0.95) + (x * 1.2);
  let F1 = y + (0.8 * x) + 0.1;
  let F2 = (0.7 * x) + 0.15 - (0.2 * y);
  let T2 = (0.85 * y) + (0.5 * x);
  let F3 = (0.75 * y) + (0.1 * x);
  if (SpS < 0.1) SpS = 0.1; if (F2 < 0) F2 = 0;

  // 5. Final Operating Characteristics (Native Imperial)
  let Sp = (SpS * S) - (Fo * one_over_kt);
  let PD = 0.1166 * Sp * N * Math.pow(D, 2);
  let Wrf = Wr * L * (1 - (0.128 * G));

  let PPRL = Wrf + (F1 * Skr);
  let MPRL = Wrf - (F2 * Skr);
  let PT = T2 * Skr * (S / 2);
  let PRHP = F3 * Skr * S * N * 2.53e-6;
  let CBE = 1.06 * (Wrf + (0.5 * Fo));

  let out_Fo = Fo;
  let out_Wr = Wr;

  // 6. UNIT CONVERSION LOGIC
  if (isMetric) {
    PD = PD * 0.158987;           
    PPRL = PPRL * 0.453592;       
    PT = PT * 0.011521;           
    MPRL = MPRL * 0.453592;       
    PRHP = PRHP * 0.7457;         
    CBE = CBE * 0.453592;         
    out_Fo = out_Fo * 0.453592;   
    out_Wr = out_Wr * 1.48816;    
    Wrf = Wrf * 0.453592;         
    Sp = Sp * 0.0254;             

    document.getElementById('unit_14').innerText = "m³/d";
    document.getElementById('unit_23').innerText = "kg";
    document.getElementById('unit_25').innerText = "kg-m";
    document.getElementById('unit_24').innerText = "kg";
    document.getElementById('unit_26').innerText = "kW";
    document.getElementById('unit_27').innerText = "kg";
    document.getElementById('unit_5').innerText = "kg";
    document.getElementById('unit_Wr').innerText = "kg/m";
    document.getElementById('unit_16').innerText = "kg";
    document.getElementById('unit_13').innerText = "meters";
  } else {
    document.getElementById('unit_14').innerText = "bpd";
    document.getElementById('unit_23').innerText = "lbs";
    document.getElementById('unit_25').innerText = "in-lbs";
    document.getElementById('unit_24').innerText = "lbs";
    document.getElementById('unit_26').innerText = "HP";
    document.getElementById('unit_27').innerText = "lbs";
    document.getElementById('unit_5').innerText = "lbs";
    document.getElementById('unit_Wr').innerText = "lbs/ft";
    document.getElementById('unit_16').innerText = "lbs";
    document.getElementById('unit_13').innerText = "inches";
  }

  // --- OUTPUT TO HMI ---
  document.getElementById('out_14').innerText = Math.round(PD).toLocaleString();
  document.getElementById('out_23').innerText = Math.round(PPRL).toLocaleString();
  document.getElementById('out_25').innerText = Math.round(PT).toLocaleString();

  document.getElementById('out_24').innerText = Math.round(MPRL).toLocaleString();
  document.getElementById('out_26').innerText = PRHP.toFixed(1);
  document.getElementById('out_27').innerText = Math.round(CBE).toLocaleString();
  document.getElementById('out_5').innerText = Math.round(out_Fo).toLocaleString();

  document.getElementById('out_Wr').innerText = out_Wr.toFixed(2);
  document.getElementById('out_16').innerText = Math.round(Wrf).toLocaleString();
  document.getElementById('out_Er').innerText = (Er_raw * 1e6).toFixed(3);
  
  document.getElementById('out_13').innerText = isMetric ? Sp.toFixed(2) : Sp.toFixed(1);
  document.getElementById('out_9').innerText = N_No.toFixed(3);
  document.getElementById('out_8').innerText = Fo_over_Skr.toFixed(3);
  document.getElementById('out_SpS').innerText = SpS.toFixed(3);
  document.getElementById('out_F1').innerText = F1.toFixed(3);
  document.getElementById('out_T2').innerText = T2.toFixed(3);

  // 7. AI EXPERT RECOMMENDATION ENGINE
  const original_PT = isMetric ? (PT / 0.011521) : PT;
  const original_PPRL = isMetric ? (PPRL / 0.453592) : PPRL;

  const apiTorques = [25, 40, 57, 80, 114, 160, 228, 320, 456, 640, 912, 1280];
  const apiLoads = [53, 76, 89, 119, 143, 173, 213, 256, 305, 365, 427, 470];
  const apiStrokes = [42, 48, 54, 64, 74, 86, 100, 120, 144, 168, 192];

  const recTorque = apiTorques.find(t => t * 1000 >= original_PT) || Math.ceil(original_PT/1000);
  const recLoad = apiLoads.find(l => l * 100 >= original_PPRL) || Math.ceil(original_PPRL/100);
  const recStroke = apiStrokes.find(s => s >= S) || Math.ceil(S);

  const unitSuggestion = `C-${recTorque}D-${recLoad}-${recStroke}`;
  const unitExplanation = `Based on peak loading constraints, the optimal surface unit configuration is a <span class="highlight-text">${unitSuggestion}</span> to safely accommodate the required torque and structural stress without gearbox failure.`;
  
  let rodSequence = "";
  if (api_string === "76") {
    rodSequence = `1. Run Downhole Pump<br>2. Run Sinker Bars<br>3. Run <span class="highlight-text">3/4" Rods</span> (Bottom)<br>4. Run <span class="highlight-text">7/8" Rods</span> (Top)<br>5. Space out Polished Rod`;
  } else if (api_string === "86") {
    rodSequence = `1. Run Downhole Pump<br>2. Run Sinker Bars<br>3. Run <span class="highlight-text">3/4" Rods</span> (Bottom)<br>4. Run <span class="highlight-text">7/8" Rods</span> (Middle)<br>5. Run <span class="highlight-text">1" Rods</span> (Top)`;
  } else if (api_string === "66") {
    rodSequence = `1. Run Downhole Pump<br>2. Run Sinker Bars<br>3. Run <span class="highlight-text">5/8" Rods</span> (Bottom)<br>4. Run <span class="highlight-text">3/4" Rods</span> (Top)`;
  }

  document.getElementById('ai_unit_suggestion').innerHTML = unitExplanation;
  document.getElementById('ai_rod_sequence').innerHTML = rodSequence;
}
