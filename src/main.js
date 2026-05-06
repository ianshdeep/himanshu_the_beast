import * as THREE from 'three';
import { createPlayer } from './player.js';
import { createLevel } from './level.js';
import { createWeapon } from './weapon.js';
import { createEnemy } from './enemy.js';
import { checkCollision } from './collision.js';

// Game state
const state = {
  isPlaying: false,
  score: 0,
  health: 100,
  ammo: 20,
  maxAmmo: 20,
  enemies: [],
  bullets: [],
  lastShot: 0,
  // Boss wave
  bossWave: false,
  bossSpawned: false,
  boss: null,
  earthquake: false,
  earthquakeTime: 0,
  // Survival time
  survivalTime: 0,
  lastBossTime: 0
};

// Three.js core
let scene, camera, renderer;
let player, weapon, level;

// Clock for delta time
const clock = new THREE.Clock();

// Input state
const keys = { w: false, a: false, s: false, d: false };
let mouseX = 0, mouseY = 0;
let isPointerLocked = false;
let mouseDown = false;

export function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.getElementById('game-container').appendChild(renderer.domElement);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Create game objects
  level = createLevel(scene);
  player = createPlayer(camera);
  weapon = createWeapon(scene, camera);

  // Event listeners
  setupEventListeners();

  // Start render loop
  animate();
}

function setupEventListeners() {
  // Keyboard
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = true;
    
    // Jump with spacebar
    if (e.code === 'Space' && state.isPlaying) {
      player.jump();
    }
    
    // Buy medikit with B key
    if (key === 'b' && state.isPlaying) {
      buyMedikit();
    }
    
    // Manual reload with R key
    if (key === 'r' && state.isPlaying && state.ammo < state.maxAmmo && !weapon.isReloading()) {
      weapon.reload(() => {
        state.ammo = state.maxAmmo;
        updateUI();
      });
    }
  });

  document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = false;
  });

  // Mouse movement
  document.addEventListener('mousemove', (e) => {
    if (!isPointerLocked) return;
    player.rotate(e.movementX, e.movementY);
  });

  // Mouse click
  document.addEventListener('mousedown', (e) => {
    if (!state.isPlaying || !isPointerLocked) return;
    if (e.button === 0) {
      mouseDown = true;
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      mouseDown = false;
    }
  });

  // Pointer lock
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
  });

  // Window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Start button
  document.getElementById('start-btn').addEventListener('click', startGame);
}

function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  renderer.domElement.requestPointerLock();
  state.isPlaying = true;
  state.score = 0;
  state.health = 100;
  state.ammo = 20;
  state.enemies = [];
  state.bullets = [];
  state.survivalTime = 0;
  state.lastBossTime = 0;
  
  // Reset player position
  player.reset();
  
  // Spawn initial enemies
  for (let i = 0; i < 5; i++) {
    spawnEnemy();
  }
  
  updateUI();
}

function shoot() {
  // Check if reloading
  if (weapon.isReloading()) return;
  
  // Check ammo
  if (state.ammo <= 0) {
    // Empty - play click sound and auto-reload
    weapon.shoot(true); // true = empty sound
    weapon.reload(() => {
      state.ammo = state.maxAmmo;
      updateUI();
    });
    return;
  }

  state.lastShot = Date.now();
  state.ammo--;
  
  // Create bullet
  const bullet = weapon.shoot();
  if (bullet) {
    state.bullets.push(bullet);
  }
  
  updateUI();
  
  // Auto-reload when low ammo
  if (state.ammo === 0) {
    setTimeout(() => {
      weapon.reload(() => {
        state.ammo = state.maxAmmo;
        updateUI();
      });
    }, 500);
  }
}

function spawnEnemy() {
  const enemy = createEnemy(scene, player.camera.position);
  state.enemies.push(enemy);
}

