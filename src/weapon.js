import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

let audioContext = null;
function initAudio() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext;
}

function playShootSound() {
  const ctx = initAudio();
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
  osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.22);
  const bufSize = ctx.sampleRate * 0.12;
  const nb = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < bufSize; i++) nd[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource(), ng = ctx.createGain(), nf = ctx.createBiquadFilter();
  noise.buffer = nb; nf.type = 'bandpass'; nf.frequency.value = 1200; nf.Q.value = 0.8;
  ng.gain.setValueAtTime(0.25, ctx.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
  noise.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

function playReloadSound() {
  const ctx = initAudio();
  if (ctx.state === 'suspended') ctx.resume();
  for (let i = 0; i < 3; i++) setTimeout(() => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 200 + Math.random() * 100;
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.05);
  }, i * 100);
  setTimeout(() => {
    for (let i = 0; i < 2; i++) setTimeout(() => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = 300 + Math.random() * 50;
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      o.connect(g); g.connect(ctx.destination);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.08);
    }, i * 80);
  }, 400);
}

function playEmptySound() {
  const ctx = initAudio();
  if (ctx.state === 'suspended') ctx.resume();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = 800;
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.05);
}

export function createWeapon(scene, camera) {
  const rg = new THREE.Group(); // rifle group

  // Materials
  const BK = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, metalness: 0.96, roughness: 0.14 });
  const DK = new THREE.MeshStandardMaterial({ color: 0x1e1e1e, metalness: 0.90, roughness: 0.24 });
  const MD = new THREE.MeshStandardMaterial({ color: 0x404040, metalness: 0.85, roughness: 0.32 });
  const WD = new THREE.MeshStandardMaterial({ color: 0x4a2e14, roughness: 0.82, metalness: 0.04 });
  const WD2= new THREE.MeshStandardMaterial({ color: 0x30200d, roughness: 0.88, metalness: 0.02 });
  const LN = new THREE.MeshStandardMaterial({ color: 0x112255, metalness: 0.7, roughness: 0.05, transparent: true, opacity: 0.88 });
  const RD = new THREE.MeshBasicMaterial({ color: 0xff2000 });

  function B(w, h, d, mat, x, y, z, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); rg.add(m); return m;
  }
  function C(rt, rb, h, seg, mat, x, y, z, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); rg.add(m); return m;
  }
  function T(r, tube, seg, mat, x, y, z, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, seg), mat);
    m.position.set(x, y, z); m.rotation.set(rx, ry, rz); rg.add(m); return m;
  }

  // ── STOCK ──────────────────────────────────────────────────
  B(0.074, 0.112, 0.310, WD,  0,  0.002, -0.455);         // main stock
  B(0.058, 0.036, 0.175, WD2, 0,  0.074, -0.395);         // cheek riser
  B(0.053, 0.092, 0.055, WD,  0,  0.000, -0.617);         // toe
  B(0.048, 0.108, 0.010, BK,  0,  0.000, -0.650);         // butt-pad
  C(0.015, 0.015, 0.024, 8, MD,  0.037, -0.022, -0.598, 0, 0, Math.PI/2); // sling loop

  // ── RECEIVER ───────────────────────────────────────────────
  B(0.092, 0.128, 0.235, BK,  0,  0.000, -0.175);         // lower+upper receiver
  B(0.026, 0.011, 0.415, DK,  0,  0.071,  0.015);         // top Picatinny rail
  for (let i = 0; i < 13; i++)                             // rail teeth
    B(0.028, 0.014, 0.004, MD, 0, 0.075, -0.175 + i*0.032);
  for (let i = 0; i < 5; i++) {                            // side serrations
    B(0.002, 0.028, 0.016, MD,  0.047,  0.008-i*0.022, -0.115+i*0.030);
    B(0.002, 0.028, 0.016, MD, -0.047,  0.008-i*0.022, -0.115+i*0.030);
  }
  B(0.002, 0.036, 0.065, MD,   0.048,  0.006, -0.135); // ejection port
  C(0.009, 0.011, 0.018, 8, MD, 0.050,  0.016, -0.045, 0, 0, Math.PI/2); // fwd assist

  // ── PISTOL GRIP ────────────────────────────────────────────
  B(0.053, 0.125, 0.072, BK,  0, -0.093, -0.265, 0.34, 0, 0);
  for (let i = 0; i < 6; i++)
    B(0.055, 0.007, 0.004, DK, 0, -0.058-i*0.015, -0.290+i*0.006);
  B(0.044, 0.011, 0.058, MD,  0, -0.160, -0.235);         // grip cap

  // ── TRIGGER GUARD & TRIGGER ────────────────────────────────
  T(0.028, 0.006, 18, DK, 0, -0.034, -0.215, Math.PI/2, 0, Math.PI); // guard arc
  B(0.009, 0.042, 0.013, MD, 0, -0.026, -0.215, 0.28, 0, 0);         // trigger blade
  C(0.004, 0.004, 0.098, 8, MD, 0, -0.009, -0.215, 0, 0, Math.PI/2); // trigger pin

  // ── MAGAZINE ───────────────────────────────────────────────
  B(0.080, 0.062, 0.100, BK,  0, -0.065, -0.115);         // mag well
  B(0.062, 0.182, 0.105, DK,  0, -0.170, -0.096, 0.11, 0, 0); // mag body
  B(0.058, 0.011, 0.092, MD,  0, -0.265, -0.082);         // floor plate
  for (let i = 0; i < 5; i++)
    B(0.066, 0.011, 0.009, MD, 0, -0.138-i*0.030, -0.046-i*0.003, 0.11, 0, 0);

  // ── HANDGUARD (M-LOK) ──────────────────────────────────────
  C(0.039, 0.041, 0.315, 8, DK, 0, 0.007, 0.158, Math.PI/2, 0, 0);   // octagonal tube
  [-0.115,-0.040, 0.040, 0.115, 0.195].forEach(zp => {
    B(0.002, 0.009, 0.020, BK,  0.041,  0.018, zp);
    B(0.002, 0.009, 0.020, BK, -0.041,  0.018, zp);
    B(0.019, 0.002, 0.020, BK,  0.000, -0.032, zp);
  });
  C(0.043, 0.043, 0.011, 8, MD, 0, 0.007, 0.312, Math.PI/2, 0, 0);   // end cap
  C(0.046, 0.046, 0.020, 12, MD, 0, 0.007, -0.001, Math.PI/2, 0, 0); // barrel nut

  // ── GAS SYSTEM ─────────────────────────────────────────────
  B(0.028, 0.028, 0.038, DK,  0,  0.005, 0.142);           // gas block
  C(0.005, 0.005, 0.058, 8, BK, 0, 0.040, 0.142);          // gas tube up
  C(0.014, 0.014, 0.040, 8, BK, 0, 0.027, 0.142, 0, 0, Math.PI/2); // lateral

  // ── BARREL ─────────────────────────────────────────────────
  C(0.012, 0.015, 0.560, 12, BK, 0, 0.005, 0.298, Math.PI/2, 0, 0);  // main barrel
  C(0.016, 0.016, 0.018, 12, MD, 0, 0.005, 0.218, Math.PI/2, 0, 0);  // step

  // ── MUZZLE BRAKE ───────────────────────────────────────────
  C(0.020, 0.014, 0.072, 6, DK, 0, 0.005, 0.614, Math.PI/2, 0, 0);
  for (let i = 0; i < 3; i++)
    B(0.009, 0.011, 0.004, BK, 0, 0.024, 0.592+i*0.018);
  C(0.015, 0.020, 0.009, 6, MD, 0, 0.005, 0.654, Math.PI/2, 0, 0);   // crown

  // ── CHARGING HANDLE ────────────────────────────────────────
  B(0.053, 0.017, 0.034, DK, 0, 0.070, -0.275);
  B(0.007, 0.011, 0.029, MD, -0.031, 0.066, -0.275);
  B(0.007, 0.011, 0.029, MD,  0.031, 0.066, -0.275);

  // ── BCG (bolt carrier group, partially visible) ─────────────
  C(0.027, 0.029, 0.175, 10, BK, 0, 0.005, -0.138, Math.PI/2, 0, 0);

  // ── SCOPE (LPVO 1-6×24) ────────────────────────────────────
  const scopeMat = new THREE.MeshStandardMaterial({color:0x0a0a0a, metalness:0.92, roughness:0.18});
  [-0.082, 0.178].forEach(zp => {
    T(0.037, 0.006, 18, MD, 0, 0.136, zp, 0, Math.PI/2, 0); // scope ring
    for (let s = 0; s < 4; s++) {
      const a = s * Math.PI/2;
      C(0.003, 0.003, 0.010, 6, BK,
        Math.sin(a)*0.038, 0.136+Math.cos(a)*0.038, zp);
    }
  });
  C(0.031, 0.031, 0.315, 16, scopeMat, 0, 0.138, 0.048, Math.PI/2, 0, 0); // main tube
  C(0.040, 0.031, 0.052, 16, BK,       0, 0.138, 0.218, Math.PI/2, 0, 0); // obj bell
  const ol = new THREE.Mesh(new THREE.CylinderGeometry(0.037,0.037,0.007,16), LN);
  ol.position.set(0,0.138,0.246); ol.rotation.x=Math.PI/2; rg.add(ol);       // obj glass
  C(0.026, 0.031, 0.062, 16, BK,       0, 0.138,-0.122, Math.PI/2, 0, 0); // eyepiece
  C(0.032, 0.032, 0.015, 16, MD,       0, 0.138,-0.145, Math.PI/2, 0, 0); // diopter
  const el = new THREE.Mesh(new THREE.CylinderGeometry(0.023,0.023,0.007,16), LN);
  el.position.set(0,0.138,-0.155); el.rotation.x=Math.PI/2; rg.add(el);       // ep glass
  C(0.013, 0.013, 0.026, 10, MD,  0,      0.172,  0.055);                    // elev turret
  C(0.013, 0.013, 0.026, 10, MD,  0.046,  0.138,  0.055, 0, 0, Math.PI/2);  // wind turret
  C(0.009, 0.009, 0.020, 8, RD,  -0.044,  0.138, -0.038, 0, 0, Math.PI/2); // illum dial

  // ── BUIS (back-up iron sights) ─────────────────────────────
  B(0.058, 0.028, 0.013, DK, 0, 0.080, -0.075);           // rear BUIS base
  B(0.007, 0.038, 0.009, DK, 0, 0.100,  0.380);           // front post
  B(0.026, 0.007, 0.009, DK, 0, 0.116,  0.380);           // front wings

  // ── ANGLED FOREGRIP ────────────────────────────────────────
  B(0.028, 0.098, 0.026, BK, 0, -0.055, 0.162, 0.20, 0, 0);
  for (let i = 0; i < 4; i++)
    B(0.030, 0.005, 0.002, DK, 0, -0.032-i*0.019, 0.171, 0.20, 0, 0);

  // ── SLING SWIVELS ──────────────────────────────────────────
  T(0.014, 0.004, 14, MD,  0.041, 0.006, 0.118);
  T(0.014, 0.004, 14, MD,  0.037,-0.004,-0.555);

  // ── POSITION IN CAMERA VIEW ───────────────────────────────
  rg.position.set(0.235, -0.190, -0.420);
  rg.rotation.set(0, -0.04, 0);
  camera.add(rg);
  scene.add(camera);

  // ── MUZZLE FLASH ──────────────────────────────────────────
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffee44 })
  );
  flash.position.set(0.235, -0.184, 0.230);
  flash.visible = false;
  scene.add(flash);

  // ── LOAD FBX MODEL (if available) ───────────────────────────
  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    'SMG.fbx',
    (fbxModel) => {
      fbxModel.scale.set(0.01, 0.01, 0.01);
      fbxModel.rotation.set(0, Math.PI, 0);
      fbxModel.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.2
          });
        }
      });
      rg.add(fbxModel);
    },
    undefined,
    (error) => {
      console.log('Using procedural rifle (FBX not found)');
    }
  );

  let isReloading = false;

  return {
    shoot(onEmpty) {
      if (onEmpty) { playEmptySound(); return null; }

      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffdd00 })
      );
      const sp = new THREE.Vector3(0.235, -0.184, 0.230);
      sp.applyMatrix4(camera.matrixWorld);
      bullet.position.copy(sp);

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      bullet.velocity = dir.multiplyScalar(160);

      playShootSound();
      flash.visible = true;
      setTimeout(() => { flash.visible = false; }, 45);

      rg.position.z = -0.315;
      rg.rotation.x = -0.10;
      setTimeout(() => { rg.position.z = -0.420; rg.rotation.x = 0; }, 85);

      return bullet;
    },

    reload(callback) {
      if (isReloading) return false;
      isReloading = true;
      playReloadSound();
      rg.rotation.x = 0.38;
      rg.position.y = -0.26;
      setTimeout(() => {
        rg.rotation.x = 0;
        rg.position.y = -0.19;
        isReloading = false;
        if (callback) callback();
      }, 820);
      return true;
    },

    isReloading() { return isReloading; }
  };
}
      

    
  
