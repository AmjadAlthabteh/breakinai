/**
 * Cute Bear Mascot Animation System
 * Creates an adorable animated bear companion
 */

class BearMascot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.createBear();
    this.addBehaviors();
  }

  createBear() {
    const bearHTML = `
      <div class="bear-mascot" id="bearMascot">
        <div class="bear-body">
          <div class="bear-head">
            <div class="bear-ear bear-ear-left"></div>
            <div class="bear-ear bear-ear-right"></div>
            <div class="bear-face">
              <div class="bear-eyes">
                <div class="bear-eye bear-eye-left">
                  <div class="bear-pupil"></div>
                </div>
                <div class="bear-eye bear-eye-right">
                  <div class="bear-pupil"></div>
                </div>
              </div>
              <div class="bear-snout">
                <div class="bear-nose"></div>
                <div class="bear-mouth"></div>
              </div>
              <div class="bear-blush bear-blush-left"></div>
              <div class="bear-blush bear-blush-right"></div>
            </div>
          </div>
          <div class="bear-torso">
            <div class="bear-belly"></div>
            <div class="bear-paw bear-paw-left"></div>
            <div class="bear-paw bear-paw-right"></div>
          </div>
        </div>
        <div class="bear-speech-bubble" style="display: none;">
          <p class="bear-message"></p>
        </div>
      </div>
    `;

    this.container.innerHTML = bearHTML;
    this.bear = document.getElementById('bearMascot');
    this.speechBubble = this.bear.querySelector('.bear-speech-bubble');
    this.message = this.bear.querySelector('.bear-message');
  }

  addBehaviors() {
    // Bear waves when hovered
    this.bear.addEventListener('mouseenter', () => {
      this.bear.classList.add('bear-waving');
      this.showMessage(this.getRandomMessage());
      setTimeout(() => {
        this.bear.classList.remove('bear-waving');
      }, 1500);
    });

    // Bear celebrates when clicked
    this.bear.addEventListener('click', () => {
      this.celebrate();
      this.showMessage("You're awesome! 🎉✨");
    });

    // Track mouse movement for eyes
    document.addEventListener('mousemove', (e) => this.trackMouse(e));

    // Blink animation
    setInterval(() => this.blink(), 3000 + Math.random() * 2000);

    // Random idle animations - MORE FREQUENT!
    setInterval(() => this.randomIdleAnimation(), 4000);

    // Random encouragement messages
    setInterval(() => this.randomEncouragement(), 20000);

    // Celebrate on page load after a delay
    setTimeout(() => {
      this.celebrate();
      this.showMessage("Welcome! Let's find your dream job! 🚀");
    }, 1500);
  }

  blink() {
    const eyes = this.bear.querySelectorAll('.bear-eye');
    eyes.forEach(eye => eye.classList.add('blinking'));
    setTimeout(() => {
      eyes.forEach(eye => eye.classList.remove('blinking'));
    }, 200);
  }

  randomIdleAnimation() {
    const animations = ['bear-bounce', 'bear-tilt-head', 'bear-happy'];
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    this.bear.classList.add(randomAnim);
    setTimeout(() => {
      this.bear.classList.remove(randomAnim);
    }, 1000);
  }

  showMessage(text) {
    this.message.textContent = text;
    this.speechBubble.style.display = 'block';
    setTimeout(() => {
      this.speechBubble.style.display = 'none';
    }, 3000);
  }

  getRandomMessage() {
    const messages = [
      "Hi there! 👋",
      "Let's find your dream job! 🎯",
      "Your resume looks great! ⭐",
      "You've got this! 💪",
      "Ready to succeed? 🚀",
      "I believe in you! 💙",
      "Let's do this together! 🤝",
      "Exciting opportunities await! ✨",
      "You're doing amazing! 🌟",
      "Keep going! 💫",
      "Success is near! 🎊",
      "I'm here to help! 🐻"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  randomEncouragement() {
    const encouragements = [
      "Don't give up! 💪",
      "You're making great progress! 🌟",
      "Keep pushing forward! 🚀",
      "I'm cheering for you! 📣",
      "Almost there! ✨",
      "You can do it! 💙"
    ];
    this.showMessage(encouragements[Math.floor(Math.random() * encouragements.length)]);
  }

  trackMouse(e) {
    const pupils = this.bear.querySelectorAll('.bear-pupil');
    const bearRect = this.bear.getBoundingClientRect();
    const bearCenterX = bearRect.left + bearRect.width / 2;
    const bearCenterY = bearRect.top + bearRect.height / 2;

    const angle = Math.atan2(e.clientY - bearCenterY, e.clientX - bearCenterX);
    const distance = Math.min(2, Math.hypot(e.clientX - bearCenterX, e.clientY - bearCenterY) / 500);

    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;

    pupils.forEach(pupil => {
      pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  celebrate() {
    this.bear.classList.add('bear-celebrating');
    this.showMessage("Woohoo! 🎉");
    setTimeout(() => {
      this.bear.classList.remove('bear-celebrating');
    }, 2000);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const bearContainer = document.getElementById('bear-container');
    if (bearContainer) {
      window.bearMascot = new BearMascot('bear-container');
    }
  });
} else {
  const bearContainer = document.getElementById('bear-container');
  if (bearContainer) {
    window.bearMascot = new BearMascot('bear-container');
  }
}