// Boss wave system
function triggerBossWave() {
  state.bossWave = true;
  
  // Clear all small enemies
  for (const enemy of state.enemies) {
    if (enemy.fireParticles) {
      for (const particle of enemy.fireParticles) scene.remove(particle);
    }
    if (enemy.fireTrails) {
      for (const trail of enemy.fireTrails) scene.remove(trail);
    }
    scene.remove(enemy.mesh);
  }
  state.enemies = [];
  
  // Start earthquake
  state.earthquake = true;
  state.earthquakeTime = 0;
  
  showBossMessage('⚠️ BOSS FIGHT ⚠️');
  
  // After 3 seconds, spawn boss
  setTimeout(spawnBoss, 3000);
}

function spawnBoss() {
  state.earthquake = false;
  state.bossSpawned = true;
  
  // Create huge boss enemy (same design as small enemy but bigger)
  const bossGroup = new THREE.Group();
  
  // Boss materials (same as small enemy)
  const armorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a,
    roughness: 0.4,
    metalness: 0.8
  });
  
  const suitMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    roughness: 0.6,
    metalness: 0.3
  });
  
  // Scale factor for boss (3x bigger)
  const scale = 3;
  
  // Giant body (scaled up from small enemy)
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.9 * scale, 1.1 * scale, 0.55 * scale),
    armorMaterial
  );
  torso.position.y = 0.85 * scale;
  bossGroup.add(torso);
  
  // Giant head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.7 * scale, 0.8 * scale, 0.6 * scale),
    armorMaterial
  );
  head.position.y = 1.8 * scale;
  bossGroup.add(head);
  
  // Face (same as small enemy)
  const textureLoader = new THREE.TextureLoader();
  const faceTexture = textureLoader.load('/textures/face.jpg');
  const faceMaterial = new THREE.MeshBasicMaterial({
    map: faceTexture,
    roughness: 0.6,
    metalness: 0.1
  });
  const facePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9 * scale, 0.8 * scale),
    faceMaterial
  );
  facePlane.position.set(0, 1.62 * scale, 0.31 * scale);
  bossGroup.add(facePlane);
  
  // Visor
  
  
  // Arms (scaled)
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.18 * scale, 1.2 * scale, 8),
    suitMaterial
  );
  leftArm.position.set(-0.55 * scale, 0.7 * scale, 0);
  bossGroup.add(leftArm);
  
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.18 * scale, 1.2 * scale, 8),
    suitMaterial
  );
  rightArm.position.set(0.55 * scale, 0.7 * scale, 0);
  bossGroup.add(rightArm);
  
  // Legs (scaled)
  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 1.3 * scale, 8),
    suitMaterial
  );
  leftLeg.position.set(-0.2 * scale, -0.65 * scale, 0);
  bossGroup.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 1.3 * scale, 8),
    suitMaterial
  );
  rightLeg.position.set(0.2 * scale, -0.65 * scale, 0);
  bossGroup.add(rightLeg);
  
  // Boss health bar
  const healthBarBg = document.createElement('div');
  healthBarBg.id = 'boss-health-container';
  healthBarBg.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 30px;
    background: rgba(0,0,0,0.8);
    border: 3px solid #ff0000;
    display: none;
    z-index: 100;
  `;
  healthBarBg.innerHTML = `
    <div style="color: #ff0000; font-size: 16px; text-align: center; margin-bottom: 5px; font-family: monospace; font-weight: bold;">BOSS</div>
    <div id="boss-health-fill" style="width: 100%; height: 20px; background: #ff0000; transition: width 0.2s;"></div>
  `;
  document.body.appendChild(healthBarBg);
  
  // Spawn position
  const angle = Math.random() * Math.PI * 2;
  const distance = 25;
  bossGroup.position.set(
    player.camera.position.x + Math.cos(angle) * distance,
    0,
    player.camera.position.z + Math.sin(angle) * distance
  );
  scene.add(bossGroup);
  
  // Boss state
  const boss = {
    mesh: bossGroup,
    position: bossGroup.position,
    health: 500,
    maxHealth: 500,
    isBoss: true,
    fireParticles: [],
    fireTrails: [],
    lastAttack: 0,
    lastTouch: 0,
    attackCooldown: 1500,
    lastMelee: 0,
    isMeleeAttacking: false,
    meleeStart: 0,
    meleeDuration: 300,
    laserLine: null,
    isLaserActive: false
  };
  
  // Add laser particles to boss
  for (let i = 0; i < 20; i++) {
    const size = 0.05 + Math.random() * 0.1;
    const fireParticle = new THREE.Mesh(
      new THREE.SphereGeometry(size, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.9
      })
    );
    fireParticle.visible = false;
    fireParticle.userData = {
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0.5 + Math.random() * 0.5
    };
    scene.add(fireParticle);
    boss.fireParticles.push(fireParticle);
    
    const trail = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.5, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.6
      })
    );
    trail.visible = false;
    scene.add(trail);
    boss.fireTrails.push(trail);
  }
  
  // Create laser line
  const laserGeometry = new THREE.BufferGeometry();
  const laserMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff0000, 
    linewidth: 3,
    transparent: true,
    opacity: 0.8
  });
  boss.laserLine = new THREE.Line(laserGeometry, laserMaterial);
  scene.add(boss.laserLine);
  
  // Boss laser attack
  boss.attackPlayer = function(targetPos, delta) {
    boss.isLaserActive = true;
    
    const startPos = bossGroup.position.clone();
    startPos.y += 5;
    const endPos = targetPos.clone();
    
    const points = [startPos, endPos];
    boss.laserLine.geometry.dispose();
    boss.laserLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
    boss.laserLine.visible = true;
  };
  
  boss.updateFire = function(delta) {
    boss.isLaserActive = false;
    for (let i = 0; i < boss.fireParticles.length; i++) {
      const particle = boss.fireParticles[i];
      const trail = boss.fireTrails[i];
      
      if (particle.visible) {
        particle.userData.life += delta;
        
        if (particle.userData.life > particle.userData.maxLife) {
          particle.visible = false;
        } else {
          particle.position.add(particle.userData.velocity.clone().multiplyScalar(delta));
          particle.userData.velocity.y += delta * 0.5;
          
          const lifeRatio = particle.userData.life / particle.userData.maxLife;
          particle.material.opacity = 0.9 * (1 - lifeRatio);
          
          const scale = 1 + Math.sin(lifeRatio * Math.PI) * 2;
          particle.scale.set(scale, scale, scale);
        }
      }
    }
    
    // Hide laser line when not active
    if (!boss.isLaserActive && boss.laserLine) {
      boss.laserLine.visible = false;
    }
  };
  
  state.boss = boss;
  state.enemies.push(boss);
  
  // Show health bar
  healthBarBg.style.display = 'block';
  
  showBossMessage('BOSS SPAWNED!');
}

function showBossMessage(msg) {
  const div = document.createElement('div');
  div.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(139, 0, 0, 0.9);
    color: #fff;
    padding: 30px 60px;
    font-size: 36px;
    font-family: monospace;
    font-weight: bold;
    border: 4px solid #ff0000;
    z-index: 1000;
    text-shadow: 0 0 20px #ff0000;
  `;
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function updateUI() {
  document.getElementById('score').textContent = state.score;
  document.getElementById('health-fill').style.width = state.health + '%';
  document.getElementById('ammo-count').textContent = state.ammo;
  
  // Update survival time display
  const minutes = Math.floor(state.survivalTime / 60);
  const seconds = Math.floor(state.survivalTime % 60);
  const timeDisplay = document.getElementById('survival-time');
  if (timeDisplay) {
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Buy medikit function
function buyMedikit() {
  const medikitCost = 1000;
  
  if (state.score >= medikitCost && state.health < 100) {
    state.score -= medikitCost;
    state.health = Math.min(100, state.health + 50); // Add 50 health
    updateUI();
    
    // Visual feedback
    showBuyMessage('Medikit purchased! +50 Health');
  } else if (state.score < medikitCost) {
    showBuyMessage('Not enough score! Need ' + medikitCost);
  } else if (state.health >= 100) {
    showBuyMessage('Health already full!');
  }
}

// Show buy message
function showBuyMessage(msg) {
  const existing = document.getElementById('buy-message');
  if (existing) existing.remove();
  
  const div = document.createElement('div');
  div.id = 'buy-message';
  div.textContent = msg;
  div.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8);
    color: #0f0;
    padding: 20px 40px;
    font-size: 24px;
    font-family: monospace;
    border: 2px solid #0f0;
    z-index: 1000;
  `;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2000);
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (state.isPlaying) {
    // Update survival time
    state.survivalTime += delta;
    const minutes = Math.floor(state.survivalTime / 60);
    const seconds = Math.floor(state.survivalTime % 60);
    const timeDisplay = document.getElementById('survival-time');
    if (timeDisplay) {
      timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Check for boss wave every 1:30 minutes
    if (!state.bossWave && !state.earthquake && state.survivalTime - state.lastBossTime >= 90) {
      state.lastBossTime = state.survivalTime;
      triggerBossWave();
    }
    
    // Player movement
    player.move(keys, delta, level.getColliders());
    
    // Automatic fire while mouse is held down
    if (mouseDown && state.ammo > 0 && !weapon.isReloading()) {
      const now = Date.now();
      if (now - state.lastShot > 100) { // Fire rate: 100ms between shots
        shoot();
        state.lastShot = now;
      }
    }
    
    // Update bullets
    updateBullets(delta);
    
    // Update enemies
    updateEnemies(delta);
    
    // Reload
    if (state.ammo === 0) {
      setTimeout(() => {
        state.ammo = state.maxAmmo;
        updateUI();
      }, 1000);
      state.ammo = -1; // Prevent multiple reloads
    }
  }

  renderer.render(scene, camera);
}

function updateBullets(delta) {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const bullet = state.bullets[i];
    bullet.position.add(bullet.velocity.clone().multiplyScalar(delta));
    
    // Remove if too far
    if (bullet.position.distanceTo(player.camera.position) > 100) {
      scene.remove(bullet);
      state.bullets.splice(i, 1);
      continue;
    }
    
    // Check enemy collision
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      const enemy = state.enemies[j];
      // Use mesh position for accurate collision (enemy.position is updated via mesh)
      const enemyPos = enemy.mesh.position;
      const dist = bullet.position.distanceTo(enemyPos);
      
      // Boss has bigger hit radius
      const hitRadius = enemy.isBoss ? 3 : 2;
      
      if (dist < hitRadius) {
        // Check if it's a boss
        if (enemy.isBoss && enemy.health) {
          // Damage the boss
          enemy.health -= 25;
          
          // Update boss health bar
          const healthFill = document.getElementById('boss-health-fill');
          if (healthFill) {
            const healthPercent = (enemy.health / enemy.maxHealth) * 100;
            healthFill.style.width = healthPercent + '%';
          }
          
          // Remove bullet
          scene.remove(bullet);
          state.bullets.splice(i, 1);
          
          // Check if boss is dead
          if (enemy.health <= 0) {
            // Clean up fire particles
            if (enemy.fireParticles) {
              for (const particle of enemy.fireParticles) {
                scene.remove(particle);
              }
            }
            if (enemy.fireTrails) {
              for (const trail of enemy.fireTrails) {
                scene.remove(trail);
              }
            }
            
            // Remove boss
            scene.remove(enemy.mesh);
            if (enemy.laserLine) {
              scene.remove(enemy.laserLine);
            }
            state.enemies.splice(j, 1);
            state.score += 500;
            updateUI();
            
            // Remove health bar
            const healthBar = document.getElementById('boss-health-container');
            if (healthBar) healthBar.remove();
            
            state.boss = null;
            state.bossWave = false;
            state.bossSpawned = false;
            
            showBossMessage('BOSS DEFEATED!');
            
            // Resume normal spawning with multiple enemies
            setTimeout(() => {
              for (let i = 0; i < 5; i++) {
                spawnEnemy();
              }
            }, 2000);
          }
          break;
        } else {
          // Regular enemy - clean up fire particles first
          if (enemy.fireParticles) {
            for (const particle of enemy.fireParticles) {
              scene.remove(particle);
            }
          }
          if (enemy.fireTrails) {
            for (const trail of enemy.fireTrails) {
              scene.remove(trail);
            }
          }
          
          // Hit enemy
          scene.remove(enemy.mesh);
          state.enemies.splice(j, 1);
          scene.remove(bullet);
          state.bullets.splice(i, 1);
          state.score += 100;
          updateUI();
          
          // If boss killed, resume normal spawning
          if (state.boss && state.enemies.length === 0) {
            state.bossWave = false;
            state.bossSpawned = false;
            state.boss = null;
            setTimeout(spawnEnemy, 2000);
          } else if (!state.bossWave) {
            setTimeout(spawnEnemy, 2000);
          }
          break;
        }
      }
    }
  }
}

function updateEnemies(delta) {
  const playerPos = player.camera.position;
  const now = Date.now();
  
  // Handle earthquake effect
  if (state.earthquake) {
    state.earthquakeTime += delta;
    
    // Shake camera
    const shake = Math.sin(state.earthquakeTime * 30) * 0.1;
    camera.position.x = player.camera.position.x + shake;
    camera.position.y = 1.6 + Math.cos(state.earthquakeTime * 25) * 0.05;
    
    // Screen shake effect
    renderer.domElement.style.transform = `translate(${shake * 50}px, ${shake * 30}px)`;
    
    return; // Don't update enemies during earthquake
  }
  
  // Reset camera after earthquake
  renderer.domElement.style.transform = '';
  
  for (const enemy of state.enemies) {
    // Boss moves slower
    const speed = enemy.isBoss ? 1.2 : 2;
    const direction = new THREE.Vector3()
      .subVectors(playerPos, enemy.position)
      .normalize();
    
    enemy.position.add(direction.multiplyScalar(delta * speed));
    enemy.mesh.position.copy(enemy.position);
    enemy.mesh.lookAt(playerPos);
    
    // Fire breath attack
    if (enemy.attackPlayer && enemy.updateFire) {
      const dist = enemy.position.distanceTo(playerPos);
      const attackRange = enemy.isBoss ? 60 : 20;
      const cooldown = enemy.isBoss ? 1500 : 2500;
      
      // Attack if within range and cooldown passed
      if (dist < attackRange && now - enemy.lastAttack > cooldown) {
        enemy.attackPlayer(playerPos, delta);
        enemy.lastAttack = now;
      }
      
      // Update fire particles
      if (enemy.isBoss) {
        // Laser particles home towards player
        for (const particle of enemy.fireParticles) {
          if (particle.visible) {
            const dir = new THREE.Vector3().subVectors(playerPos, particle.position).normalize();
            particle.position.add(dir.multiplyScalar(15 * delta));
            particle.userData.life += delta;
            if (particle.userData.life > particle.userData.maxLife) {
              particle.visible = false;
            }
          }
        }
      } else {
        enemy.updateFire(delta);
      }
      
      // Check fire collision with player
      if (enemy.isBoss && enemy.laserLine && enemy.isLaserActive) {
        // Check if player is near laser line
        const laserStart = enemy.position.clone();
        laserStart.y += 5;
        const laserEnd = playerPos.clone();
        
        const toPlayer = new THREE.Vector3().subVectors(playerPos, laserStart);
        const laserDir = new THREE.Vector3().subVectors(laserEnd, laserStart).normalize();
        const projLength = toPlayer.dot(laserDir);
        const closestPoint = laserStart.clone().add(laserDir.clone().multiplyScalar(projLength));
        const distToLaser = playerPos.distanceTo(closestPoint);
        
        if (distToLaser < 2) {
          const fireDamage = 15;
          state.health -= fireDamage;
          updateUI();
          if (state.health <= 0) {
            gameOver();
            return;
          }
        }
      } else if (enemy.fireParticles) {
        for (const particle of enemy.fireParticles) {
          if (particle.visible) {
            const fireDist = particle.position.distanceTo(playerPos);
            const fireDamage = enemy.isBoss ? 8 : 5;
            if (fireDist < 1.5) {
              state.health -= fireDamage;
              updateUI();
              particle.visible = false;
              
              if (state.health <= 0) {
                gameOver();
                return;
              }
            }
          }
        }
      }
    }
    
    // Damage player if too close
    const touchDamage = enemy.isBoss ? 20 : 10;
    if (enemy.position.distanceTo(playerPos) < (enemy.isBoss ? 2.5 : 1.5)) {
      if (enemy.isBoss) {
        // Melee attack logic
        const meleeCooldown = 2000;
        const now = performance.now();
        if (now - enemy.lastMelee > meleeCooldown && !enemy.isMeleeAttacking) {
          enemy.isMeleeAttacking = true;
          enemy.meleeStart = now;
        }
        if (enemy.isMeleeAttacking) {
          const elapsed = now - enemy.meleeStart;
          const progress = Math.min(elapsed / enemy.meleeDuration, 1);
          const raiseAngle = progress * (Math.PI / 2);
          enemy.mesh.children[3].rotation.y = -raiseAngle;
          enemy.mesh.children[4].rotation.y = -raiseAngle;
          if (progress >= 1) {
            enemy.isMeleeAttacking = false;
            enemy.lastMelee = now;
            state.health -= touchDamage;
            updateUI();
            const pushDir = new THREE.Vector3()
              .subVectors(playerPos, enemy.position)
              .normalize();
            player.camera.position.add(pushDir.multiplyScalar(8));
            player.camera.position.y += 4;
            if (state.health <= 0) {
              gameOver();
              return;
            }
            enemy.mesh.children[3].rotation.y = 0;
            enemy.mesh.children[4].rotation.y = 0;
          }
        }
      } else {
        state.health -= touchDamage;
        updateUI();
        
        // Clean up fire particles before removing enemy
        if (enemy.fireParticles) {
          for (const particle of enemy.fireParticles) {
            scene.remove(particle);
          }
        }
        if (enemy.fireTrails) {
          for (const trail of enemy.fireTrails) {
            scene.remove(trail);
          }
        }
        
        // Remove enemy
        scene.remove(enemy.mesh);
        const index = state.enemies.indexOf(enemy);
        state.enemies.splice(index, 1);
        
        if (!state.bossWave) {
          setTimeout(spawnEnemy, 2000);
        }
        
        if (state.health <= 0) {
          gameOver();
          return;
        }
      }
    }
  }
}

function gameOver() {
  state.isPlaying = false;
  state.survivalTime = 0;
  state.lastBossTime = 0;
  const timeDisplay = document.getElementById('survival-time');
  if (timeDisplay) {
    timeDisplay.textContent = '0:00';
  }
  document.exitPointerLock();
  document.getElementById('start-screen').style.display = 'flex';
  document.querySelector('#start-screen h1').textContent = 'GAME OVER';
  document.querySelector('#start-screen p').textContent = 'Score: ' + state.score;
  document.getElementById('start-btn').textContent = 'PLAY AGAIN';
}

// Initialize when DOM is ready
init();