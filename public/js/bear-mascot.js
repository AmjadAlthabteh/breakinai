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

    // Blink animation
    setInterval(() => this.blink(), 3000 + Math.random() * 2000);

    // Random idle animations
    setInterval(() => this.randomIdleAnimation(), 5000);
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
      "Let's find your dream job!",
      "Your resume looks great!",
      "You've got this! 💪",
      "Ready to succeed?",
      "I believe in you!",
      "Let's do this together!",
      "Exciting opportunities await!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
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
