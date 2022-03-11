import './style.css'
import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { LayerMaterial, Base, Depth, Fresnel, Noise } from 'lamina/dist/vanilla'
import { Vector3 } from 'three'

//const gui = new dat.GUI();
let canvas_width = window.innerWidth;
let canvas_height = window.innerHeight * 3;
const settings = {
  speed: 0.07,
  density: 2,
  strength: 0.5,
  frequency: 2.0,
  amplitude: 7.0, 
};
  //gui.add(settings, 'speed', 0.1, 1, 0.01);
  //gui.add(settings, 'density', 0, 10, 0.01);
  //gui.add(settings, 'strength', 0, 2, 0.01);

const noise = `
//
// Description : Array and textureless GLSL 2D/3D/4D simplex 
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20201014 (stegu)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+10.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v, vec3 gradient)
{
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  vec4 m2 = m * m;
  vec4 m4 = m2 * m2;
  vec4 pdotx = vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3));

// Determine noise gradient
  vec4 temp = m2 * m * pdotx;
  gradient = -8.0 * (temp.x * x0 + temp.y * x1 + temp.z * x2 + temp.w * x3);
  gradient += m4.x * p0 + m4.y * p1 + m4.z * p2 + m4.w * p3;
  gradient *= 105.0;

  return 105.0 * dot(m4, pdotx);
}`; 

const rotation = `
  mat3 rotation3dY(float angle) {
    float s = sin(angle);
    float c = cos(angle);

    return mat3(
      c, 0.0, -s,
      0.0, 1.0, 0.0,
      s, 0.0, c
    );
  }
  
  vec3 rotateY(vec3 v, float angle) {
    return rotation3dY(angle) * v;
  }  
`;

const vertexShader = `  
  varying vec3 vNormal;
  
  uniform float uTime;
  uniform float uSpeed;
  uniform float uNoiseDensity;
  uniform float uNoiseStrength;
  uniform float uFrequency;
  uniform float uAmplitude;
  
  ${noise}
  ${rotation}

  void main() {
    float t = uTime * uSpeed;
    float distortion = snoise((normal + t) * uNoiseDensity, vec3(10.0)) * uNoiseStrength;
    float angle = sin(uv.y * uFrequency + t) * uAmplitude;
    vec3 pos = position + (normal * distortion);
    pos = rotateY(pos, angle); 
    
    vNormal = abs(normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }  
`;

const fragmentShader = `
  varying vec3 vNormal;
  
  uniform float uTime;
  
  void main() {

    gl_FragColor = vec4(1, 1, 1, 1.0);
  }  
`;
    let targetX = 0;
    let targetY = 0;
class Scene {
  constructor() {

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, canvas_height);
    //this.renderer.setClearColor('black', 0);
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / canvas_height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 10);    
    
    this.scene = new THREE.Scene();
    
    this.clock = new THREE.Clock();
    //this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.init();
    this.animate();
  }
  
  init() {
    this.addCanvas();
    this.addElements();
    this.addEvents();
   
  } 
  
  addCanvas() {
    const canvas = this.renderer.domElement;
    canvas.classList.add('webgl');
    document.body.appendChild(canvas);
  }  
  
  addElements() {
    //abstract sphere
    
    const geometry = new THREE.IcosahedronBufferGeometry(1, 64);
    const material = new LayerMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: settings.speed },
        uNoiseDensity: { value: settings.density },
        uNoiseStrength: { value: settings.strength },
        uFrequency: { value: settings.frequency },
        uAmplitude: { value: settings.amplitude },
      },
      wireframe: false,
      layers: [
          new Base({
            color: '#d9d9d9',
            alpha: 1,
            mode: 'normal',
          }),
          new Depth({
            colorA: '#002f4b',
            colorB: '#f2fdff',
            alpha: 1,
            mode: 'multiply',
            near: 0,
            far: 2,
            origin: new Vector3(1, 1, 1),
          }),
          new Fresnel({
            color: '#bffbff',
            alpha: 1,
            mode: 'softlight',
            power: 2,
            intensity: 1,
            bias: 0.1,
          }),
          new Noise({
            colorA: '#a3a3a3',
            alpha: 0.1,
            mode: 'normal',
            scale: 1,
          }),
            ]
      
    });
    this.mesh = new THREE.Mesh(geometry, material);

    //particle system
    const vertices = [];
    
    for(let i = 0; i < 20000; i++){

      let x = (Math.random() - 0.5) * 10;
      let y = (Math.random() - 0.5) * 10;
      let z = (Math.random() - 0.5) * 10;

      vertices.push(x, y ,z);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));
    
    const particleMat = new THREE.PointsMaterial({
      size: 0.007
    });
    
    this.particleMesh = new THREE.Points(particleGeo, particleMat);

    // Image Loader

    // const loader = new THREE.TextureLoader();
    // const imgPlane =  new THREE.PlaneBufferGeometry(5, 1.3);
    // for (let i = 0; i < 3; i++){
    //   const imgMaterial = new THREE.MeshBasicMaterial({
    //     map: loader.load(`/blackhole/${i}.png`)
    //   })
    //   const img = new THREE.Mesh(imgPlane, imgMaterial)
    //   img.position.set(1, i*1.8)
    //   this.scene.add(img);
    // }
    
    //add meshes to scene here
    this.scene.add(this.particleMesh, this.mesh)
  }
  
  addEvents() {
    window.addEventListener('resize', this.resize.bind(this));
    document.addEventListener('mousemove', this.onDocumentMouseMove);
  }
  
  
  resize() {
    let width = window.innerWidth;
    let height = canvas_height;

    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);

    this.camera.updateProjectionMatrix();
  }
  
  onDocumentMouseMove(){
    let mouseX = 0;
    let mouseY = 0;

    

    const windowX = window.innerWidth / 2;
    const windowY = canvas_height / 2;

    mouseX = (event.clientX - windowX);
    mouseY = (event.clientY - windowY);

    targetX = mouseX * 0.001
    targetY = mouseY * 0.001

    
}

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    //this.controls.update();

    // Update uniforms
    this.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.mesh.material.uniforms.uSpeed.value = settings.speed;    
    this.mesh.material.uniforms.uNoiseDensity.value = settings.density;
    this.mesh.material.uniforms.uNoiseStrength.value = settings.strength;
    this.mesh.material.uniforms.uFrequency.value = settings.frequency;
    this.mesh.material.uniforms.uAmplitude.value = settings.amplitude;


    this.mesh.rotation.x = 0.5 * this.clock.getElapsedTime();
    this.mesh.rotation.y = 0.5 * this.clock.getElapsedTime();
    this.particleMesh.rotation.x = 0.2 * this.clock.getElapsedTime();
    this.particleMesh.rotation.y = 0.2 * this.clock.getElapsedTime();

    //console.log(this.clock.getElapsedTime());

    // PROBLEM WITH THIS PART
    this.mesh.rotation.x = 0.5 * (targetY - this.mesh.rotation.x);
    this.mesh.rotation.y = 0.5 * (targetX - this.mesh.rotation.y);
    this.mesh.rotation.z = 0.5 * (targetY - this.mesh.rotation.x);
    this.particleMesh.rotation.x = 0.5 * (targetX - this.particleMesh.rotation.y);
    this.particleMesh.rotation.y = 0.5 * (targetY - this.particleMesh.rotation.x);
    this.particleMesh.rotation.z = 0.5 * (targetX - this.particleMesh.rotation.y);
     
    this.renderer.render(this.scene, this.camera);
    //console.log(targetX, targetY);
  }  
}

new Scene();