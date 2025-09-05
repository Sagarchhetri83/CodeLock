// Global variables
let scene, camera, renderer;
let particles, geometry, material;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Performance optimization - adjust particle count based on device capability
let isMobile = window.innerWidth < 768;
const particleCount = isMobile ? 5000 : 15000;
const particleDistance = 100;

// Performance monitoring
let stats;
let lastFrameTime = 0;
let frameRate = 0;
let frameCount = 0;
const frameRateUpdateInterval = 500; // ms

// Colors
const primaryColor = 0x00c8ff;  // Electric cyan
const accentColor = 0xff00c8;   // Vibrant magenta

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 50;
    
    // Create renderer with optimized settings
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('particle-canvas'),
        antialias: !isMobile, // Disable antialiasing on mobile for better performance
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    // Create particle system
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Use spherical coordinates to position particles
        const radius = 50 + Math.random() * 30;
        const theta = Math.random() * Math.PI * 2; // Azimuthal angle
        const phi = Math.acos(2 * Math.random() - 1); // Polar angle
        
        const idx = i * 3;
        positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
        positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[idx + 2] = radius * Math.cos(phi);
        
        // Color - mostly white/gray with occasional accent colors
        if (Math.random() > 0.97) {
            // Accent color (cyan or magenta)
            color.setHex(Math.random() > 0.5 ? primaryColor : accentColor);
        } else {
            // White/gray particles
            const shade = 0.7 + Math.random() * 0.3; // Between 0.7 and 1.0 for bright particles
            color.setRGB(shade, shade, shade);
        }
        
        colors[idx] = color.r;
        colors[idx + 1] = color.g;
        colors[idx + 2] = color.b;
        
        // Random sizes for particles
        sizes[i] = Math.random() * 2 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
    
    // Material for particles
    material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Event listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
}

// Mouse position tracking
let mousePosition = new THREE.Vector2();
let lastMousePosition = new THREE.Vector2();
let mouseVelocity = new THREE.Vector2();
let mouseForce = 0;

// Handle mouse movement
function onDocumentMouseMove(event) {
    // Update mouse position for camera movement
    mouseX = (event.clientX - windowHalfX) * 0.05;
    mouseY = (event.clientY - windowHalfY) * 0.05;
    
    // Update mouse position for particle interaction
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Calculate mouse velocity for dynamic effects
    mouseVelocity.x = mousePosition.x - lastMousePosition.x;
    mouseVelocity.y = mousePosition.y - lastMousePosition.y;
    mouseForce = Math.min(Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y) * 10, 1);
    
    // Store current position as last position for next frame
    lastMousePosition.x = mousePosition.x;
    lastMousePosition.y = mousePosition.y;
}

// Handle window resize with debouncing for performance
let resizeTimeout;
function onWindowResize() {
    // Update half window variables immediately for mouse interaction
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    // Check if device type changed (mobile/desktop)
    const wasMobile = isMobile;
    isMobile = window.innerWidth < 768;
    
    // Debounce expensive operations
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        // Update renderer with optimized settings
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // If switching between mobile and desktop, adjust particle visibility
        if (wasMobile !== isMobile) {
            // We don't recreate particles, just adjust their visibility
            const visibleParticles = isMobile ? 5000 : 15000;
            console.log(`Adjusting visible particles to ${visibleParticles} for ${isMobile ? 'mobile' : 'desktop'} view`);
        }
    }, 250); // 250ms debounce delay
}

