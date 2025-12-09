/**
 * Script pour la page d'accueil de Focus Chronométré
 * Gère les animations et interactions spécifiques à la homepage
 */

class HomepageManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.init();
    }

    init() {
        console.log('🏠 Page d\'accueil initialisée');

        // Initialisation du thème
        this.initTheme();

        // Animation des stats
        this.animateStats();

        // Animation au scroll
        this.setupScrollAnimations();

        // Gestion des modals
        this.setupModals();

        // Animation du preview
        this.setupPreviewAnimation();
    }

    /**
     * Initialise le thème
     */
    initTheme() {
        // Récupère le thème sauvegardé ou utilise 'light' par défaut
        const savedTheme = localStorage.getItem('theme') || 'light';

        // Applique le thème
        this.setTheme(savedTheme);

        // Écoute le bouton de thème
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Synchronise avec l'application si besoin
        this.syncWithAppTheme();
    }

    /**
     * Change le thème
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            if (this.themeToggle) {
                this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        } else {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            if (this.themeToggle) {
                this.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }

        // Sauvegarde dans localStorage
        localStorage.setItem('theme', theme);

        // Sauvegarde aussi dans un cookie pour partage entre pages
        document.cookie = `theme=${theme}; path=/; max-age=31536000`;

        console.log(`🎨 Thème changé: ${theme}`);
    }

    /**
     * Bascule entre thème clair et sombre
     */
    toggleTheme() {
        const isDark = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        this.setTheme(newTheme);

        // Animation du bouton
        this.animateThemeToggle();
    }

    /**
     * Anime le bouton de thème
     */
    animateThemeToggle() {
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.themeToggle.style.transform = '';
            }, 300);
        }
    }

    /**
     * Synchronise avec le thème de l'application
     */
    syncWithAppTheme() {
        // Vérifie si un thème est déjà défini dans l'application
        const appTheme = localStorage.getItem('theme');
        if (appTheme) {
            this.setTheme(appTheme);
        }

        // Écoute les changements de thème depuis d'autres pages
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.setTheme(e.newValue);
            }
        });
    }

    // ... reste des méthodes existantes ...


    /**
     * Anime les nombres dans la section about
     */
    animateStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statElements = entry.target.querySelectorAll('.stat-number');
                    statElements.forEach(stat => {
                        this.animateNumber(stat);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const aboutSection = document.querySelector('.about-stats');
        if (aboutSection) {
            observer.observe(aboutSection);
        }
    }

    /**
     * Anime un nombre de 0 à sa valeur finale
     */
    animateNumber(element) {
        const target = parseInt(element.getAttribute('data-count')) || 0;
        if (target <= 0) {
            element.textContent = '0';
            return;
        }

        // Animation via requestAnimationFrame pour garantir une variation visible
        const duration = 1500; // durée en ms
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const value = Math.floor(eased * target);
            element.textContent = value.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                element.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(tick);
    }

    /**
     * Configure les animations au scroll
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe les éléments à animer
        document.querySelectorAll('.feature-card, .step, .cycle-item').forEach(el => {
            observer.observe(el);
        });

        // Ajoute les styles d'animation
        this.addAnimationStyles();
    }

    /**
     * Ajoute les styles CSS pour les animations
     */
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .feature-card, .step, .cycle-item {
                opacity: 0;
                transform: translateY(30px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .feature-card.animate-in,
            .step.animate-in,
            .cycle-item.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .step:nth-child(1) { transition-delay: 0.1s; }
            .step:nth-child(2) { transition-delay: 0.2s; }
            .step:nth-child(3) { transition-delay: 0.3s; }
            .step:nth-child(4) { transition-delay: 0.4s; }
            
            .cycle-item:nth-child(1) { transition-delay: 0.1s; }
            .cycle-item:nth-child(3) { transition-delay: 0.2s; }
            .cycle-item:nth-child(5) { transition-delay: 0.3s; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configure les modals
     */
    setupModals() {
        // Gestion des modals dynamiques (simplifié)
        document.querySelectorAll('a[onclick*="Modal"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Ici vous pourriez créer des modals dynamiques
                this.showSimpleModal('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.');
            });
        });
    }

    /**
     * Affiche un modal simple
     */
    showSimpleModal(title, message) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content small-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="this.closest('.modal').style.display='none'">
                    Fermer
                </button>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    /**
     * Anime le preview de l'application
     */
    setupPreviewAnimation() {
        const previewTimer = document.querySelector('.preview-time');
        const previewCircle = document.querySelector('.preview-circle');

        if (!previewTimer || !previewCircle) return;
        // Animation du timer (état centralisé pour contrôles)
        if (!this.preview) {
            this.preview = {
                minutes: 25,
                seconds: 0,
                running: true,
                intervalId: null,
                totalSeconds: 25 * 60
            };
        }

        const updatePreviewTimer = () => {
            if (!this.preview.running) return;

            if (this.preview.seconds === 0) {
                if (this.preview.minutes === 0) {
                    // Cycle terminé — réinitialise et bascule le label
                    this.preview.minutes = 25;
                    const modeElement = document.querySelector('.preview-mode');
                    if (modeElement) {
                        modeElement.textContent = modeElement.textContent === 'Focus' ? 'Pause' : 'Focus';
                    }
                } else {
                    this.preview.minutes--;
                    this.preview.seconds = 59;
                }
            } else {
                this.preview.seconds--;
            }

            previewTimer.textContent = `${this.preview.minutes.toString().padStart(2, '0')}:${this.preview.seconds.toString().padStart(2, '0')}`;

            // Animation de la barre de progression
            const currentSeconds = this.preview.minutes * 60 + this.preview.seconds;
            const progress = ((this.preview.totalSeconds - currentSeconds) / this.preview.totalSeconds) * 100;
            previewCircle.style.setProperty('--progress', `${progress}%`);

        };

        // Nettoie un intervalle précédent si existant
        if (this.preview.intervalId) {
            clearInterval(this.preview.intervalId);
            this.preview.intervalId = null;
        }

        // Démarre l'animation et enregistre l'intervalle pour pouvoir le contrôler
        this.preview.intervalId = setInterval(updatePreviewTimer, 100);

        // Contrôles du preview: play / pause / reset
        const previewButtons = document.querySelectorAll('.preview-btn');
        if (previewButtons && previewButtons.length) {
            previewButtons.forEach(btn => {
                const act = (btn.dataset.action || btn.getAttribute('data-action') || '').toLowerCase();
                btn.addEventListener('click', (e) => {
                    if (act === 'pause' || btn.classList.contains('pause')) {
                        this.preview.running = false;
                        btn.classList.remove('active');
                    } else if (act === 'play' || btn.classList.contains('play')) {
                        this.preview.running = true;
                        btn.classList.add('active');
                    } else if (act === 'reset' || btn.classList.contains('reset')) {
                        this.preview.running = false;
                        this.preview.minutes = 25;
                        this.preview.seconds = 0;
                        updatePreviewTimer();
                    } else {
                        // Si aucun data-action, toggle
                        this.preview.running = !this.preview.running;
                    }
                });
            });


        }

        // Ajoute la variable CSS pour l'animation
        const style = document.createElement('style');
        style.textContent = `
            .preview-circle::after {
                clip-path: inset(0 calc(100% - var(--progress, 0%)) 0 0);
                transition: clip-path 0.1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Redirige vers l'application
     */
    redirectToApp() {
        window.location.href = 'app.html';
    }

    /**
     * Fait défiler vers une section
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.homepage = new HomepageManager();
});

// Fonctions globales pour les boutons HTML
window.startApp = function () {
    window.location.href = 'app.html';
};

window.scrollToFeatures = function () {
    const features = document.getElementById('features');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
    }
};

window.showContactModal = function () {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};

// Fermer les modals en cliquant à l'extérieur
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});