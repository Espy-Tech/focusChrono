/**
 * Gestionnaire d'interface utilisateur pour Focus Chronométré
 * Gère toutes les interactions avec l'UI et les mises à jour visuelles
 */

/**
 * Classe de gestion de l'interface utilisateur
 */
class UIManager {
    constructor(timer, settings) {
        // Références aux composants principaux
        this.timer = timer;
        this.settings = settings;

        // Éléments DOM principaux
        this.elements = {
            // Chronomètre
            timeDisplay: document.getElementById('timeDisplay'),
            modeText: document.getElementById('modeText'),
            progressBar: document.getElementById('progressBar'),

            // Boutons de contrôle
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),

            // Thème
            themeToggle: document.getElementById('themeToggle'),

            // Paramètres
            settingsPanel: document.getElementById('settingsPanel'),
            settingsBtn: document.getElementById('settingsBtn'),
            closeSettings: document.getElementById('closeSettings'),
            focusTimeInput: document.getElementById('focusTime'),
            breakTimeInput: document.getElementById('breakTime'),
            soundToggle: document.getElementById('soundToggle'),
            saveSettings: document.getElementById('saveSettings'),

            // Statistiques
            focusSessions: document.getElementById('focusSessions'),
            totalFocusTime: document.getElementById('totalFocusTime'),

            // Navigation
            infoBtn: document.getElementById('infoBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),

            // Modal
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modalTitle'),
            modalMessage: document.getElementById('modalMessage'),
            modalActionBtn: document.getElementById('modalActionBtn'),
            modalCloseBtn: document.getElementById('modalCloseBtn')
        };

        // État de l'UI
        this.state = {
            isFullscreen: false,
            isModalOpen: false,
            isSettingsOpen: false
        };

        // Initialisation
        this._init();
    }

    /**
     * Initialisation de l'UI
     * @private
     */
    _init() {
        this._cacheElements();
        this._setupEventListeners();
        this._applyTheme();
        this._updateStatsDisplay();
        this._setupTooltips();

        console.log('🎨 Interface utilisateur initialisée');
    }

    /**
     * Met en cache tous les éléments DOM nécessaires
     * @private
     */
    _cacheElements() {
        // S'assure que tous les éléments essentiels existent
        const essentialElements = ['timeDisplay', 'progressBar', 'startBtn', 'pauseBtn', 'resetBtn'];

        essentialElements.forEach(id => {
            if (!this.elements[id]) {
                console.error(`❌ Élément DOM manquant: #${id}`);
            }
        });
    }