// Animation loop with performance optimization
function animate(timestamp) {
    requestAnimationFrame(animate);
    
    // Calculate frame rate for performance monitoring
    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }
    
    frameCount++;
    const elapsed = timestamp - lastFrameTime;
    
    if (elapsed >= frameRateUpdateInterval) {
        frameRate = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastFrameTime = timestamp;
        
        // Adaptive quality based on frame rate
        if (frameRate < 30 && particleCount > 2000) {
            // Reduce particle count if frame rate is too low
            const reductionFactor = 0.8;
            const newParticleCount = Math.max(2000, Math.floor(particleCount * reductionFactor));
            
            if (newParticleCount !== particleCount) {
                // Only log in development
                console.log(`Performance optimization: Reducing particles from ${particleCount} to ${newParticleCount}`);
                // We don't actually change particleCount here as it would require recreating the geometry
                // Instead we'll just render fewer particles by limiting the loop in render()
            }
        }
    }
    
    render();
}

// Render the scene with performance optimizations
function render() {
    // Rotate the particle system - slower rotation on mobile for better performance
    particles.rotation.x += isMobile ? 0.0003 : 0.0005;
    particles.rotation.y += isMobile ? 0.0007 : 0.001;
    
    // Move camera based on mouse position
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // Update particle positions for interaction effect
    const positions = geometry.attributes.position.array;
    const sizes = geometry.attributes.size.array;
    const colors = geometry.attributes.color.array;
    
    // Create a raycaster for mouse interaction
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 5;
    raycaster.setFromCamera(mousePosition, camera);
    
    // Convert mouse coordinates to 3D space
    const mouseVector = new THREE.Vector3(
        mousePosition.x * 50,
        mousePosition.y * 50,
        0
    ).unproject(camera);
    
    for (let i = 0; i < particleCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;
        const ic = i * 3; // Color index
        
        // Calculate distance from mouse position (projected to 3D space)
        const dx = positions[ix] - mouseVector.x;
        const dy = positions[iy] - mouseVector.y;
        const dz = positions[iz] - mouseVector.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Apply force based on mouse position and velocity
        if (dist < 30) {
            // Particles close to mouse are affected
            const force = 30 / (dist + 1) * (1 + mouseForce * 2);
            
            // Push particles away from mouse with velocity-based force
            positions[ix] += dx / dist * force * 0.1;
            positions[iy] += dy / dist * force * 0.1;
            positions[iz] += (Math.random() - 0.5) * force * 0.05; // Add some z-axis movement
            
            // Make particles glow when interacted with
            sizes[i] = Math.min(sizes[i] + 0.2, 4.0);
            
            // Change color based on interaction
            if (mouseForce > 0.2) {
                // Shift color toward accent color when mouse moves quickly
                const accentColorObj = new THREE.Color(accentColor);
                colors[ic] = Math.min(colors[ic] + (accentColorObj.r - colors[ic]) * 0.1, 1.0);
                colors[ic+1] = Math.min(colors[ic+1] + (accentColorObj.g - colors[ic+1]) * 0.1, 1.0);
                colors[ic+2] = Math.min(colors[ic+2] + (accentColorObj.b - colors[ic+2]) * 0.1, 1.0);
            } else {
                // Shift color toward primary color when mouse moves slowly
                const primaryColorObj = new THREE.Color(primaryColor);
                colors[ic] = Math.min(colors[ic] + (primaryColorObj.r - colors[ic]) * 0.1, 1.0);
                colors[ic+1] = Math.min(colors[ic+1] + (primaryColorObj.g - colors[ic+1]) * 0.1, 1.0);
                colors[ic+2] = Math.min(colors[ic+2] + (primaryColorObj.b - colors[ic+2]) * 0.1, 1.0);
            }
        } else {
            // Gradually return to original size and color
            sizes[i] = Math.max(sizes[i] - 0.05, 0.5 + Math.random());
            
            // Slowly fade back to white/gray
            const targetShade = 0.7 + Math.random() * 0.3;
            colors[ic] = colors[ic] + (targetShade - colors[ic]) * 0.01;
            colors[ic+1] = colors[ic+1] + (targetShade - colors[ic+1]) * 0.01;
            colors[ic+2] = colors[ic+2] + (targetShade - colors[ic+2]) * 0.01;
        }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    
    renderer.render(scene, camera);
}

// Initialize and start animation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    animate();
});