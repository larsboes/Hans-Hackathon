/**
 * Export the Glurak (Charizard) model as .glb
 * Recreates the Three.js geometry from charizard-model.tsx and exports via GLTFExporter.
 */

// Polyfill browser APIs needed by GLTFExporter in Node.js
if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
        this.onload?.({ target: this });
      });
    }
  };
}
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElementNS: () => ({ setAttribute() {}, getContext: () => null }),
  };
}

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWingMembrane(side) {
  const s = side === 'left' ? -1 : 1;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(s * 0.6, 1.2);
  shape.lineTo(s * 2.2, 1.0);
  shape.lineTo(s * 1.8, 0.5);
  shape.lineTo(s * 2.0, 0.2);
  shape.lineTo(s * 1.6, -0.1);
  shape.lineTo(s * 0.8, -0.2);
  shape.lineTo(0, 0);

  const geo = new THREE.ShapeGeometry(shape);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E8650A'),
    emissive: new THREE.Color('#CC4400'),
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(-0.3, 0, 0);
  return mesh;
}

function buildGlurak() {
  const group = new THREE.Group();

  const mat = (color, emissive, emissiveIntensity = 0.2, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(emissive || color),
      emissiveIntensity,
      ...extra,
    });

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 12), mat('#E8650A', '#CC4400'));
  body.scale.set(0.8, 1.0, 0.65);
  group.add(body);

  // Belly
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), mat('#F5D88E', '#D4A844', 0.1));
  belly.position.set(0, -0.1, 0.45);
  belly.scale.set(0.55, 0.8, 0.3);
  group.add(belly);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 1, 8), mat('#E87020', '#CC4400'));
  neck.position.set(0, 1.1, 0.1);
  neck.scale.set(0.35, 0.55, 0.3);
  group.add(neck);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), mat('#E87020', '#CC5500'));
  head.position.set(0, 1.6, 0.15);
  head.scale.set(0.5, 0.42, 0.5);
  group.add(head);

  // Snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), mat('#E8751C', '#CC5500'));
  snout.position.set(0, 1.5, 0.65);
  snout.scale.set(0.32, 0.22, 0.3);
  group.add(snout);

  // Lower jaw
  const jaw = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), mat('#D06818', '#AA4400'));
  jaw.position.set(0, 1.38, 0.55);
  jaw.scale.set(0.25, 0.1, 0.25);
  group.add(jaw);

  // Eyes
  const eyeWhiteMat = mat('#FFFFFF', '#FFFFFF', 0.3);
  const eyePupilMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#111111') });

  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeWhiteMat);
  eyeL.position.set(-0.25, 1.65, 0.5);
  group.add(eyeL);

  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeWhiteMat);
  eyeR.position.set(0.25, 1.65, 0.5);
  group.add(eyeR);

  const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyePupilMat);
  pupilL.position.set(-0.27, 1.65, 0.57);
  group.add(pupilL);

  const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyePupilMat);
  pupilR.position.set(0.27, 1.65, 0.57);
  group.add(pupilR);

  // Horns
  const hornMat = mat('#E87020', '#CC5500');
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 6), hornMat);
  hornL.position.set(-0.22, 1.9, -0.1);
  hornL.rotation.set(0.5, 0, -0.2);
  group.add(hornL);

  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.4, 6), hornMat);
  hornR.position.set(0.22, 1.9, -0.1);
  hornR.rotation.set(0.5, 0, 0.2);
  group.add(hornR);

  // Wings
  const leftWingGroup = new THREE.Group();
  leftWingGroup.position.set(-0.3, 0.8, -0.3);
  leftWingGroup.add(createWingMembrane('left'));
  const leftWingBone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 2.2, 5), mat('#E87020', '#E87020', 0.1));
  leftWingBone.position.set(-1.1, 0.5, -0.05);
  leftWingBone.rotation.set(0, 0, 0.5);
  leftWingGroup.add(leftWingBone);
  group.add(leftWingGroup);

  const rightWingGroup = new THREE.Group();
  rightWingGroup.position.set(0.3, 0.8, -0.3);
  rightWingGroup.add(createWingMembrane('right'));
  const rightWingBone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 2.2, 5), mat('#E87020', '#E87020', 0.1));
  rightWingBone.position.set(1.1, 0.5, -0.05);
  rightWingBone.rotation.set(0, 0, -0.5);
  rightWingGroup.add(rightWingBone);
  group.add(rightWingGroup);

  // Arms
  const armMat = mat('#E8650A', '#CC4400');
  const clawMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#EEE8D0') });

  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.55, 6), armMat);
  armL.position.set(-0.65, 0.2, 0.25);
  armL.rotation.set(-0.2, 0, -0.6);
  group.add(armL);

  const clawL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), clawMat);
  clawL.position.set(-0.9, -0.0, 0.35);
  clawL.rotation.set(-0.4, 0, -0.3);
  group.add(clawL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.55, 6), armMat);
  armR.position.set(0.65, 0.2, 0.25);
  armR.rotation.set(-0.2, 0, 0.6);
  group.add(armR);

  const clawR = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), clawMat);
  clawR.position.set(0.9, -0.0, 0.35);
  clawR.rotation.set(-0.4, 0, 0.3);
  group.add(clawR);

  // Legs
  const legMat = mat('#E8650A', '#CC4400');
  const footMat = mat('#E87020', '#CC5500', 0.15);

  // Left leg
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.65, 7), legMat);
  legL.position.set(-0.35, -0.85, 0.1);
  legL.rotation.set(-0.1, 0, -0.05);
  group.add(legL);

  const footL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), footMat);
  footL.position.set(-0.38, -1.2, 0.3);
  footL.scale.set(0.7, 0.25, 1.0);
  group.add(footL);

  const toeL1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), clawMat);
  toeL1.position.set(-0.48, -1.25, 0.48);
  toeL1.rotation.set(-0.8, 0, -0.2);
  group.add(toeL1);

  const toeL2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), clawMat);
  toeL2.position.set(-0.35, -1.25, 0.5);
  toeL2.rotation.set(-0.8, 0, 0);
  group.add(toeL2);

  // Right leg
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.65, 7), legMat);
  legR.position.set(0.35, -0.85, 0.1);
  legR.rotation.set(-0.1, 0, 0.05);
  group.add(legR);

  const footR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), footMat);
  footR.position.set(0.38, -1.2, 0.3);
  footR.scale.set(0.7, 0.25, 1.0);
  group.add(footR);

  const toeR1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), clawMat);
  toeR1.position.set(0.48, -1.25, 0.48);
  toeR1.rotation.set(-0.8, 0, 0.2);
  group.add(toeR1);

  const toeR2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 4), clawMat);
  toeR2.position.set(0.35, -1.25, 0.5);
  toeR2.rotation.set(-0.8, 0, 0);
  group.add(toeR2);

  // Tail segments
  const tailMat = mat('#E8650A', '#CC4400');
  const tailMat2 = mat('#E87020', '#CC5500');

  const tail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.6, 8), tailMat);
  tail1.position.set(0, -0.4, -0.6);
  tail1.rotation.set(0.8, 0, 0);
  group.add(tail1);

  const tail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.55, 8), tailMat2);
  tail2.position.set(0, -0.15, -1.0);
  tail2.rotation.set(1.1, 0, 0);
  group.add(tail2);

  const tail3 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.45, 8), tailMat2);
  tail3.position.set(0, 0.15, -1.3);
  tail3.rotation.set(1.3, 0, 0);
  group.add(tail3);

  // Tail flame
  const flameOuter = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.55, 8),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF3D00'),
      emissive: new THREE.Color('#FF2200'),
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
    })
  );
  flameOuter.position.set(0, 0.4, -1.5);
  flameOuter.rotation.set(1.3, 0, 0);
  group.add(flameOuter);

  const flameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.35, 8),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFBB00'),
      emissive: new THREE.Color('#FFD700'),
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9,
    })
  );
  flameInner.position.set(0, 0.45, -1.5);
  flameInner.rotation.set(1.3, 0, 0);
  group.add(flameInner);

  return group;
}

async function main() {
  const scene = new THREE.Scene();
  const glurak = buildGlurak();
  scene.add(glurak);

  const exporter = new GLTFExporter();
  const glb = await new Promise((resolve, reject) => {
    exporter.parse(scene, resolve, reject, { binary: true });
  });

  const outPath = path.join(__dirname, '..', 'public', 'assets', '3d', 'glurak.glb');
  const buffer = Buffer.from(glb);
  fs.writeFileSync(outPath, buffer);
  console.log(`Exported glurak.glb (${(buffer.length / 1024).toFixed(1)} KB) → ${outPath}`);
}

main().catch(console.error);
