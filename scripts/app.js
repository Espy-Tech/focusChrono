/**
 * Point d'entrée principal de l'application Focus Chronométré
 * Initialise et coordonne tous les composants
 */

/**
 * Classe principale de l'application
 */
class FocusTimerApp {
    constructor() {
        // Composants principaux
        this.timer = null;
        this.settings = null;
        this.ui = null;
        
        // État de l'application
        this.isInitialized = false;
        
        // Initialisation
        this.init();
    }
    
    /**
     * Initialise l'application
     */
    init() {
        try {
            console.log('🚀 Initialisation de Focus Chronométré...');
            
            // Initialise les composants dans l'ordre
            this._initSettings();
            this._initTimer();
            this._initUI();
            this._setupEventHandlers();
            
            // Marque comme initialisée
            this.isInitialized = true;
            
            console.log('✅ Application Focus Chronométré initialisée avec succès');
            console.log('📊 Mode:', this.timer.mode);
            console.log('⚙️ Paramètres:', this.settings.getSettings());
            
            // Affiche un message de bienvenue
            this._showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this._handleInitError(error);
        }
    }
    
    /**
     * Initialise le gestionnaire de paramètres
     * @private
     */
    _initSettings() {
        this.settings = new SettingsManager();
        console.log('⚙️ Gestionnaire de paramètres créé');
    }
    
    /**
     * Initialise le chronomètre
     * @private
     */
    _initTimer() {
        // Récupère les paramètres sauvegardés
        const settings = this.settings.getSettings();
        
        // Crée le chronomètre avec les paramètres sauvegardés
        this.timer = new FocusTimer();
        this.timer.setFocusDuration(settings.focusDuration);
        this.timer.setBreakDuration(settings.breakDuration);
        
        console.log('🕒 Chronomètre créé');
    }
    
    /**
     * Initialise l'interface utilisateur
     * @private
     */
    _initUI() {
        this.ui = new UIManager(this.timer, this.settings);
        console.log('🎨 Interface utilisateur créée');
    }
    
    /**
     * Configure les gestionnaires d'événements entre les composants
     * @private
     */
    _setupEventHandlers() {
        // Chronomètre → UI
        this.timer.onTick = (timeLeft, totalTime, mode) => {
            this.ui.updateTimerDisplay(timeLeft, totalTime, mode);
            this.ui.updateControlButtons(
                this.timer.isRunning(),
                this.timer.isPaused()
            );
        };
        
        this.timer.onModeChange = (newMode, oldMode) => {
            console.log(`🔄 Mode changé de ${oldMode} à ${newMode}`);
        };
        
        this.timer.onComplete = (completedMode) => {
            console.log(`✅ Session ${completedMode} terminée`);
            
            // Affiche la notification
            this.ui.showSessionComplete(completedMode);
            
            // Met à jour les statistiques
            if (completedMode === 'focus') {
                this.settings.incrementSessions();
                const focusMinutes = this.settings.getSetting('focusDuration');
                this.settings.addFocusTime(focusMinutes);
                this.ui._updateStatsDisplay();
            }
        };
        
        // Paramètres → UI
        this.settings.onSettingsChange = (key, newValue, oldValue) => {
            console.log(`⚙️ Paramètre modifié: ${key} = ${newValue} (était: ${oldValue})`);
            
            // Met à jour l'UI si nécessaire
            if (key === 'theme') {
                this.ui._applyTheme();
            }
        };
        
        console.log('🔗 Gestionnaires d\'événements configurés');
    }
    
    /**
     * Affiche un message de bienvenue
     * @private
     */
    _showWelcomeMessage() {
        // Vérifie si c'est la première visite
        const firstVisit = !localStorage.getItem('hasVisitedBefore');
        
        if (firstVisit) {
            localStorage.setItem('hasVisitedBefore', 'true');
            
            // Affiche les informations après un court délai
            setTimeout(() => {
                this.ui._showInfo();
            }, 1000);
        }
    }
    
