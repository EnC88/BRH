class PhotoParallax3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.plane = null;
        this.texture = null;

        this.photoFile = null;
        this.videoStream = null;
        this.capturedPhotoBlob = null;

        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEventListeners();
        this.updateStatus('Ready to create 3D photo');
        this.startCamera();
    }

    setupEventListeners() {
        document.getElementById('camera-btn').addEventListener('click', () => this.startCamera());
        document.getElementById('upload-btn').addEventListener('click', () => document.getElementById('file-input').click());
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.photoFile = e.target.files[0];
            if (this.photoFile) this.createScene();
        });
        document.getElementById('new-photo-btn').addEventListener('click', () => this.resetToMainMenu());
        document.getElementById('close-camera').addEventListener('click', () => this.closeCamera());
        document.getElementById('capture-btn').addEventListener('click', () => this.capturePhoto());

        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
        });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = (touch.clientY / window.innerHeight) * 2 - 1;
        });
    }

    updateStatus(message) {
        document.getElementById('status-bar').textContent = message;
    }

    async startCamera() {
        try {
            this.updateStatus('Starting camera...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            this.videoStream = stream;
            const videoElement = document.getElementById('video');
            videoElement.srcObject = stream;
            videoElement.play();
            document.getElementById('camera-interface').classList.add('active');
            this.updateStatus('Camera ready - tap to capture');
        } catch (error) {
            console.error('Error starting camera:', error);
            this.updateStatus(`Camera error: ${error.message}`);
        }
    }

    closeCamera() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        document.getElementById('camera-interface').classList.remove('active');
        this.updateStatus('Ready to create 3D photo');
    }

    capturePhoto() {
        if (!this.videoStream) { this.updateStatus('Camera not active'); return; }
        const video = document.getElementById('video');
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            this.updateStatus('Video not ready yet, please wait...');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            if (!blob) { this.updateStatus('Failed to capture photo'); return; }
            this.capturedPhotoBlob = blob;
            this.closeCamera();
            this.createScene();
        }, 'image/jpeg', 0.9);
    }

    async createScene() {
        if (!this.photoFile && !this.capturedPhotoBlob) { this.updateStatus('No photo available'); return; }

        document.getElementById('main-ui').classList.add('hidden');
        document.getElementById('loading').classList.add('active');
        this.updateStatus('Creating 3D scene...');

        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.set(0, 0, 50);

            this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.toneMapping = THREE.NoToneMapping;
            this.renderer.outputEncoding = THREE.LinearEncoding;
            document.getElementById('three-container').appendChild(this.renderer.domElement);

            const loader = new THREE.TextureLoader();
            this.texture = await new Promise((resolve, reject) => {
                const url = this.photoFile ? URL.createObjectURL(this.photoFile) : URL.createObjectURL(this.capturedPhotoBlob);
                loader.load(url, resolve, undefined, reject);
            });
            this.texture.minFilter = THREE.LinearFilter;
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.generateMipmaps = false;

            const aspect = this.texture.image.width / this.texture.image.height;
            
            const width = 200;
            const height = width / aspect;
            const widthSegments = 32;
            const heightSegments = 16;
            const curveIntensity = 0.7;
            
            const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
            
            const positions = geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);
                
                const distanceFromCenter = Math.sqrt(x * x + y * y);
                const maxDistance = Math.sqrt((width/2) * (width/2) + (height/2) * (height/2));
                const normalizedDistance = distanceFromCenter / maxDistance;
                
                const newZ = z + (normalizedDistance * normalizedDistance * curveIntensity * 20);
                positions.setZ(i, newZ);
            }
            positions.needsUpdate = true;

            const material = new THREE.MeshBasicMaterial({ 
                map: this.texture, 
                side: THREE.DoubleSide
            });
            
            this.plane = new THREE.Mesh(geometry, material);
            this.plane.position.set(0, 0, 0);
            this.scene.add(this.plane);

            this.scene.background = new THREE.Color(0x000000);

            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });

            this.animate();

            document.getElementById('loading').classList.remove('active');
            document.getElementById('controls-info').classList.remove('hidden');
            this.updateStatus('3D scene ready! Move mouse to look around');

        } catch (error) {
            console.error('Error creating scene:', error);
            this.updateStatus(`Error: ${error.message}`);
            document.getElementById('loading').classList.remove('active');
            document.getElementById('main-ui').classList.remove('hidden');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.scene || !this.camera || !this.renderer || !this.plane) return;

        const horizontalRange = 0.25;
        const verticalRange = 0.20;
        
        const targetRotationY = this.mouseX * horizontalRange;
        const targetRotationX = this.mouseY * verticalRange;

        this.camera.rotation.y += (targetRotationY - this.camera.rotation.y) * 0.08;
        this.camera.rotation.x += (targetRotationX - this.camera.rotation.x) * 0.08;

        this.renderer.render(this.scene, this.camera);
    }

    resetToMainMenu() {
        if (this.scene) {
            this.scene.traverse(o => {
                if (o.isMesh) {
                    o.geometry.dispose();
                    o.material.dispose();
                }
            });
            this.scene = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
            const container = document.getElementById('three-container');
            if (container.firstChild) container.removeChild(container.firstChild);
            this.renderer = null;
        }

        this.camera = null;
        this.plane = null;
        this.texture = null;
        this.photoFile = null;
        this.capturedPhotoBlob = null;

        document.getElementById('main-ui').classList.remove('hidden');
        document.getElementById('controls-info').classList.add('hidden');
        document.getElementById('loading').classList.remove('active');
        this.updateStatus('Ready to create 3D photo');
    }
}

document.addEventListener('DOMContentLoaded', () => { new PhotoParallax3D(); });