    /**
     * Configure les écouteurs d'événements
     * @private
     */
    _setupEventListeners() {
        // Chronomètre
        this.elements.startBtn.addEventListener('click', () => this._handleStart());
        this.elements.pauseBtn.addEventListener('click', () => this._handlePause());
        this.elements.resetBtn.addEventListener('click', () => this._handleReset());

        // Thème
        this.elements.themeToggle.addEventListener('click', () => this._toggleTheme());

        // Paramètres
        this.elements.settingsBtn.addEventListener('click', () => this._openSettings());
        this.elements.closeSettings.addEventListener('click', () => this._closeSettings());
        this.elements.saveSettings.addEventListener('click', () => this._saveSettings());

        // Modal
        this.elements.modalActionBtn.addEventListener('click', () => this._handleModalAction());
        this.elements.modalCloseBtn.addEventListener('click', () => this._closeModal());

        // Informations
        this.elements.infoBtn.addEventListener('click', () => this._showInfo());

        // Plein écran
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => this._toggleFullscreen());
        }

        // Fermer le panneau des paramètres en cliquant à l'extérieur
        document.addEventListener('click', (e) => this._handleOutsideClick(e));

        // Touches du clavier
        document.addEventListener('keydown', (e) => this._handleKeyPress(e));

        // Événements du plein écran
        document.addEventListener('fullscreenchange', () => this._handleFullscreenChange());

        console.log('🎮 Écouteurs d\'événements configurés');
    }

    /**
     * Applique le thème sauvegardé
     * @private
     */
    _applyTheme() {
        const theme = this.settings.getSetting('theme');

        if (theme === 'light') {
            document.body.classList.add('light-mode');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('light-mode');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    /**
     * Met à jour l'affichage du temps
     * @param {number} timeLeft - Temps restant en secondes
     * @param {number} totalTime - Temps total en secondes
     * @param {string} mode - Mode actuel
     */
    updateTimerDisplay(timeLeft, totalTime, mode) {
        // Met à jour l'affichage numérique
        this.elements.timeDisplay.textContent = this.timer.constructor.formatTime(timeLeft);

        // Met à jour la barre de progression
        const progress = this.timer.constructor.calculateProgress(timeLeft, totalTime);
        const circumference = 1130; // 2 * π * r
        const offset = circumference - (progress / 100) * circumference;
        this.elements.progressBar.style.strokeDashoffset = offset;

        // Met à jour le texte du mode
        this.elements.modeText.textContent = mode === 'focus' ? 'Focus' : 'Pause';

        // Animation de changement de mode
        if (this.lastMode && this.lastMode !== mode) {
            this.elements.modeText.classList.add('mode-change');
            setTimeout(() => {
                this.elements.modeText.classList.remove('mode-change');
            }, 300);
        }

        this.lastMode = mode;
    }

    /**
     * Met à jour l'état des boutons de contrôle
     * @param {boolean} isRunning - Si le chronomètre est en cours
     * @param {boolean} isPaused - Si le chronomètre est en pause
     */
    updateControlButtons(isRunning, isPaused) {
        if (isRunning) {
            // Chronomètre en cours
            this.elements.startBtn.disabled = true;
            this.elements.pauseBtn.disabled = false;
            this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> En cours...';
        } else if (isPaused) {
            // Chronomètre en pause
            this.elements.startBtn.disabled = false;
            this.elements.pauseBtn.disabled = true;
            this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> Reprendre';
        } else {
            // Chronomètre arrêté
            this.elements.startBtn.disabled = false;
            this.elements.pauseBtn.disabled = true;
            this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> Démarrer';
        }
    }

    /**
     * Met à jour l'affichage des statistiques
     * @private
     */
    _updateStatsDisplay() {
        const stats = this.settings.getSetting('stats');

        if (this.elements.focusSessions) {
            this.elements.focusSessions.textContent = stats.sessionsToday;
        }

        if (this.elements.totalFocusTime) {
            this.elements.totalFocusTime.textContent = stats.totalFocusTime;
        }
    }

    /**
     * Configure les infobulles
     * @private
     */
    _setupTooltips() {
        // Ajoute des attributs title pour l'accessibilité
        const tooltips = {
            startBtn: 'Démarrer le chronomètre (Espace)',
            pauseBtn: 'Mettre en pause (Espace)',
            resetBtn: 'Réinitialiser le chronomètre (R)',
            settingsBtn: 'Ouvrir les paramètres (S)',
            themeToggle: 'Changer le thème clair/sombre (T)',
            fullscreenBtn: 'Mode plein écran (F11)'
        };

        Object.keys(tooltips).forEach(key => {
            if (this.elements[key]) {
                this.elements[key].setAttribute('title', tooltips[key]);
            }
        });
    }

    /**
     * Gère le démarrage du chronomètre
     * @private
     */
    _handleStart() {
        if (this.timer.isRunning()) {
            return;
        }

        if (this.timer.isPaused()) {
            this.timer.resume();
        } else {
            this.timer.start();
        }

        // Animation de feedback
        this._animateButton(this.elements.startBtn);
        // Met à jour l'état des boutons immédiatement
        this.updateControlButtons(
            this.timer.isRunning(),
            this.timer.isPaused()
        );
    }

    /**
     * Gère la pause du chronomètre
     * @private
     */
    _handlePause() {
        if (!this.timer.isRunning()) {
            return;
        }

        this.timer.pause();

        // Animation de feedback
        this._animateButton(this.elements.pauseBtn);
        // Met à jour l'état des boutons immédiatement
        this.updateControlButtons(
            this.timer.isRunning(),
            this.timer.isPaused()
        );
    }

    /**
     * Gère la réinitialisation du chronomètre
     * @private
     */
    _handleReset() {
        this.timer.reset();

        // Animation de feedback
        this._animateButton(this.elements.resetBtn);
        // Met à jour l'état des boutons immédiatement
        this.updateControlButtons(
            this.timer.isRunning(),
            this.timer.isPaused()
        );
    }

    /**
     * Anime un bouton pour donner un feedback visuel
     * @private
     */
    _animateButton(button) {
        button.classList.add('pulse');
        setTimeout(() => {
            button.classList.remove('pulse');
        }, 300);
    }

    /**
     * Bascule le thème clair/sombre
     * @private
     */
    _toggleTheme() {
        const isLightMode = document.body.classList.contains('light-mode');
        const newTheme = isLightMode ? 'dark' : 'light';

        // Met à jour le thème dans les paramètres
        this.settings.setTheme(newTheme);

        // Applique le thème
        this._applyTheme();

        // Animation du bouton
        this._animateButton(this.elements.themeToggle);
    }

    /**
     * Ouvre le panneau des paramètres
     * @private
     */
    _openSettings() {
        this.state.isSettingsOpen = true;
        this.elements.settingsPanel.setAttribute('aria-hidden', 'false');

        // Remplit les champs avec les valeurs actuelles
        const currentSettings = this.settings.getSettings();
        this.elements.focusTimeInput.value = currentSettings.focusDuration;
        this.elements.breakTimeInput.value = currentSettings.breakDuration;
        this.elements.soundToggle.checked = currentSettings.soundEnabled;

        console.log('⚙️ Panneau des paramètres ouvert');
    }

    /**
     * Ferme le panneau des paramètres
     * @private
     */
    _closeSettings() {
        this.state.isSettingsOpen = false;
        this.elements.settingsPanel.setAttribute('aria-hidden', 'true');
        console.log('⚙️ Panneau des paramètres fermé');
    }

    /**
     * Sauvegarde les paramètres modifiés
     * @private
     */
    _saveSettings() {
        // Récupère les valeurs des champs
        const focusDuration = parseInt(this.elements.focusTimeInput.value);
        const breakDuration = parseInt(this.elements.breakTimeInput.value);
        const soundEnabled = this.elements.soundToggle.checked;

        // Valide les entrées
        if (focusDuration < 1 || focusDuration > 120) {
            this._showError('La durée de focus doit être entre 1 et 120 minutes');
            return;
        }

        if (breakDuration < 1 || breakDuration > 30) {
            this._showError('La durée de pause doit être entre 1 et 30 minutes');
            return;
        }

        // Met à jour les paramètres
        this.settings.setFocusDuration(focusDuration);
        this.settings.setBreakDuration(breakDuration);
        this.settings.setSoundEnabled(soundEnabled);

        // Met à jour le chronomètre
        this.timer.setFocusDuration(focusDuration);
        this.timer.setBreakDuration(breakDuration);

        // Feedback visuel
        this._animateButton(this.elements.saveSettings);
        this.elements.saveSettings.innerHTML = '<i class="fas fa-check"></i> Enregistré !';

        setTimeout(() => {
            this.elements.saveSettings.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
        }, 1500);

        // Ferme le panneau après un délai
        setTimeout(() => {
            this._closeSettings();
        }, 1000);

        console.log('💾 Paramètres sauvegardés');
    }

    /**
     * Affiche une boîte de dialogue d'information
     * @private
     */
    _showInfo() {
        this.elements.modalTitle.textContent = 'À propos de Focus Chronométré';
        this.elements.modalMessage.innerHTML = `
            <p>Cette application utilise la technique Pomodoro pour améliorer votre productivité.</p>
            <p><strong>Comment ça marche :</strong></p>
            <ul style="text-align: left; margin: 1rem 0;">
                <li>Travaillez avec focus pendant 25 minutes</li>
                <li>Prenez une courte pause de 5 minutes</li>
                <li>Après 4 cycles, prenez une pause plus longue (15-30 minutes)</li>
            </ul>
            <p><strong>Raccourcis clavier :</strong></p>
            <ul style="text-align: left; margin: 1rem 0;">
                <li>Espace : Démarrer/Pause</li>
                <li>R : Réinitialiser</li>
                <li>S : Paramètres</li>
                <li>T : Changer le thème</li>
                <li>F11 : Plein écran</li>
            </ul>
        `;
        this.elements.modalActionBtn.style.display = 'none';
        this._openModal();
    }

    /**
     * Affiche une notification de session terminée
     * @param {string} completedMode - Mode qui vient de se terminer
     */
    showSessionComplete(completedMode) {
        if (completedMode === 'focus') {
            this.elements.modalTitle.textContent = 'Session de focus terminée !';
            this.elements.modalMessage.textContent = 'Félicitations ! Votre session de focus est terminée. Il est temps de prendre une pause pour recharger vos énergies.';
            this.elements.modalActionBtn.textContent = 'Commencer la pause';
            this.elements.modalActionBtn.style.display = 'block';
        } else {
            this.elements.modalTitle.textContent = 'Pause terminée';
            this.elements.modalMessage.textContent = 'Votre pause est terminée. Préparez-vous pour une nouvelle session de focus productive.';
            this.elements.modalActionBtn.textContent = 'Commencer le focus';
            this.elements.modalActionBtn.style.display = 'block';
        }

        this._openModal();

        // Joue un son si activé
        if (this.settings.getSetting('soundEnabled')) {
            this._playNotificationSound();
        }
    }

    /**
     * Ouvre le modal
     * @private
     */
    _openModal() {
        this.state.isModalOpen = true;
        this.elements.modal.setAttribute('aria-modal', 'true');
    }

    /**
     * Ferme le modal
     * @private
     */
    _closeModal() {
        this.state.isModalOpen = false;
        this.elements.modal.setAttribute('aria-modal', 'false');
    }

    /**
     * Gère l'action principale du modal
     * @private
     */
    _handleModalAction() {
        this._closeModal();

        // Change le mode et démarre le chronomètre
        const currentMode = this.timer.mode;
        const newMode = currentMode === 'focus' ? 'break' : 'focus';

        this.timer.setMode(newMode);
        this.timer.start();
    }

    /**
     * Joue un son de notification
     * @private
     */
    _playNotificationSound() {
        try {
            // Crée un contexte audio
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            // Configure l'oscillateur
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

            // Configure le gain (volume)
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

            // Connecte les nœuds
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Joue le son
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 1);

            console.log('🔔 Son de notification joué');
        } catch (error) {
            console.warn('⚠️ Impossible de jouer le son de notification:', error);
        }
    }

    /**
     * Bascule le mode plein écran
     * @private
     */
    _toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`⚠️ Erreur lors de l'activation du plein écran: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Gère le changement d'état du plein écran
     * @private
     */
    _handleFullscreenChange() {
        this.state.isFullscreen = !!document.fullscreenElement;

        // Met à jour l'icône du bouton
        if (this.elements.fullscreenBtn) {
            const icon = this.state.isFullscreen ? 'fa-compress' : 'fa-expand';
            this.elements.fullscreenBtn.innerHTML = `<i class="fas ${icon}"></i>`;
        }
    }

    /**
     * Gère les clics à l'extérieur du panneau des paramètres
     * @private
     */
    _handleOutsideClick(event) {
        if (this.state.isSettingsOpen &&
            !this.elements.settingsPanel.contains(event.target) &&
            !this.elements.settingsBtn.contains(event.target)) {
            this._closeSettings();
        }
    }

    /**
     * Gère les pressions de touches du clavier
     * @private
     */
    _handleKeyPress(event) {
        // Ignore les raccourcis si l'utilisateur est en train de taper dans un champ
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch (event.key) {
            case ' ':
            case 'Spacebar':
                // Espace : Démarrer/Pause
                event.preventDefault();
                if (this.timer.isRunning()) {
                    this._handlePause();
                } else {
                    this._handleStart();
                }
                break;

            case 'r':
            case 'R':
                // R : Réinitialiser
                event.preventDefault();
                this._handleReset();
                break;

            case 's':
            case 'S':
                // S : Paramètres
                event.preventDefault();
                if (this.state.isSettingsOpen) {
                    this._closeSettings();
                } else {
                    this._openSettings();
                }
                break;

            case 't':
            case 'T':
                // T : Thème
                event.preventDefault();
                this._toggleTheme();
                break;

            case 'Escape':
                // Échap : Fermer modal ou paramètres
                if (this.state.isModalOpen) {
                    this._closeModal();
                }
                if (this.state.isSettingsOpen) {
                    this._closeSettings();
                }
                break;
        }
    }

    /**
     * Affiche un message d'erreur temporaire
     * @private
     */
    _showError(message) {
        // Crée un élément d'erreur temporaire
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--color-error);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(errorElement);

        // Supprime après 3 secondes
        setTimeout(() => {
            errorElement.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(errorElement);
            }, 300);
        }, 3000);
    }

    /**
     * Nettoie l'UI
     */
    destroy() {
        // Supprime les écouteurs d'événements
        // (Dans une vraie application, vous voudriez les supprimer proprement)

        console.log('🗑️ Interface utilisateur nettoyée');
    }

    _toggleTheme() {
        const isLightMode = document.body.classList.contains('light-mode');
        const newTheme = isLightMode ? 'dark' : 'light';

        // Met à jour le thème dans les paramètres
        this.settings.setTheme(newTheme);

        // Applique le thème
        this._applyTheme();

        // Déclenche un événement de stockage pour synchroniser
        window.localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'theme',
            newValue: newTheme,
            oldValue: isLightMode ? 'light' : 'dark'
        }));

        // Animation du bouton
        this._animateButton(this.elements.themeToggle);
    }
}

// Exporte la classe
window.UIManager = UIManager;