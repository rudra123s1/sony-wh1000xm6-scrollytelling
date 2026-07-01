// Sony WH-1000XM6 Scrollytelling Script
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas3d');
  const ctx = canvas.getContext('2d');
  
  const loaderBar = document.getElementById('loaderBar');
  const loaderPercent = document.getElementById('loaderPercent');
  const preloader = document.getElementById('preloader');
  const navbar = document.getElementById('navbar');
  const scrollHint = document.getElementById('scrollHint');
  const ambientGlow = document.getElementById('ambientGlow');
  
  const totalFrames = 240;
  const images = [];
  let loadedCount = 0;
  
  // Set fixed internal drawing dimensions for the 16:9 widescreen asset
  canvas.width = 1280;
  canvas.height = 720;

  // Preload all 240 image frames in sequence
  function preloadImages() {
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameStr = String(i).padStart(3, '0');
      img.src = `./ezgif-frame-${frameStr}.jpg`;
      
      img.onload = onFrameLoad;
      img.onerror = onFrameError;
      
      images.push(img);
    }
  }

  function onFrameLoad() {
    loadedCount++;
    const progress = (loadedCount / totalFrames) * 100;
    
    // Update loader UI
    loaderBar.style.width = `${progress}%`;
    loaderPercent.innerText = `${Math.round(progress)}%`;
    
    if (loadedCount === totalFrames) {
      setTimeout(initApp, 400); // Small delay to let animations look premium
    }
  }

  function onFrameError(e) {
    console.error('Failed to load frame', e);
    // Continue loading process to avoid freezing the UI if a frame is missing
    onFrameLoad();
  }

  // Animation & Scroll variables
  let currentFrameIndex = 0;
  let targetFrameIndex = 0;
  const lerpFactor = 0.07; // Custom easing weight for scrolling physics
  let isIdle = true;
  
  // Start the application after preloading
  function initApp() {
    // Hide preloader with smooth transition
    preloader.style.opacity = '0';
    preloader.style.transform = 'translateY(-100vh)';
    
    setTimeout(() => {
      preloader.style.display = 'none';
      // Fade in the top navigation bar
      navbar.style.opacity = '1';
    }, 1200);

    // Initial render
    drawFrame(0);
    
    // Bind scroll & resize listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Start drawing loop
    startDrawingLoop();
  }

  // Draw image on canvas
  function drawFrame(index) {
    const frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.floor(index)));
    const img = images[frameIndex];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  // Buttery-smooth animation loop using linear interpolation (lerp)
  function startDrawingLoop() {
    function tick() {
      // Calculate difference between current and target frame index
      const diff = targetFrameIndex - currentFrameIndex;
      
      if (Math.abs(diff) > 0.01) {
        isIdle = false;
        currentFrameIndex += diff * lerpFactor;
        drawFrame(currentFrameIndex);
      } else if (!isIdle) {
        currentFrameIndex = targetFrameIndex;
        drawFrame(currentFrameIndex);
        isIdle = true;
      }
      
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Scroll handler that maps page coordinates to frames and text overlays
  function handleScroll() {
    const scrollTrack = document.getElementById('overview');
    const scrollTrackRect = scrollTrack.getBoundingClientRect();
    const trackHeight = scrollTrackRect.height;
    
    // Calculate progress as a ratio (0.0 to 1.0) of the sticky container length
    const scrollTop = window.scrollY;
    const maxScroll = trackHeight - window.innerHeight;
    const progress = Math.min(1.0, Math.max(0.0, scrollTop / maxScroll));

    // Map scroll percentage to frame index
    // 0.00 - 0.15: Hero beauty view (First Frame)
    // 0.15 - 0.80: Exploding disassembly (Frame 1 to 240)
    // 0.80 - 1.00: Reassembling components (Frame 240 back to 1)
    if (progress < 0.15) {
      targetFrameIndex = 0;
    } else if (progress >= 0.15 && progress < 0.80) {
      const scale = (progress - 0.15) / (0.80 - 0.15);
      targetFrameIndex = scale * (totalFrames - 1);
    } else {
      const scale = (progress - 0.80) / (1.00 - 0.80);
      targetFrameIndex = (1 - scale) * (totalFrames - 1);
    }

    // Update glassmorphic navbar styling on scroll
    if (scrollTop > 40) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }

    // Hide scroll instruction mouse hint after initial scroll
    if (progress > 0.04) {
      scrollHint.style.opacity = '0';
    } else {
      scrollHint.style.opacity = '1';
    }

    // Update text content block states based on active zones
    updateNarrativeBeats(progress);

    // Subtle adaptive background glows depending on story phase
    updateAmbientGlow(progress);
  }

  // Synchronize text overlays with current scroll status
  const beats = [
    { id: 'beat-hero', start: 0.00, end: 0.15 },
    { id: 'beat-engineering', start: 0.15, end: 0.40 },
    { id: 'beat-anc', start: 0.40, end: 0.65 },
    { id: 'beat-sound', start: 0.65, end: 0.80 },
    { id: 'beat-cta', start: 0.80, end: 1.00 }
  ];

  function updateNarrativeBeats(progress) {
    beats.forEach(beat => {
      const element = document.getElementById(beat.id);
      if (progress >= beat.start && progress <= beat.end) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
  }

  // Dynamically change ambient radial glows based on scrolly beats
  function updateAmbientGlow(progress) {
    if (progress < 0.15) {
      // Hero: default faint cyan-blue glow
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 80, 255, 0.08) 0%, rgba(0, 214, 255, 0.02) 40%, rgba(0, 0, 0, 0) 70%)';
    } else if (progress >= 0.15 && progress < 0.40) {
      // Engineering: subtle technical layout glow
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 214, 255, 0.06) 0%, rgba(0, 80, 255, 0.02) 40%, rgba(0, 0, 0, 0) 70%)';
    } else if (progress >= 0.40 && progress < 0.65) {
      // ANC: electric cyan highlight centered on control cards
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 214, 255, 0.09) 0%, rgba(0, 0, 0, 0) 60%)';
    } else if (progress >= 0.65 && progress < 0.80) {
      // Sound: deeper audio blue resonance
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 80, 255, 0.12) 0%, rgba(0, 214, 255, 0.03) 50%, rgba(0, 0, 0, 0) 70%)';
    } else {
      // CTA: Bright cinematic spotlight
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 80, 255, 0.14) 0%, rgba(0, 214, 255, 0.06) 30%, rgba(0, 0, 0, 0) 60%)';
    }
  }

  // Kick off loading process
  preloadImages();
});
