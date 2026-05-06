import * as THREE from 'three';

export function createLevel(scene) {
  const colliders = [];
  
  // ==================== SKY & ATMOSPHERE ====================
  scene.background = new THREE.Color(0x0a0a15);
  scene.fog = new THREE.Fog(0x0a0a15, 20, 180);
  
  // ==================== TERRAIN / GROUND ====================
  // Main ground
  const groundGeometry = new THREE.PlaneGeometry(300, 300, 60, 60);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a2a1a,
    roughness: 0.95,
    metalness: 0.0
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Dirt paths (worn areas)
  const pathMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a3020,
    roughness: 1.0
  });
  const starGeo = new THREE.BufferGeometry();
  const starVerts = [];
  for (let i = 0; i < 3000; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 460 + Math.random() * 20;
    starVerts.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true, fog: false });
  scene.add(new THREE.Points(starGeo, starMat));
  function makeClouds() {
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x1a2030,
      transparent: true,
      opacity: 0.72,
      roughness: 1,
      metalness: 0,
      fog: false
    });
    const cloudMatLight = new THREE.MeshStandardMaterial({
      color: 0x2a3050,
      transparent: true,
      opacity: 0.55,
      roughness: 1,
      metalness: 0,
      fog: false
    });
 
    // Create several cloud clusters at different heights
    const cloudConfigs = [
      { x: -80,  y: 65, z: -120, scale: 2.2 },
      { x:  60,  y: 70, z: -100, scale: 1.8 },
      { x: -40,  y: 75, z: -200, scale: 2.5 },
      { x: 130,  y: 60, z: -150, scale: 1.6 },
      { x: -150, y: 68, z: -80,  scale: 2.0 },
      { x:  80,  y: 80, z:  -60, scale: 1.4 },
      { x: -20,  y: 72, z: -250, scale: 2.8 },
      { x: 200,  y: 62, z: -100, scale: 1.9 },
      { x: -200, y: 66, z: -180, scale: 2.3 },
      { x:  50,  y: 55, z: -300, scale: 3.0 },
      { x: -100, y: 58, z: -280, scale: 2.6 },
      { x:  150, y: 50, z: -220, scale: 2.1 },
    ];
 
    cloudConfigs.forEach(cfg => {
      const cluster = new THREE.Group();
      const puffCount = 5 + Math.floor(Math.random() * 6);
 
      for (let p = 0; p < puffCount; p++) {
        const w = (12 + Math.random() * 18) * cfg.scale;
        const h = (5  + Math.random() * 8)  * cfg.scale;
        const d = (10 + Math.random() * 15) * cfg.scale;
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(1, 7, 5),
          p % 3 === 0 ? cloudMatLight : cloudMat
        );
        puff.scale.set(w, h, d);
        puff.position.set(
          (Math.random() - 0.5) * 40 * cfg.scale,
          (Math.random() - 0.5) *  8 * cfg.scale,
          (Math.random() - 0.5) * 30 * cfg.scale
        );
        cluster.add(puff);
      }
      cluster.position.set(cfg.x, cfg.y, cfg.z);
      cloudGroup.add(cluster);
    });
 
    scene.add(cloudGroup);
    return cloudGroup;
  }
 
  const cloudGroup = makeClouds();

  
 
 
  
  // Create worn path textures
  const pathPositions = [
    { x: 0, z: 0, w: 4, d: 60 },
    { x: -20, z: 0, w: 3, d: 40 },
    { x: 20, z: 0, w: 3, d: 40 },
    { x: 0, z: -20, w: 40, d: 3 },
    { x: 0, z: 20, w: 40, d: 3 },
  ];
  
  pathPositions.forEach(path => {
    const pathMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(path.w, path.d),
      pathMaterial
    );
    pathMesh.rotation.x = -Math.PI / 2;
    pathMesh.position.set(path.x, 0.01, path.z);
    scene.add(pathMesh);
  });
   const debrisMat = new THREE.MeshStandardMaterial({ color: 0x1a1810, roughness: 1.0 });
  for (let i = 0; i < 30; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.5 + Math.random() * 2, 7),
      debrisMat
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(
      (Math.random() - 0.5) * 80,
      0.011,
      (Math.random() - 0.5) * 80
    );
    scene.add(patch);
  }
  
  // ==================== LIGHTING ====================
  // Ambient
  const ambientLight = new THREE.AmbientLight(0x202040, 0.3);
  scene.add(ambientLight);
  
  // Moon
  const moonLight = new THREE.DirectionalLight(0x6666aa, 0.5);
  moonLight.position.set(-30, 60, -30);
  scene.add(moonLight);
  
  // Street lights
  const streetLightPositions = [
    { x: -15, z: -15 },
    { x: 15, z: -15 },
    { x: -15, z: 15 },
    { x: 15, z: 15 },
    { x: 0, z: -30 },
    { x: 0, z: 30 },
    { x: -30, z: 0 },
    { x: 30, z: 0 },
  ];
  
  streetLightPositions.forEach(pos => {
    const light = new THREE.PointLight(0xffaa44, 1.2, 25);
    light.position.set(pos.x, 5, pos.z);
    scene.add(light);
  });
  
  // ==================== DETAILED BUILDINGS ====================
  
  // Building 1 - Tall skyscraper with details
  function createSkyscraper(x, z, width, depth, height, color) {
    const buildingGroup = new THREE.Group();
    
    const buildingMat = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.6,
      metalness: 0.4
    });
    
    // Main structure
    const mainBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      buildingMat
    );
    mainBuilding.position.y = height / 2;
    buildingGroup.add(mainBuilding);
    
    // Roof structure
    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.6, 2, depth * 0.6),
      buildingMat
    );
    roof.position.y = height + 1;
    buildingGroup.add(roof);
    
    // Antenna
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.9 })
    );
    antenna.position.y = height + 6;
    buildingGroup.add(antenna);
    
    // Blinking light on antenna
    const antennaLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    antennaLight.position.y = height + 10;
    buildingGroup.add(antennaLight);
    
    // Windows grid
    const windowMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffaa,
      emissive: 0xaaaa44,
      emissiveIntensity: 0.4
    });
    
    const darkWindowMat = new THREE.MeshStandardMaterial({ 
      color: 0x222233,
      roughness: 0.3
    });
    
    // Create window pattern
    const windowRows = Math.floor(height / 3);
    for (let row = 0; row < windowRows; row++) {
      for (let side = 0; side < 4; side++) {
        const isLit = Math.random() > 0.4;
        const winMat = isLit ? windowMat : darkWindowMat;
        
        // Front/back windows
        if (side === 0 || side === 2) {
          const numWindows = side === 0 ? Math.floor(width / 2) : Math.floor(depth / 2);
          for (let w = 0; w < numWindows; w++) {
            const win = new THREE.Mesh(
              new THREE.BoxGeometry(1, 1.5, 0.1),
              winMat
            );
            const offset = (w - numWindows / 2 + 0.5) * 2;
            if (side === 0) {
              win.position.set(offset, 2 + row * 3, depth / 2 + 0.05);
            } else {
              win.position.set(offset, 2 + row * 3, -depth / 2 - 0.05);
            }
            buildingGroup.add(win);
          }
        }
      }
    }
    
    // Ground floor detail
    const groundFloor = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.5, 0.3, depth + 0.5),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
    );
    groundFloor.position.y = 0.15;
    buildingGroup.add(groundFloor);
    
    buildingGroup.position.set(x, 0, z);
    scene.add(buildingGroup);
    colliders.push({ x, z });
  }
  
  // Create various buildings
  createSkyscraper(-35, -35, 10, 10, 30, 0x3a3a4a);
  createSkyscraper(30, -30, 12, 8, 22, 0x4a4a5a);
  createSkyscraper(-30, 30, 8, 12, 18, 0x2a2a3a);
  createSkyscraper(35, 35, 10, 10, 25, 0x3a3a3a);
  createSkyscraper(-40, 10, 6, 6, 12, 0x4a4030);
  createSkyscraper(40, -10, 8, 6, 15, 0x353540);
  
  // ==================== DETAILED TREES ====================
  function createDetailedTree(x, z, scale = 1) {
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2510, roughness: 0.9 });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2 * scale, 0.4 * scale, 4 * scale, 8),
      trunkMat
    );
    trunk.position.y = 2 * scale;
    treeGroup.add(trunk);
    
    // Bark texture (ridges)
    for (let i = 0; i < 5; i++) {
      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.45 * scale, 3.5 * scale, 0.05 * scale),
        trunkMat
      );
      const angle = (i / 5) * Math.PI * 2;
      ridge.position.set(
        Math.cos(angle) * 0.25 * scale,
        2 * scale,
        Math.sin(angle) * 0.25 * scale
      );
      ridge.rotation.y = angle;
      treeGroup.add(ridge);
    }
    
    // Branches
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x2a1a08, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * scale, 0.08 * scale, 1.5 * scale, 6),
        branchMat
      );
      const angle = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
      branch.position.set(
        Math.cos(angle) * 0.5 * scale,
        3 * scale + Math.random(),
        Math.sin(angle) * 0.5 * scale
      );
      branch.rotation.z = 0.5 + Math.random() * 0.3;
      branch.rotation.y = angle;
      treeGroup.add(branch);
    }
    
    // Foliage layers
    const leafMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a3a1a, 
      roughness: 0.85,
      metalness: 0.0
    });
    
    // Bottom layer
    const leaf1 = new THREE.Mesh(
      new THREE.ConeGeometry(3 * scale, 5 * scale, 8),
      leafMat
    );
    leaf1.position.y = 5 * scale;
    treeGroup.add(leaf1);
    
    // Middle layer
    const leaf2 = new THREE.Mesh(
      new THREE.ConeGeometry(2.5 * scale, 4 * scale, 8),
      leafMat
    );
    leaf2.position.y = 7 * scale;
    treeGroup.add(leaf2);
    
    // Top layer
    const leaf3 = new THREE.Mesh(
      new THREE.ConeGeometry(1.8 * scale, 3 * scale, 8),
      leafMat
    );
    leaf3.position.y = 9 * scale;
    treeGroup.add(leaf3);
    
    // Dead leaves at base
    const deadLeafMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 1.0 });
    for (let i = 0; i < 8; i++) {
      const deadLeaf = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8 * scale, 0.5 * scale),
        deadLeafMat
      );
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.5 + Math.random() * 0.5;
      deadLeaf.position.set(
        Math.cos(angle) * dist,
        0.05,
        Math.sin(angle) * dist
      );
      deadLeaf.rotation.x = -Math.PI / 2 + Math.random() * 0.3;
      deadLeaf.rotation.z = Math.random() * Math.PI;
      treeGroup.add(deadLeaf);
    }
    
    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
    colliders.push({ x, z });
  }
  
  // Place trees
  const treePositions = [
    { x: -12, z: -25, s: 1.3 }, { x: 12, z: -25, s: 1.1 },
    { x: -25, z: 12, s: 1.5 }, { x: 25, z: -12, s: 1.2 },
    { x: -18, z: 18, s: 1.0 }, { x: 18, z: 25, s: 1.4 },
    { x: -10, z: 5, s: 0.9 }, { x: 10, z: 8, s: 0.8 },
    { x: 5, z: -30, s: 1.2 }, { x: -28, z: 5, s: 1.1 },
    { x: 28, z: 8, s: 1.0 }, { x: 8, z: -12, s: 0.7 },
    { x: -8, z: 25, s: 1.0 }, { x: 5, z: 30, s: 1.3 },
    { x: -35, z: -15, s: 1.4 }, { x: 35, z: 20, s: 1.1 },
    { x: -20, z: 35, s: 1.2 }, { x: 25, z: -35, s: 1.0 },
  ];
  
  treePositions.forEach(pos => createDetailedTree(pos.x, pos.z, pos.s));
  
  // ==================== STREET LAMPS ====================
  function createStreetLamp(x, z) {
    const lampGroup = new THREE.Group();
    
    // Post
    const postMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.4 });
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 5, 8),
      postMat
    );
    post.position.y = 2.5;
    lampGroup.add(post);
    
    // Arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.08, 0.08),
      postMat
    );
    arm.position.set(0.35, 4.8, 0);
    lampGroup.add(arm);
    
    // Light housing
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 0.3, 8),
      postMat
    );
    housing.position.set(0.7, 4.65, 0);
    lampGroup.add(housing);
    
    // Light bulb
    const bulbMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffaa, 
      emissive: 0xffaa44,
      emissiveIntensity: 0.8
    });
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      bulbMat
    );
    bulb.position.set(0.7, 4.5, 0);
    lampGroup.add(bulb);
    
    // Light glow
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: 0xffaa44, 
      transparent: true, 
      opacity: 0.3 
    });
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      glowMat
    );
    glow.position.set(0.7, 4.5, 0);
    lampGroup.add(glow);
    
    lampGroup.position.set(x, 0, z);
    scene.add(lampGroup);
  }
  
  // Place lamp posts
  createStreetLamp(-15, -15);
  createStreetLamp(15, -15);
  createStreetLamp(-15, 15);
  createStreetLamp(15, 15);
  createStreetLamp(0, -25);
  createStreetLamp(0, 25);
  createStreetLamp(-25, 0);
  createStreetLamp(25, 0);
  
  // ==================== PERIMETER WALLS ====================
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x303030, roughness: 0.72, metalness: 0.3 });
  [
    { x:-52, z:0,  w:2,  h:6, d:104 },
    { x: 52, z:0,  w:2,  h:6, d:104 },
    { x:0,  z:-52, w:104, h:6, d:2 },
    { x:0,  z: 52, w:104, h:6, d:2 },
  ].forEach(w => {
    const wm = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
    wm.position.set(w.x, w.h/2, w.z);
    scene.add(wm);
  });
 
  // Wall battlements
  const battMat = new THREE.MeshStandardMaterial({ color: 0x383838, roughness: 0.7 });
  for (let i = -5; i <= 5; i++) {
    [[-52, i*10, 0], [52, i*10, 0], [i*10, 0, -52], [i*10, 0, 52]].forEach(([bx,by,bz]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 2.2), battMat);
      if (bz === 0) b.position.set(bx, 7, by);
      else b.position.set(bx, 7, bz);
      scene.add(b);
    });
  }
  
  // ==================== CRATES & BARRELS ====================
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 });
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.6 });
  
  // Stacked crates
  const cratePositions = [
    { x: -6, z: -6 }, { x: 6, z: 6 },
    { x: -6, z: 6 }, { x: 6, z: -6 },
    { x: 0, z: 10 }, { x: 0, z: -10 },
  ];
  
  cratePositions.forEach(pos => {
    // Bottom crate
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), crateMat);
    crate1.position.set(pos.x, 1, pos.z);
    scene.add(crate1);
    
    // Top crate (rotated)
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), crateMat);
    crate2.position.set(pos.x + 0.2, 2.9, pos.z + 0.2);
    crate2.rotation.y = 0.3;
    scene.add(crate2);
    
    colliders.push({ x: pos.x, z: pos.z });
  });
  
  // Barrels
  const barrelPositions = [
    { x: -14, z: 0 }, { x: 14, z: 0 },
    { x: 0, z: 14 }, { x: 0, z: -14 },
    { x: -8, z: 14 }, { x: 8, z: -14 },
  ];
  
  barrelPositions.forEach(pos => {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 1.2, 12),
      barrelMat
    );
    barrel.position.set(pos.x, 0.6, pos.z);
    scene.add(barrel);
    
    // Barrel rings
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.02, 8, 24),
        ringMat
      );
      ring.position.set(pos.x, 0.3 + r * 0.4, pos.z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }
  });
  
  // ==================== ROCKS ====================
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.95 });
  
  const rockPositions = [
    { x: -22, z: -8, s: 1.2 }, { x: 22, z: 10, s: 0.9 },
    { x: -10, z: 22, s: 1.0 }, { x: 25, z: -22, s: 1.3 },
    { x: -35, z: 20, s: 0.8 }, { x: 30, z: -35, s: 1.1 },
  ];
  
  rockPositions.forEach(pos => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(pos.s, 1),
      rockMat
    );
    rock.position.set(pos.x, pos.s * 0.4, pos.z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    scene.add(rock);
  });
  
  // ==================== ADDITIONAL DETAILS ====================
  
  // Dumpsters
  const dumpsterMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.8 });
  const dumpsterPositions = [
    { x: -38, z: -5 }, { x: 38, z: 5 }, { x: 5, z: 38 }
  ];
  
  dumpsterPositions.forEach(pos => {
    const dumpster = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.5, 1.2),
      dumpsterMat
    );
    dumpster.position.set(pos.x, 0.75, pos.z);
    scene.add(dumpster);
    colliders.push({ x: pos.x, z: pos.z });
  });
  
  // Benches
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.8 });
  const benchPositions = [
    { x: -15, z: 0, rot: 0 }, { x: 15, z: 0, rot: Math.PI },
    { x: 0, z: -15, rot: Math.PI/2 }, { x: 0, z: 15, rot: -Math.PI/2 }
  ];
  
  benchPositions.forEach(pos => {
    const benchGroup = new THREE.Group();
    
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.1, 0.5),
      benchMat
    );
    seat.position.y = 0.5;
    benchGroup.add(seat);
    
    // Back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.6, 0.08),
      benchMat
    );
    back.position.set(0, 0.8, -0.2);
    benchGroup.add(back);
    
    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    [-0.6, 0.6].forEach(lx => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.5, 0.4),
        legMat
      );
      leg.position.set(lx, 0.25, 0);
      benchGroup.add(leg);
    });
    
    benchGroup.position.set(pos.x, 0, pos.z);
    benchGroup.rotation.y = pos.rot;
    scene.add(benchGroup);
  });
   const puddleMat = new THREE.MeshStandardMaterial({
    color: 0x101820,
    roughness: 0.05,
    metalness: 0.8,
    transparent: true,
    opacity: 0.7
  });
  for (let i = 0; i < 12; i++) {
    const pw = 1.5 + Math.random() * 3;
    const ph = 0.8 + Math.random() * 2;
    const puddle = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set((Math.random()-0.5)*60, 0.012, (Math.random()-0.5)*60);
    scene.add(puddle);
  }
  
  return {
    getColliders: () => colliders
  };
}