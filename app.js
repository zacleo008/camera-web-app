class CameraApp {
    constructor() {
        this.frontCamera = false;
        this.currentStream = null;
        this.photos = [];
        
        // DOM Elements
        this.elements = {
            cameraView: document.querySelector("#camera-view"),
            cameraDevice: document.querySelector("#camera-device"),
            photoDisplay: document.querySelector("#photo-display"),
            takePhotoButton: document.querySelector("#take-photo-button"),
            frontCameraButton: document.querySelector("#front-camera-button"),
            loadingSpinner: document.querySelector("#loading-spinner"),
            errorMessage: document.querySelector("#error-message"),
            retryButton: document.querySelector("#retry-button"),
            galleryButton: document.querySelector("#gallery-button"),
            galleryModal: document.querySelector("#gallery-modal"),
            closeGallery: document.querySelector("#close-gallery"),
            photosContainer: document.querySelector("#photos-container")
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        window.addEventListener('load', () => this.startCamera());
        this.elements.takePhotoButton.addEventListener('click', () => this.takePhoto());
        this.elements.frontCameraButton.addEventListener('click', () => this.toggleCamera());
        this.elements.retryButton.addEventListener('click', () => this.startCamera());
        this.elements.galleryButton.addEventListener('click', () => this.openGallery());
        this.elements.closeGallery.addEventListener('click', () => this.closeGallery());
    }

    async startCamera() {
        this.showLoading();
        this.hideError();

        try {
            if (this.currentStream) {
                this.currentStream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: this.frontCamera ? "user" : "environment",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.elements.cameraDevice.srcObject = this.currentStream;
            this.hideLoading();
            this.elements.galleryButton.classList.remove('hidden');

        } catch (error) {
            console.error('Camera access error:', error);
            this.showError(this.getCameraErrorMessage(error));
        }
    }

    getCameraErrorMessage(error) {
        switch (error.name) {
            case 'NotAllowedError':
                return 'Camera access denied. Please allow camera access to use this app.';
            case 'NotFoundError':
                return 'No camera found on your device.';
            case 'NotReadableError':
                return 'Camera is already in use by another application.';
            default:
                return 'An error occurred while accessing the camera.';
        }
    }

    takePhoto() {
        const context = this.elements.cameraView.getContext('2d');
        this.elements.cameraView.width = this.elements.cameraDevice.videoWidth;
        this.elements.cameraView.height = this.elements.cameraDevice.videoHeight;
        
        context.save();
        if (this.frontCamera) {
            context.scale(-1, 1);
            context.translate(-this.elements.cameraView.width, 0);
        }
        
        context.drawImage(this.elements.cameraDevice, 0, 0);
        context.restore();

        const photoData = this.elements.cameraView.toDataURL('image/webp');
        this.elements.photoDisplay.src = photoData;
        this.elements.photoDisplay.classList.add('photo-taken');

        // Save to gallery
        this.photos.unshift(photoData);
        this.updateGallery();

        // Animation feedback
        this.elements.takePhotoButton.classList.add('photo-taken-animation');
        setTimeout(() => {
            this.elements.takePhotoButton.classList.remove('photo-taken-animation');
        }, 200);
    }

    toggleCamera() {
        this.frontCamera = !this.frontCamera;
        this.elements.frontCameraButton.querySelector('.button-text').textContent = 
            this.frontCamera ? 'Back Camera' : 'Front Camera';
        this.startCamera();
    }

    updateGallery() {
        this.elements.photosContainer.innerHTML = this.photos
            .map((photo, index) => `
                <div class="photo-item">
                    <img src="${photo}" alt="Photo ${index + 1}">
                </div>
            `).join('');
    }

    openGallery() {
        this.elements.galleryModal.classList.remove('hidden');
        this.updateGallery();
    }

    closeGallery() {
        this.elements.galleryModal.classList.add('hidden');
    }

    showLoading() {
        this.elements.loadingSpinner.classList.remove('hidden');
    }

    hideLoading() {
        this.elements.loadingSpinner.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        this.elements.errorMessage.classList.remove('hidden');
        this.elements.errorMessage.querySelector('p').textContent = message;
    }

    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    }
}

// Initialize the app
const cameraApp = new CameraApp();
