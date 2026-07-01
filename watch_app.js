// Sony Chronos-1 Smartwatch Scrollytelling Script
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas3d');
  const ctx = canvas.getContext('2d');
  
  const loaderBar = document.getElementById('loaderBar');
  const loaderPercent = document.getElementById('loaderPercent');
  const preloader = document.getElementById('preloader');
  const navbar = document.getElementById('navbar');
  const scrollHint = document.getElementById('scrollHint');
  const ambientGlow = document.getElementById('ambientGlow');
  
  const imageSources = ['./watch_1.png', './watch_2.png', './watch_3.png'];
  const images = [];
  let loadedCount = 0;
  
  // Set fixed internal drawing dimensions
  canvas.width = 1280;
  canvas.height = 720;

  // Preload keyframe images
  function preloadImages() {
    imageSources.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        const progress = (loadedCount / imageSources.length) * 100;
        loaderBar.style.width = `${progress}%`;
        loaderPercent.innerText = `${Math.round(progress)}%`;
        
        if (loadedCount === imageSources.length) {
          setTimeout(initApp, 400);
        }
      };
      img.onerror = () => {
        console.error('Error loading image ' + src);
        loadedCount++;
        if (loadedCount === imageSources.length) {
          setTimeout(initApp, 400);
        }
      };
      images.push(img);
    });
  }

  // Animation variables
  let currentProgress = 0;
  let targetProgress = 0;
  const lerpFactor = 0.07;
  let isIdle = true;

  function initApp() {
    preloader.style.opacity = '0';
    preloader.style.transform = 'translateY(-100vh)';
    
    setTimeout(() => {
      preloader.style.display = 'none';
      navbar.style.opacity = '1';
    }, 1200);

    renderProgress(0);
    window.addEventListener('scroll', handleScroll, { passive: true });
    startRenderLoop();
  }

  // Render a specific progress value (0.0 to 1.0)
  function renderProgress(progress) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Map overall progress to 3 keyframes
    // progress 0.00 to 0.15: Fully Assembled (Keyframe 1)
    // progress 0.15 to 0.80: Disassembling (Interpolate Keyframe 1 -> 2 -> 3)
    // progress 0.80 to 1.00: Reassembling (Interpolate Keyframe 3 -> 2 -> 1)
    let relativeProgress = 0;
    
    if (progress < 0.15) {
      // Show first frame
      drawSingleImage(images[0]);
    } else if (progress >= 0.15 && progress < 0.80) {
      relativeProgress = (progress - 0.15) / (0.80 - 0.15); // 0.0 to 1.0
      drawInterpolated(relativeProgress);
    } else {
      relativeProgress = (progress - 0.80) / (1.00 - 0.80); // 0.0 to 1.0
      drawInterpolated(1 - relativeProgress); // Reverse the fade
    }
  }

  function drawSingleImage(img) {
    if (img && img.complete) {
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  function drawInterpolated(t) {
    // t goes from 0.0 (assembled) to 1.0 (fully exploded)
    if (t < 0.5) {
      // Fade keyframe 1 -> keyframe 2
      const fade = t / 0.5; // 0.0 to 1.0
      
      ctx.globalAlpha = 1.0 - fade;
      ctx.drawImage(images[0], 0, 0, canvas.width, canvas.height);
      
      ctx.globalAlpha = fade;
      ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height);
    } else {
      // Fade keyframe 2 -> keyframe 3
      const fade = (t - 0.5) / 0.5; // 0.0 to 1.0
      
      ctx.globalAlpha = 1.0 - fade;
      ctx.drawImage(images[1], 0, 0, canvas.width, canvas.height);
      
      ctx.globalAlpha = fade;
      ctx.drawImage(images[2], 0, 0, canvas.width, canvas.height);
    }
    ctx.globalAlpha = 1.0; // Reset
  }

  function startRenderLoop() {
    function tick() {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) > 0.001) {
        isIdle = false;
        currentProgress += diff * lerpFactor;
        renderProgress(currentProgress);
      } else if (!isIdle) {
        currentProgress = targetProgress;
        renderProgress(currentProgress);
        isIdle = true;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function handleScroll() {
    const scrollTrack = document.getElementById('overview');
    const scrollTrackRect = scrollTrack.getBoundingClientRect();
    const trackHeight = scrollTrackRect.height;
    
    const scrollTop = window.scrollY;
    const maxScroll = trackHeight - window.innerHeight;
    const progress = Math.min(1.0, Math.max(0.0, scrollTop / maxScroll));

    targetProgress = progress;

    if (scrollTop > 40) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }

    if (progress > 0.04) {
      scrollHint.style.opacity = '0';
    } else {
      scrollHint.style.opacity = '1';
    }

    updateNarrativeBeats(progress);
    updateAmbientGlow(progress);
  }

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

  function updateAmbientGlow(progress) {
    if (progress < 0.15) {
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 80, 255, 0.08) 0%, rgba(0, 214, 255, 0.02) 40%, rgba(0, 0, 0, 0) 70%)';
    } else if (progress >= 0.15 && progress < 0.40) {
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 214, 255, 0.06) 0%, rgba(0, 80, 255, 0.02) 40%, rgba(0, 0, 0, 0) 70%)';
    } else if (progress >= 0.40 && progress < 0.65) {
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 214, 255, 0.09) 0%, rgba(0, 0, 0, 0) 60%)';
    } else if (progress >= 0.65 && progress < 0.80) {
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 80, 255, 0.12) 0%, rgba(0, 214, 255, 0.03) 50%, rgba(0, 0, 0, 0) 70%)';
    } else {
      ambientGlow.style.background = 'radial-gradient(circle, rgba(0, 80, 255, 0.14) 0%, rgba(0, 214, 255, 0.06) 30%, rgba(0, 0, 0, 0) 60%)';
    }
  }

  preloadImages();
});
