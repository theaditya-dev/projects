import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface AnimatedBlockchainBackgroundProps {
  intensity?: 'high' | 'medium' | 'subtle' | 'minimal';
}

export const AnimatedBlockchainBackground: React.FC<AnimatedBlockchainBackgroundProps> = ({
  intensity = 'high',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure Black Digital Void
    scene.fog = new THREE.FogExp2(0x000000, 0.018);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch (e) {
      console.warn('WebGL not supported, falling back to static CSS background');
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a192f, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.PointLight(0x38bdf8, 3.5, 60);
    mainLight.position.set(0, 15, 10);
    scene.add(mainLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.5, 50);
    cyanLight.position.set(-15, 5, -5);
    scene.add(cyanLight);

    const blueLight = new THREE.PointLight(0x2563eb, 2.0, 50);
    blueLight.position.set(15, -5, -10);
    scene.add(blueLight);

    // 4. Cube Geometries & Chromatic Edge Materials (Reference Style)
    // Structure of 3D Blockchain Blocks
    interface CubeNode {
      group: THREE.Group;
      basePos: THREE.Vector3;
      rotSpeed: THREE.Vector3;
      driftFreq: number;
      driftAmp: number;
      driftPhase: number;
    }

    const cubeNodes: CubeNode[] = [];
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    // Dark Translucent Glass Core Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x091424,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.85,
      transparent: true,
      opacity: 0.82,
      ior: 1.5,
      reflectivity: 0.8,
      clearcoat: 0.3,
    });

    // Primary Illuminated Cyan Edge Material
    const primaryEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
      transparent: true,
      opacity: 0.95,
    });

    // Chromatic Aberration Edge Materials (RGB Shift like in reference)
    const redShiftMaterial = new THREE.LineBasicMaterial({
      color: 0xf43f5e, // Red / Magenta fringe
      transparent: true,
      opacity: 0.45,
    });

    const blueShiftMaterial = new THREE.LineBasicMaterial({
      color: 0x06b6d4, // Cyan fringe
      transparent: true,
      opacity: 0.55,
    });

    const greenShiftMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981, // Green / Emerald fringe
      transparent: true,
      opacity: 0.35,
    });

    // Generate 3D Grid Topology conforming to reference
    // Define lattice coordinates in 3D space
    const gridPositions: [number, number, number][] = [
      // Central Cluster
      [0, 0, 0],
      [4, 0, 0],
      [0, 0, 4],
      [4, 0, 4],
      // Upper Tier
      [-4, 4, -4],
      [0, 4, -4],
      [4, 4, -4],
      [-4, 4, 0],
      [6, 4, 2],
      [-6, 4, 2],
      // Lower Tier & Strands
      [-3, -4, 2],
      [2, -4, 3],
      [-5, -4, -3],
      [5, -4, -3],
      // Outer Extensions
      [-8, 2, 4],
      [8, 2, -2],
      [-8, -2, -4],
      [7, 3, 6],
      [-2, 6, 2],
      [3, 6, -2],
    ];

    // Determine scale and count based on intensity & device
    const isMobile = window.innerWidth < 768;
    const positionsToUse = isMobile
      ? gridPositions.slice(0, 10)
      : intensity === 'minimal'
      ? gridPositions.slice(0, 8)
      : intensity === 'subtle'
      ? gridPositions.slice(0, 14)
      : gridPositions;

    const baseCubeSize = 1.55;

    positionsToUse.forEach((pos, index) => {
      const nodeGroup = new THREE.Group();
      const isCentral = index < 4;
      const size = isCentral ? baseCubeSize * 1.15 : baseCubeSize * (0.85 + Math.random() * 0.3);

      // 1. Dark Glass Mesh Core
      const boxGeo = new THREE.BoxGeometry(size, size, size);
      const boxMesh = new THREE.Mesh(boxGeo, glassMaterial);
      nodeGroup.add(boxMesh);

      // 2. Primary Illuminated Edges
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      const edgesMesh = new THREE.LineSegments(edgesGeo, primaryEdgeMaterial);
      nodeGroup.add(edgesMesh);

      // 3. Chromatic RGB Edge Separation Layers (Visual Reference Realization)
      const redShift = new THREE.LineSegments(edgesGeo, redShiftMaterial);
      redShift.position.set(0.04, 0.04, 0.01);
      nodeGroup.add(redShift);

      const blueShift = new THREE.LineSegments(edgesGeo, blueShiftMaterial);
      blueShift.position.set(-0.04, -0.04, -0.01);
      nodeGroup.add(blueShift);

      const greenShift = new THREE.LineSegments(edgesGeo, greenShiftMaterial);
      greenShift.position.set(0.02, -0.02, 0.03);
      nodeGroup.add(greenShift);

      // Position Node
      const vec = new THREE.Vector3(pos[0] * 1.4, pos[1] * 1.4, pos[2] * 1.4);
      nodeGroup.position.copy(vec);

      cubeGroup.add(nodeGroup);

      cubeNodes.push({
        group: nodeGroup,
        basePos: vec.clone(),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.002
        ),
        driftFreq: 0.4 + Math.random() * 0.6,
        driftAmp: 0.2 + Math.random() * 0.25,
        driftPhase: Math.random() * Math.PI * 2,
      });
    });

    // 5. Connecting Lines & Flowing Pulses between Nodes
    interface ConnectionEdge {
      source: THREE.Group;
      target: THREE.Group;
      line: THREE.Line;
      pulseDist: number; // 0 to 1
      hasPulse: boolean;
      pulseSpeed: number;
    }

    const connections: ConnectionEdge[] = [];
    const connectionGroup = new THREE.Group();
    scene.add(connectionGroup);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.38,
    });

    const maxConnectDistance = 8.5;

    for (let i = 0; i < cubeNodes.length; i++) {
      for (let j = i + 1; j < cubeNodes.length; j++) {
        const n1 = cubeNodes[i];
        const n2 = cubeNodes[j];
        const dist = n1.basePos.distanceTo(n2.basePos);

        if (dist <= maxConnectDistance) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            n1.group.position,
            n2.group.position,
          ]);
          const line = new THREE.Line(lineGeo, lineMaterial);
          connectionGroup.add(line);

          connections.push({
            source: n1.group,
            target: n2.group,
            line,
            pulseDist: Math.random(),
            hasPulse: Math.random() > 0.4,
            pulseSpeed: 0.002 + Math.random() * 0.004,
          });
        }
      }
    }

    // 6. Moving Light Pulses (Small glowing particles traveling on lines)
    const pulseGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });

    const pulseMeshes: { mesh: THREE.Mesh; edge: ConnectionEdge }[] = [];

    connections.forEach((edge) => {
      if (edge.hasPulse) {
        const pMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
        scene.add(pMesh);
        pulseMeshes.push({ mesh: pMesh, edge });
      }
    });

    // 7. Subtle Floor Reflection Grid
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x020408,
      roughness: 0.4,
      metalness: 0.8,
      transparent: true,
      opacity: 0.4,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -8;
    scene.add(floorMesh);

    // 8. Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 14;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // 9. Resize Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Animate Individual Cubes (Subtle organic drift & 3D rotation)
        cubeNodes.forEach((node) => {
          node.group.rotation.x += node.rotSpeed.x;
          node.group.rotation.y += node.rotSpeed.y;
          node.group.rotation.z += node.rotSpeed.z;

          // Smooth vertical & lateral floating oscillation
          const floatY = Math.sin(elapsedTime * node.driftFreq + node.driftPhase) * node.driftAmp;
          const floatX = Math.cos(elapsedTime * (node.driftFreq * 0.8) + node.driftPhase) * (node.driftAmp * 0.5);

          node.group.position.set(
            node.basePos.x + floatX,
            node.basePos.y + floatY,
            node.basePos.z
          );
        });

        // Update Connecting Line Geometries
        connections.forEach((conn) => {
          const positions = conn.line.geometry.attributes.position;
          if (positions) {
            positions.setXYZ(0, conn.source.position.x, conn.source.position.y, conn.source.position.z);
            positions.setXYZ(1, conn.target.position.x, conn.target.position.y, conn.target.position.z);
            positions.needsUpdate = true;
          }
        });

        // Update Moving Light Pulses
        pulseMeshes.forEach(({ mesh, edge }) => {
          edge.pulseDist += edge.pulseSpeed;
          if (edge.pulseDist > 1) edge.pulseDist = 0;

          mesh.position.lerpVectors(
            edge.source.position,
            edge.target.position,
            edge.pulseDist
          );
        });

        // Subtle Camera Drift & Mouse Parallax
        targetCameraX = mouseX * 2.5;
        targetCameraY = 14 - mouseY * 2.0;

        // Slow cinematic orbit
        const orbitAngle = elapsedTime * 0.04;
        const orbitRadius = 26;

        camera.position.x += (Math.sin(orbitAngle) * 3.5 + targetCameraX - camera.position.x) * 0.02;
        camera.position.y += (targetCameraY + Math.cos(orbitAngle * 0.7) * 1.5 - camera.position.y) * 0.02;
        camera.position.z = orbitRadius + Math.cos(orbitAngle) * 2.5;

        camera.lookAt(0, 0, 0);

        // Slow breathing glow on point lights
        mainLight.intensity = 3.0 + Math.sin(elapsedTime * 1.2) * 0.8;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 11. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Geometries and Materials
      scene.clear();
      renderer.dispose();
    };
  }, [intensity]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black"
      style={{
        background: '#000000',
      }}
    >
      {/* Readability Vignette: Soft gradient overlay ensuring center text remains crisp */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />
    </div>
  );
};
