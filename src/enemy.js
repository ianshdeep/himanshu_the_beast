import * as THREE from 'three';



export function createEnemy(scene, playerPosition) {
  // Create detailed enemy mesh (armored soldier)
  const enemyGroup = new THREE.Group();
  
  // Materials
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
  
  
  
  // Your photo (after you add it)
  const textureLoader = new THREE.TextureLoader();
  const faceTexture = textureLoader.load('/textures/face.jpg');
  const faceMaterial = new THREE.MeshBasicMaterial({
  map: faceTexture,
  roughness: 0.6,
  metalness: 0.1
});
const facePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(0.9, 0.8),
  faceMaterial
);
facePlane.position.set(0, 1.62, 0.31); // in front of the visor area
enemyGroup.add(facePlane);
  
  const accentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xff3300,
    emissive: 0xff3300,
    emissiveIntensity: 0.3
  });
  
  // ==================== BODY ====================
  // Torso armor
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.1, 0.55),
    armorMaterial
  );
  torso.position.y = 0.85;
  enemyGroup.add(torso);
  
  // Chest plate
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.6, 0.15),
    armorMaterial
  );
  chestPlate.position.set(0, 1.0, 0.3);
  enemyGroup.add(chestPlate);
  
  // Abdomen
  const abdomen = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.4, 0.4),
    suitMaterial
  );
  abdomen.position.y = 0.4;
  enemyGroup.add(abdomen);
  
  // ==================== HEAD ====================
  
  
  
  
  // ==================== ARMS ====================
  // Left shoulder pad
  const leftShoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    armorMaterial
  );
  leftShoulder.scale.set(1, 0.8, 0.8);
  leftShoulder.position.set(-0.55, 1.2, 0);
  enemyGroup.add(leftShoulder);
  
  // Right shoulder pad
  const rightShoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    armorMaterial
  );
  rightShoulder.scale.set(1, 0.8, 0.8);
  rightShoulder.position.set(0.55, 1.2, 0);
  enemyGroup.add(rightShoulder);
  
  // Left arm
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 0.7, 8),
    suitMaterial
  );
  leftArm.position.set(-0.55, 0.75, 0);
  enemyGroup.add(leftArm);
  
  // Right arm
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 0.7, 8),
    suitMaterial
  );
  rightArm.position.set(0.55, 0.75, 0);
  enemyGroup.add(rightArm);
  
  // Left forearm
  const leftForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8),
    armorMaterial
  );
  leftForearm.position.set(-0.55, 0.25, 0.1);
  leftForearm.rotation.x = 0.3;
  enemyGroup.add(leftForearm);
  
  // Right forearm (weapon arm)
  const rightForearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8),
    armorMaterial
  );
  rightForearm.position.set(0.55, 0.25, 0.1);
  rightForearm.rotation.x = 0.3;
  enemyGroup.add(rightForearm);
  
  // ==================== LEGS ====================
  // Left thigh
  const leftThigh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8),
    suitMaterial
  );
  leftThigh.position.set(-0.2, 0.0, 0);
  enemyGroup.add(leftThigh);
  
  // Right thigh
  const rightThigh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 0.6, 8),
    suitMaterial
  );
  rightThigh.position.set(0.2, 0.0, 0);
  enemyGroup.add(rightThigh);
  
  // Left knee
  const leftKnee = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    armorMaterial
  );
  leftKnee.position.set(-0.2, -0.35, 0);
  enemyGroup.add(leftKnee);
  
  // Right knee
  const rightKnee = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    armorMaterial
  );
  rightKnee.position.set(0.2, -0.35, 0);
  enemyGroup.add(rightKnee);
  
  // Left shin
  const leftShin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.13, 0.5, 8),
    suitMaterial
  );
  leftShin.position.set(-0.2, -0.65, 0);
  enemyGroup.add(leftShin);
  
  // Right shin
  const rightShin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.13, 0.5, 8),
    suitMaterial
  );
  rightShin.position.set(0.2, -0.65, 0);
  enemyGroup.add(rightShin);
  
  // Left boot
  const leftBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.15, 0.35),
    armorMaterial
  );
  leftBoot.position.set(-0.2, -0.92, 0.05);
  enemyGroup.add(leftBoot);
  
  // Right boot
  const rightBoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.15, 0.35),
    armorMaterial
  );
  rightBoot.position.set(0.2, -0.92, 0.05);
  enemyGroup.add(rightBoot);
  
  // ==================== WEAPON ====================
  // Gun held by enemy
  const gunBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.12, 0.4),
    armorMaterial
  );
  gunBody.position.set(0.55, 0.35, 0.25);
  gunBody.rotation.x = -0.5;
  enemyGroup.add(gunBody);
  
  // Gun barrel
  const gunBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8),
    armorMaterial
  );
  gunBarrel.position.set(0.55, 0.45, 0.45);
  gunBarrel.rotation.x = -0.5;
  enemyGroup.add(gunBarrel);
  
  // ==================== ACCENTS ====================
  // Chest light
  const chestLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    accentMaterial
  );
  chestLight.position.set(0, 1.15, 0.35);
  enemyGroup.add(chestLight);
  
  // Back pack / battery pack
  const backPack = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.6, 0.2),
    suitMaterial
  );
  backPack.position.set(0, 0.9, -0.35);
  enemyGroup.add(backPack);
  
  // Random spawn position away from player
  const angle = Math.random() * Math.PI * 2;
  const distance = 15 + Math.random() * 10;
  const x = playerPosition.x + Math.cos(angle) * distance;
  const z = playerPosition.z + Math.sin(angle) * distance;
  
  enemyGroup.position.set(x, 0, z);
  scene.add(enemyGroup);
  
  // ==================== REALISTIC FIRE BREATH SYSTEM ====================
  const fireParticles = [];
  const fireTrails = [];
  
  // Create fire particle pool
  for (let i = 0; i < 50; i++) {
    const size = 0.05 + Math.random() * 0.15;
    const fireParticle = new THREE.Mesh(
      new THREE.SphereGeometry(size, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.9
      })
    );
    fireParticle.visible = false;
    fireParticle.userData = {
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 0.5 + Math.random() * 0.5,
      baseSize: size
    };
    scene.add(fireParticle);
    fireParticles.push(fireParticle);
    
    // Trail particle
    const trail = new THREE.Mesh(
      new THREE.SphereGeometry(size * 0.5, 6, 6),
      new THREE.MeshBasicMaterial({
        color: 0xff3300,
        transparent: true,
        opacity: 0.6
      })
    );
    trail.visible = false;
    trail.userData = { velocity: new THREE.Vector3(), life: 0, maxLife: 0.3 };
    scene.add(trail);
    fireTrails.push(trail);
  }
  
  // Fire glow light
  const fireLight = new THREE.PointLight(0xff4400, 0, 5);
  fireLight.position.set(0, 1.2, 0.5);
  enemyGroup.add(fireLight);
  
  // Firebreath attack function
  function attackPlayer(targetPos, delta) {
    const direction = new THREE.Vector3()
      .subVectors(targetPos, enemyGroup.position)
      .normalize();
    
    for (let i = 0; i < 8; i++) {
      for (const particle of fireParticles) {
        if (!particle.visible) {
          particle.visible = true;
          particle.position.copy(enemyGroup.position);
          particle.position.y += 1.0;
          
          const spread = 0.4;
          direction.x += (Math.random() - 0.5) * spread;
          direction.y += (Math.random() - 0.5) * spread * 0.5;
          direction.z += (Math.random() - 0.5) * spread;
          direction.normalize();
          
          particle.userData.velocity.copy(direction).multiplyScalar(6 + Math.random() * 4);
          particle.userData.life = 0;
          
          const colors = [0xff6600, 0xff4400, 0xff2200, 0xffaa00];
          particle.material.color.setHex(colors[Math.floor(Math.random() * colors.length)]);
          particle.material.opacity = 0.9;
          
          break;
        }
      }
    }
    
    fireLight.intensity = 2;
  }
  
  // Update fire particles
  function updateFire(delta) {
    if (fireLight.intensity > 0) {
      fireLight.intensity -= delta * 4;
      if (fireLight.intensity < 0) fireLight.intensity = 0;
    }
    
    for (let i = 0; i < fireParticles.length; i++) {
      const particle = fireParticles[i];
      const trail = fireTrails[i];
      
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
          
          if (!trail.visible) {
            trail.visible = true;
            trail.position.copy(particle.position);
            trail.userData.life = 0;
          }
        }
      }
      
      if (trail.visible) {
        trail.userData.life += delta;
        if (trail.userData.life > trail.userData.maxLife) {
          trail.visible = false;
        } else {
          const trailRatio = trail.userData.life / trail.userData.maxLife;
          trail.material.opacity = 0.6 * (1 - trailRatio);
        }
      }
    }
  }
  
  return {
    mesh: enemyGroup,
    position: enemyGroup.position,
    fireParticles,
    fireTrails,
    attackPlayer,
    updateFire,
    lastAttack: 0,
    attackCooldown: 2500
  };
}