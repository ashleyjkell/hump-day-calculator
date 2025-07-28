// Full app.js content with tab switching, unit toggles, Lift and RPE calculator logic, PWA install, service worker
// (Same code as from the earlier assistant message where JS was output)

// ----------------------------
// Tab Switching
// ----------------------------
const tabs = document.querySelectorAll('.tabs button');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

// ----------------------------
// Unit Conversion
// ----------------------------
const KG_TO_LBS = 2.20462;

// Lift calculator inputs
const unitSelect = document.getElementById('unitSelect');
const weightInput = document.getElementById('weight');
const bodyFatInput = document.getElementById('bodyFat');
const percentToLiftInput = document.getElementById('percentToLift');
const dumbbellCheckbox = document.getElementById('dumbbellMode');
const lbmDisplay = document.getElementById('lbmDisplay');
const liftWeightDisplay = document.getElementById('liftWeightDisplay');

// RPE calculator inputs
const rpeUnitSelect = document.getElementById('rpeUnitSelect');
const rpeWeightInput = document.getElementById('rpeWeight');
const rpeValueInput = document.getElementById('rpeValue');
const repsInput = document.getElementById('reps');
const rpe1RMDisplay = document.getElementById('rpe1RMDisplay');

function convert(value, toUnit) {
  return toUnit === 'lbs' ? value * KG_TO_LBS : value / KG_TO_LBS;
}

function convertField(field, oldUnit, newUnit) {
  const val = parseFloat(field.value);
  if (!isNaN(val)) {
    field.value = convert(val, newUnit).toFixed(1);
  }
}

unitSelect.addEventListener('change', () => {
  const newUnit = unitSelect.value;
  const oldUnit = newUnit === 'kg' ? 'lbs' : 'kg';
  convertField(weightInput, oldUnit, newUnit);
  convertField(percentToLiftInput, oldUnit, newUnit);
  updateCalculations();
});

rpeUnitSelect.addEventListener('change', () => {
  const newUnit = rpeUnitSelect.value;
  const oldUnit = newUnit === 'kg' ? 'lbs' : 'kg';
  convertField(rpeWeightInput, oldUnit, newUnit);
  updateRPECalc();
});

// ----------------------------
// Lift Calculator Logic
// ----------------------------
function updateCalculations() {
  const weight = parseFloat(weightInput.value);
  const bodyFat = parseFloat(bodyFatInput.value);
  const percentToLift = parseFloat(percentToLiftInput.value);
  const usingDumbbells = dumbbellCheckbox.checked;
  const unit = unitSelect.value;

  if (!isNaN(weight) && !isNaN(bodyFat)) {
    let lbm = weight * (1 - bodyFat / 100);
    let liftWeight = !isNaN(percentToLift) ? lbm * (percentToLift / 100) : null;
    if (usingDumbbells && liftWeight !== null) liftWeight /= 2;

    if (unit === 'lbs') {
      lbm = convert(lbm, 'lbs');
      if (liftWeight !== null) liftWeight = convert(liftWeight, 'lbs');
    }

    lbmDisplay.textContent = `Lean Body Mass: ${lbm.toFixed(1)} ${unit}`;
    liftWeightDisplay.textContent = liftWeight !== null ?
      `Target Lift Weight: ${liftWeight.toFixed(1)} ${unit}` :
      `Target Lift Weight: —`;
  } else {
    lbmDisplay.textContent = `Lean Body Mass: —`;
    liftWeightDisplay.textContent = `Target Lift Weight: —`;
  }
}

weightInput.addEventListener('input', updateCalculations);
bodyFatInput.addEventListener('input', updateCalculations);
percentToLiftInput.addEventListener('input', updateCalculations);
dumbbellCheckbox.addEventListener('change', updateCalculations);

// ----------------------------
// RPE Calculator Logic
// ----------------------------
const rpeChart = {
  1:{10:1.00,9.5:0.96,9:0.92,8.5:0.89,8:0.86},
  2:{10:0.96,9.5:0.92,9:0.89,8.5:0.86,8:0.84},
  3:{10:0.92,9.5:0.89,9:0.86,8.5:0.84,8:0.81},
  4:{10:0.89,9.5:0.86,9:0.84,8.5:0.81,8:0.79},
  5:{10:0.86,9.5:0.84,9:0.81,8.5:0.79,8:0.76},
  6:{10:0.84,9.5:0.81,9:0.79,8.5:0.76,8:0.74},
  7:{10:0.81,9.5:0.79,9:0.76,8.5:0.74,8:0.71},
  8:{10:0.79,9.5:0.76,9:0.74,8.5:0.71,8:0.69},
  9:{10:0.76,9.5:0.74,9:0.71,8.5:0.69,8:0.66},
  10:{10:0.74,9.5:0.71,9:0.69,8.5:0.66,8:0.64},
  11:{10:0.71,9.5:0.69,9:0.66,8.5:0.64,8:0.61},
  12:{10:0.69,9.5:0.66,9:0.64,8.5:0.61,8:0.59}
};

function updateRPECalc() {
  const weight = parseFloat(rpeWeightInput.value);
  const rpe = parseFloat(rpeValueInput.value);
  const reps = parseInt(repsInput.value);
  const unit = rpeUnitSelect.value;

  if (!isNaN(weight) && rpeChart[reps] && rpeChart[reps][rpe]) {
    let baseWeight = unit === 'lbs' ? convert(weight, 'kg') : weight;
    const ratio = rpeChart[reps][rpe];
    let estimated1RM = baseWeight / ratio;
    if (unit === 'lbs') estimated1RM = convert(estimated1RM, 'lbs');

    rpe1RMDisplay.textContent = `Estimated 1RM: ${estimated1RM.toFixed(1)} ${unit}`;
  } else {
    rpe1RMDisplay.textContent = 'Estimated 1RM: —';
  }
}

rpeWeightInput.addEventListener('input', updateRPECalc);
rpeValueInput.addEventListener('input', updateRPECalc);
repsInput.addEventListener('input', updateRPECalc);

// ----------------------------
// Install App Logic
// ----------------------------
let deferredPrompt;
const installBtn = document.getElementById('installButton');
const installTabBtn = document.getElementById('installTabButton');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installTabBtn.hidden = false;
});

installBtn?.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      installTabBtn.hidden = true;
    }
    deferredPrompt = null;
  }
});

if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
  installTabBtn.hidden = true;
}

// ----------------------------
// Service Worker
// ----------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.error('Service Worker registration failed:', err));
}