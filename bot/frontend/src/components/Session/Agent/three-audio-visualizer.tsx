import * as THREE from "three";
import { useEffect, useRef } from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import React from "react";

export const ThreeAudioVisualizer = ({ frequency }: { frequency: number }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<THREE.Audio | null>(null);

  useEffect(() => {
    // Initialize Three.js scene
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    mountRef.current?.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10); // Adjusted camera position

    // Set bloom pass and composer
    const params = {
      threshold: 0.6,
      strength: 0.4,
      radius: 0.8,
    };

    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      params.strength,
      params.radius,
      params.threshold
    );

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    bloomComposer.addPass(new OutputPass());

    // Set uniforms for shader
    const uniforms = {
      u_time: { value: 0.0 },
      u_frequency: { value: 0.0 },
      u_red: { value: 0.3 },
      u_green: { value: 0.9 },
      u_blue: { value: 1.0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: document.getElementById("vertexshader")?.textContent ?? "",
      fragmentShader:
        document.getElementById("fragmentshader")?.textContent ?? "",
      wireframe: true,
    });

    const geometry = new THREE.IcosahedronGeometry(1.5, 30);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0); // Ensure the mesh is at the center of the scene
    scene.add(mesh);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      uniforms.u_frequency.value = frequency;

      bloomComposer.render();
      requestAnimationFrame(animate);
    };
    animate();

    // Window resize handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      bloomComposer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement) {
        mountRef.current?.removeChild(renderer.domElement);
      }
    };
  }, [frequency]);

  return (
    <div>
      <div ref={mountRef} />
      <script
        id="vertexshader"
        type="x-shader/x-vertex"
        dangerouslySetInnerHTML={{
          __html: `
          uniform float u_time;
          uniform float u_frequency;

          void main() {
            float noise = 3.0 * u_frequency;
            vec3 newPosition = position + normal * (u_frequency / 10.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        }}
      />
      <script
        id="fragmentshader"
        type="x-shader/x-fragment"
        dangerouslySetInnerHTML={{
          __html: `
          uniform float u_red;
          uniform float u_green;
          uniform float u_blue;

          void main() {
            gl_FragColor = vec4(u_red, u_green, u_blue, 1.0);
          }
        `,
        }}
      />
    </div>
  );
};