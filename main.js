import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Delaunator from 'delaunator';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

console.log("Three.js is loading...");
console.log(THREE);

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 3;

// Generate random points on a sphere
function generatePoints(numPoints) {
    let points = [];
    for (let i = 0; i < numPoints; i++) {
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.acos(2 * Math.random() - 1);
        let x = Math.sin(phi) * Math.cos(theta);
        let y = Math.sin(phi) * Math.sin(theta);
        let z = Math.cos(phi);
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
}

const numPoints = 500;
const points = generatePoints(numPoints);

// Convert points to flat array for Delaunay triangulation
const flatPoints = points.flatMap(p => [p.x, p.y, p.z]);
const delaunay = Delaunator.from(flatPoints);

// Create geometry from Delaunay triangulation
const geometry = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < delaunay.triangles.length; i += 3) {
    let a = delaunay.triangles[i];
    let b = delaunay.triangles[i + 1];
    let c = delaunay.triangles[i + 2];
    vertices.push(points[a].x, points[a].y, points[a].z);
    vertices.push(points[b].x, points[b].y, points[b].z);
    vertices.push(points[c].x, points[c].y, points[c].z);
}
geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

// Compute normals for better shading
geometry.computeVertexNormals();

// Create material with basic shading
const material = new THREE.MeshStandardMaterial({ color: 0x0088ff, wireframe: false, flatShading: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});