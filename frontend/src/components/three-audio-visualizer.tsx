import * as THREE from "three";
import { useEffect, useRef } from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import React from "react";

export const ThreeAudioVisualizer = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<THREE.Audio | null>(null); // To reference the sound and stop it later

  useEffect(() => {
    // Initialize Three.js scene
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current?.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, -2, 14);

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

    // Add audio listener and sound
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    soundRef.current = sound; // Save reference to sound
    const audioLoader = new THREE.AudioLoader();

    // Load the audio file
    audioLoader.load("/assets/Beats.mp3", function (buffer) {
      sound.setBuffer(buffer);
      window.addEventListener("click", function () {
        sound.play();
      });
    });

    const analyser = new THREE.AudioAnalyser(sound, 32);

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

    const geometry = new THREE.IcosahedronGeometry(4, 30);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse movement handling
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener("mousemove", (e) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (e.clientX - windowHalfX) / 100;
      mouseY = (e.clientY - windowHalfY) / 100;
    });

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.5;
      camera.lookAt(scene.position);

      uniforms.u_time.value = clock.getElapsedTime();
      uniforms.u_frequency.value = analyser.getAverageFrequency();

      bloomComposer.render();
      requestAnimationFrame(animate);
    };
    animate();

    // Window resize handling
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      bloomComposer.setSize(window.innerWidth, window.innerHeight);
    });

    // Clean up on unmount
    return () => {
      // Stop sound when leaving the page
      if (soundRef.current && soundRef.current.isPlaying) {
        soundRef.current.stop();
      }

      window.removeEventListener("resize", () => {});
      document.removeEventListener("mousemove", () => {});
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

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

          vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }
          
          vec4 mod289(vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
          }
          
          vec4 permute(vec4 x) {
            return mod289(((x*34.0)+10.0)*x);
          }
          
          vec4 taylorInvSqrt(vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
          }
          
          vec3 fade(vec3 t) {
            return t*t*t*(t*(t*6.0-15.0)+10.0);
          }
          
          float pnoise(vec3 P, vec3 rep) {
            vec3 Pi0 = mod(floor(P), rep);
            vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
            Pi0 = mod289(Pi0);
            Pi1 = mod289(Pi1);
            vec3 Pf0 = fract(P);
            vec3 Pf1 = Pf0 - vec3(1.0);
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 * (1.0 / 7.0);
            vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
            vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
            vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
            vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));

            vec3 fade_xyz = fade(Pf0);
            float n_xyz = mix(n000, n100, fade_xyz.x);
            return 2.2 * n_xyz;
          }

          void main() {
            float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
            float displacement = (u_frequency / 30.0) * (noise / 10.0);
            vec3 newPosition = position + normal * displacement;
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
