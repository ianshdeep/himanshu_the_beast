import * as THREE from 'three';

export function checkCollision(position, colliders, radius = 0.5) {
  for (const collider of colliders) {
    const dist = new THREE.Vector2(position.x, position.z)
      .distanceTo(new THREE.Vector2(collider.x, collider.z));
    
    if (dist < radius) {
      return true;
    }
  }
  return false;
}