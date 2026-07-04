document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('header');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Header change color on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Active section highligher on scroll
  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // ==========================================
  // FLOATING PARTICLES BACKGROUND
  // ==========================================
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 50;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(168, 85, 247, 0.25)' : 'rgba(6, 182, 212, 0.25)';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      // Draw lines between close particles
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            let opacity = (1 - (distance / 120)) * 0.15;
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }

    init();
    animateParticles();
  }



  // ==========================================
  // RETRO SNAKE GAME MODAL & LOGIC
  // ==========================================
  const modal = document.getElementById('game-modal');
  const playButton = document.getElementById('play-snake-btn');
  const closeModalButton = document.getElementById('close-game-modal');
  const gameCanvas = document.getElementById('game-canvas');

  if (modal && playButton && closeModalButton && gameCanvas) {
    const gameCtx = gameCanvas.getContext('2d');
    
    // Game dimensions (300x300 canvas size, 15x15 grid of 20px cells)
    const gridSize = 20; 
    const tileCount = gameCanvas.width / gridSize; // 15
    
    let snake = [];
    let food = { x: 0, y: 0 };
    let dx = gridSize; // current horizontal speed
    let dy = 0;        // current vertical speed
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval = null;
    let isGameRunning = false;
    let gameSpeed = 130; // ms per update

    // Elements
    const currentScoreVal = document.getElementById('current-score');
    const highScoreVal = document.getElementById('high-score');
    highScoreVal.textContent = highScore;

    // Show/hide game modal
    playButton.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Stop page scrolling
      resetGame();
      startGame();
    });

    closeModalButton.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Resume page scrolling
      stopGame();
    });

    // Handle keypresses
    window.addEventListener('keydown', handleKeydown);

    // Mobile on-screen control listeners
    document.getElementById('mobile-key-up').addEventListener('click', () => changeDirection(0, -gridSize));
    document.getElementById('mobile-key-left').addEventListener('click', () => changeDirection(-gridSize, 0));
    document.getElementById('mobile-key-down').addEventListener('click', () => changeDirection(0, gridSize));
    document.getElementById('mobile-key-right').addEventListener('click', () => changeDirection(gridSize, 0));

    function handleKeydown(e) {
      if (!isGameRunning) return;
      
      const key = e.key;
      const goingUp = dy === -gridSize;
      const goingDown = dy === gridSize;
      const goingRight = dx === gridSize;
      const goingLeft = dx === -gridSize;

      if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && !goingRight) {
        dx = -gridSize;
        dy = 0;
        e.preventDefault();
      }
      if ((key === 'ArrowUp' || key === 'w' || key === 'W') && !goingDown) {
        dx = 0;
        dy = -gridSize;
        e.preventDefault();
      }
      if ((key === 'ArrowRight' || key === 'd' || key === 'D') && !goingLeft) {
        dx = gridSize;
        dy = 0;
        e.preventDefault();
      }
      if ((key === 'ArrowDown' || key === 's' || key === 'S') && !goingUp) {
        dx = 0;
        dy = gridSize;
        e.preventDefault();
      }
    }

    function changeDirection(newDx, newDy) {
      if (!isGameRunning) return;
      const goingRight = dx === gridSize;
      const goingLeft = dx === -gridSize;
      const goingDown = dy === gridSize;
      const goingUp = dy === -gridSize;

      if (newDx === -gridSize && goingRight) return;
      if (newDx === gridSize && goingLeft) return;
      if (newDy === -gridSize && goingDown) return;
      if (newDy === gridSize && goingUp) return;

      dx = newDx;
      dy = newDy;
    }

    function startGame() {
      isGameRunning = true;
      gameInterval = setInterval(gameStep, gameSpeed);
    }

    function stopGame() {
      isGameRunning = false;
      clearInterval(gameInterval);
    }

    function resetGame() {
      snake = [
        { x: gridSize * 3, y: gridSize * 3 },
        { x: gridSize * 2, y: gridSize * 3 },
        { x: gridSize * 1, y: gridSize * 3 }
      ];
      dx = gridSize;
      dy = 0;
      score = 0;
      currentScoreVal.textContent = score;
      spawnFood();
    }

    function spawnFood() {
      food.x = Math.floor(Math.random() * tileCount) * gridSize;
      food.y = Math.floor(Math.random() * tileCount) * gridSize;

      // Make sure food does not spawn on the snake body
      snake.forEach(part => {
        const hasEaten = part.x === food.x && part.y === food.y;
        if (hasEaten) spawnFood();
      });
    }

    function gameStep() {
      if (hasGameEnded()) {
        gameOver();
        return;
      }

      clearCanvas();
      drawFood();
      moveSnake();
      drawSnake();
    }

    function clearCanvas() {
      gameCtx.fillStyle = '#05040a';
      gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    }

    function drawSnake() {
      snake.forEach((part, index) => {
        // Head is neon green, body cells are slightly transparent
        gameCtx.fillStyle = index === 0 ? '#4ade80' : '#166534';
        gameCtx.fillRect(part.x, part.y, gridSize - 2, gridSize - 2);
        
        // Inner detail style
        if (index === 0) {
          gameCtx.fillStyle = '#000';
          gameCtx.fillRect(part.x + 4, part.y + 4, 3, 3);
          gameCtx.fillRect(part.x + 12, part.y + 4, 3, 3);
        }
      });
    }

    function drawFood() {
      gameCtx.fillStyle = '#ef4444'; // Red food
      gameCtx.beginPath();
      // Draw round food
      const centerX = food.x + gridSize / 2;
      const centerY = food.y + gridSize / 2;
      const radius = gridSize / 2 - 2;
      gameCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      gameCtx.fill();
    }

    function moveSnake() {
      // Calculate new head position
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };
      snake.unshift(head);

      // Check if snake ate food
      const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
      if (hasEatenFood) {
        score += 10;
        currentScoreVal.textContent = score;
        if (score > highScore) {
          highScore = score;
          highScoreVal.textContent = highScore;
          localStorage.setItem('snakeHighScore', highScore);
        }
        spawnFood();
        
        // Accelerate speed slightly as score increases
        if (gameSpeed > 60) {
          stopGame();
          gameSpeed -= 4;
          startGame();
        }
      } else {
        // Remove tail cell if food wasn't eaten
        snake.pop();
      }
    }

    function hasGameEnded() {
      // Check wall collision
      const head = snake[0];
      const hitLeft = head.x < 0;
      const hitRight = head.x >= gameCanvas.width;
      const hitTopt = head.y < 0;
      const hitBottom = head.y >= gameCanvas.height;

      if (hitLeft || hitRight || hitTopt || hitBottom) return true;

      // Check self collision
      for (let i = 4; i < snake.length; i++) {
        const hitSelf = snake[i].x === head.x && snake[i].y === head.y;
        if (hitSelf) return true;
      }

      return false;
    }

    function gameOver() {
      stopGame();
      
      // Draw Game Over text Overlay
      gameCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
      
      gameCtx.fillStyle = '#ef4444';
      gameCtx.font = 'bold 20px "Outfit", sans-serif';
      gameCtx.textAlign = 'center';
      gameCtx.fillText('GAME OVER', gameCanvas.width / 2, gameCanvas.height / 2 - 10);
      
      gameCtx.fillStyle = '#ffffff';
      gameCtx.font = '13px "Inter", sans-serif';
      gameCtx.fillText('Click to Play Again', gameCanvas.width / 2, gameCanvas.height / 2 + 20);
      
      // Add restart click event to canvas
      gameCanvas.addEventListener('click', restartClickEvent);
    }

    function restartClickEvent() {
      gameCanvas.removeEventListener('click', restartClickEvent);
      gameSpeed = 130;
      resetGame();
      startGame();
    }
  }
});
