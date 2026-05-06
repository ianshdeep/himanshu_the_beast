import * as THREE from 'three';

export function createPlayer(camera) {
  const player = {
    camera,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    speed: 5,
    sensitivity: 0.002,
    pitch: 0,
    yaw: 0,
    // Jump properties
    verticalVelocity: 0,
    gravity: -20,
    jumpForce: 8,
    isGrounded: true,
    eyeHeight: 1.6
  };

  return {
    ...player,
    move(keys, delta, colliders) {
      // Calculate movement direction
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      player.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
      
      const moveDirection = new THREE.Vector3();
      
      if (keys.w) moveDirection.add(forward);
      if (keys.s) moveDirection.sub(forward);
      if (keys.d) moveDirection.add(right);
      if (keys.a) moveDirection.sub(right);
      
      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        
        const newPosition = player.camera.position.clone()
          .add(moveDirection.multiplyScalar(player.speed * delta));
        
        // Simple collision check
        let canMove = true;
        for (const collider of colliders) {
          const dist = new THREE.Vector2(newPosition.x, newPosition.z)
            .distanceTo(new THREE.Vector2(collider.x, collider.z));
          if (dist < 1.5) {
            canMove = false;
            break;
          }
        }
        
        if (canMove) {
          player.camera.position.x = newPosition.x;
          player.camera.position.z = newPosition.z;
        }
      }
      
      // Apply gravity and vertical movement
      player.verticalVelocity += player.gravity * delta;
      player.camera.position.y += player.verticalVelocity * delta;
      
      // Ground check
      if (player.camera.position.y <= player.eyeHeight) {
        player.camera.position.y = player.eyeHeight;
        player.verticalVelocity = 0;
        player.isGrounded = true;
      } else {
        player.isGrounded = false;
      }
    },
    jump() {
      if (player.isGrounded) {
        player.verticalVelocity = player.jumpForce;
        player.isGrounded = false;
      }
    },
    rotate(movementX, movementY) {
      player.yaw -= movementX * player.sensitivity;
      player.pitch -= movementY * player.sensitivity;
      
      // Clamp pitch
      player.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, player.pitch));
      
      // Apply rotation
      player.camera.rotation.order = 'YXZ';
      player.camera.rotation.y = player.yaw;
      player.camera.rotation.x = player.pitch;
    },
    reset() {
      player.camera.position.set(0, player.eyeHeight, 0);
      player.pitch = 0;
      player.yaw = 0;
      player.camera.rotation.set(0, 0, 0);
      player.verticalVelocity = 0;
      player.isGrounded = true;
    }
  };
}