    /**
     * Gère les erreurs d'initialisation
     * @private
     */
    _handleInitError(error) {
        // Affiche un message d'erreur à l'utilisateur
        const errorMessage = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--color-bg-primary);
                color: var(--color-text-primary);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                text-align: center;
                z-index: 9999;
            ">
                <h1 style="color: var(--color-error); margin-bottom: 1rem;">⚠️ Erreur d'initialisation</h1>
                <p style="margin-bottom: 2rem;">Une erreur est survenue lors du chargement de l'application.</p>
                <pre style="
                    background-color: var(--color-bg-secondary);
                    padding: 1rem;
                    border-radius: 8px;
                    max-width: 600px;
                    overflow: auto;
                    margin-bottom: 2rem;
                ">${error.toString()}</pre>
                <button onclick="window.location.reload()" style="
                    background-color: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                ">
                    Recharger l'application
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }
    
    /**
     * Récupère l'état de l'application
     * @returns {object} État complet de l'application
     */
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            timer: this.timer ? this.timer.getState() : null,
            settings: this.settings ? this.settings.getSettings() : null
        };
    }
    
    /**
     * Réinitialise l'application
     */
    reset() {
        console.log('🔄 Réinitialisation de l\'application...');
        
        // Nettoie les composants
        if (this.timer) {
            this.timer.destroy();
        }
        
        if (this.ui) {
            this.ui.destroy();
        }
        
        if (this.settings) {
            this.settings.destroy();
        }
        
        // Réinitialise les variables
        this.timer = null;
        this.ui = null;
        this.settings = null;
        this.isInitialized = false;
        
        console.log('🗑️ Application nettoyée');
    }
    
    /**
     * Redémarre l'application
     */
    restart() {
        this.reset();
        this.init();
    }
    
    /**
     * Exporte l'état de l'application
     * @returns {string} JSON de l'état de l'application
     */
    exportAppState() {
        return JSON.stringify(this.getAppState(), null, 2);
    }
}

// ===== INITIALISATION DE L'APPLICATION =====

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM chargé, démarrage de l\'application...');
    
    // Crée et initialise l'application
    window.app = new FocusTimerApp();
    
    // Expose les composants principaux pour le débogage
    if (window.app.isInitialized) {
        console.log('🌐 Application disponible sous: window.app');
        console.log('⏱️ Chronomètre disponible sous: window.app.timer');
        console.log('⚙️ Paramètres disponibles sous: window.app.settings');
        console.log('🎨 UI disponible sous: window.app.ui');
    }
});

// Gestionnaire d'erreurs global
window.addEventListener('error', (event) => {
    console.error('💥 Erreur globale:', event.error);
    
    // Affiche un message d'erreur convivial
    if (window.app && window.app.ui) {
        window.app.ui._showError('Une erreur est survenue. Veuillez recharger la page.');
    }
});

// Gestionnaire pour les promesses non capturées
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Promesse non capturée:', event.reason);
});

// ===== UTILITAIRES GLOBAUX =====

/**
 * Basculer entre les modes focus et pause
 * @global
 */
window.toggleMode = function() {
    if (window.app && window.app.timer) {
        const currentMode = window.app.timer.mode;
        const newMode = currentMode === 'focus' ? 'break' : 'focus';
        window.app.timer.setMode(newMode);
    }
};

/**
 * Réinitialiser les statistiques
 * @global
 */
window.resetStats = function() {
    if (window.app && window.app.settings) {
        const today = new Date().toDateString();
        window.app.settings.settings.stats = {
            sessionsToday: 0,
            totalFocusTime: 0,
            lastResetDate: today
        };
        window.app.settings._saveSettings();
        window.app.ui._updateStatsDisplay();
        console.log('📊 Statistiques réinitialisées');
    }
};

/**
 * Afficher les informations de débogage
 * @global
 */
window.showDebugInfo = function() {
    if (window.app) {
        console.group('🔍 Informations de débogage');
        console.log('Application:', window.app.getAppState());
        console.log('Navigateur:', navigator.userAgent);
        console.log('LocalStorage utilisé:', 
            JSON.stringify(localStorage).length, 'octets');
        console.groupEnd();
    }
};