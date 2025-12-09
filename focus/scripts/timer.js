/**
 * Gestionnaire de chronomètre pour Focus Chronométré
 * Contient la logique de base du chronomètre Pomodoro
 */

// Constantes de configuration
const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes en secondes
const DEFAULT_BREAK_TIME = 5 * 60;  // 5 minutes en secondes

// État global du chronomètre
const TimerState = {
    STOPPED: 'stopped',
    RUNNING: 'running',
    PAUSED: 'paused'
};

/**
 * Classe principale du chronomètre
 */
class FocusTimer {
    constructor() {
        // État initial
        this.state = TimerState.STOPPED;
        this.mode = 'focus'; // 'focus' ou 'break'
        this.timeLeft = DEFAULT_FOCUS_TIME;
        this.totalTime = DEFAULT_FOCUS_TIME;
        
        // Configuration
        this.focusDuration = DEFAULT_FOCUS_TIME;
        this.breakDuration = DEFAULT_BREAK_TIME;
        
        // Référence à l'intervalle
        this.intervalId = null;
        
        // Callbacks pour la mise à jour de l'UI
        this.onTick = null;
        this.onModeChange = null;
        this.onComplete = null;
        
        // Initialisation
        this._init();
    }
    
    /**
     * Initialisation du chronomètre
     * @private
     */
    _init() {
        console.log('🕒 Chronomètre initialisé');
    }
    
    /**
     * Démarre le chronomètre
     */
    start() {
        if (this.state === TimerState.RUNNING) {
            console.warn('Chronomètre déjà en cours');
            return;
        }
        
        this.state = TimerState.RUNNING;
        console.log(`▶️ Chronomètre démarré (${this.mode})`);
        
        // Démarre l'intervalle
        this.intervalId = setInterval(() => {
            this._tick();
        }, 1000);
        
        // Premier tick immédiat
        this._tick();
    }
    
    /**
     * Met en pause le chronomètre
     */
    pause() {
        if (this.state !== TimerState.RUNNING) {
            console.warn('Chronomètre non en cours');
            return;
        }
        
        this.state = TimerState.PAUSED;
        console.log('⏸️ Chronomètre mis en pause');
        
        // Arrête l'intervalle
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    
    /**
     * Reprend le chronomètre
     */
    resume() {
        if (this.state !== TimerState.PAUSED) {
            console.warn('Chronomètre non en pause');
            return;
        }
        
        this.start();
    }
    
    /**
     * Réinitialise le chronomètre
     * @param {string} mode - Mode à réinitialiser ('focus' ou 'break')
     */
    reset(mode = null) {
        // Arrête l'intervalle s'il est en cours
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Met à jour l'état
        this.state = TimerState.STOPPED;
        
        // Change le mode si spécifié
        if (mode) {
            this.mode = mode;
        }
        
        // Réinitialise le temps
        this._resetTime();
        
        console.log('🔄 Chronomètre réinitialisé');
        
        // Notifie l'UI
        if (this.onTick) {
            this.onTick(this.timeLeft, this.totalTime, this.mode);
        }
    }
    
    /**
     * Réinitialise le temps selon le mode actuel
     * @private
     */
    _resetTime() {
        if (this.mode === 'focus') {
            this.timeLeft = this.focusDuration;
            this.totalTime = this.focusDuration;
        } else {
            this.timeLeft = this.breakDuration;
            this.totalTime = this.breakDuration;
        }
    }
    
    /**
     * Exécute un tick du chronomètre (appelé chaque seconde)
     * @private
     */
    _tick() {
        // Décrémente le temps
        this.timeLeft--;
        
        // Notifie l'UI du tick
        if (this.onTick) {
            this.onTick(this.timeLeft, this.totalTime, this.mode);
        }
        
        // Vérifie si le temps est écoulé
        if (this.timeLeft <= 0) {
            this._complete();
        }
    }
    
    /**
     * Gère la fin d'une session
     * @private
     */
    _complete() {
        // Arrête l'intervalle
        clearInterval(this.intervalId);
        this.intervalId = null;
        
        // Met à jour l'état
        this.state = TimerState.STOPPED;
        
        console.log(`✅ Session ${this.mode} terminée`);
        
        // Appelle le callback de complétion
        if (this.onComplete) {
            this.onComplete(this.mode);
        }
    }
    
    /**
     * Change le mode (focus/break)
     * @param {string} newMode - Nouveau mode
     */
    setMode(newMode) {
        if (newMode !== 'focus' && newMode !== 'break') {
            console.error('Mode invalide:', newMode);
            return;
        }
        
        // Arrête le chronomètre s'il est en cours
        if (this.state === TimerState.RUNNING) {
            this.pause();
        }
        
        // Change le mode
        const oldMode = this.mode;
        this.mode = newMode;
        
        // Réinitialise le temps
        this._resetTime();
        
        console.log(`🔄 Mode changé: ${oldMode} → ${newMode}`);
        
        // Notifie le changement de mode
        if (this.onModeChange) {
            this.onModeChange(newMode, oldMode);
        }
        
        // Notifie l'UI du tick
        if (this.onTick) {
            this.onTick(this.timeLeft, this.totalTime, this.mode);
        }
    }
    
    /**
     * Définit la durée de focus
     * @param {number} minutes - Durée en minutes
     */
    setFocusDuration(minutes) {
        const seconds = minutes * 60;
        this.focusDuration = seconds;
        
        // Si on est en mode focus et que le chronomètre est arrêté, met à jour le temps
        if (this.mode === 'focus' && this.state === TimerState.STOPPED) {
            this.timeLeft = seconds;
            this.totalTime = seconds;
            
            // Notifie l'UI
            if (this.onTick) {
                this.onTick(this.timeLeft, this.totalTime, this.mode);
            }
        }
        
        console.log(`🎯 Durée focus définie: ${minutes} minutes`);
    }
    
    /**
     * Définit la durée de pause
     * @param {number} minutes - Durée en minutes
     */
    setBreakDuration(minutes) {
        const seconds = minutes * 60;
        this.breakDuration = seconds;
        
        // Si on est en mode break et que le chronomètre est arrêté, met à jour le temps
        if (this.mode === 'break' && this.state === TimerState.STOPPED) {
            this.timeLeft = seconds;
            this.totalTime = seconds;
            
            // Notifie l'UI
            if (this.onTick) {
                this.onTick(this.timeLeft, this.totalTime, this.mode);
            }
        }
        
        console.log(`☕ Durée pause définie: ${minutes} minutes`);
    }
    
    /**
     * Formate le temps en MM:SS
     * @param {number} seconds - Temps en secondes
     * @returns {string} Temps formaté
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Calcule le pourcentage de progression
     * @param {number} timeLeft - Temps restant
     * @param {number} totalTime - Temps total
     * @returns {number} Pourcentage de progression (0-100)
     */
    static calculateProgress(timeLeft, totalTime) {
        const elapsed = totalTime - timeLeft;
        return (elapsed / totalTime) * 100;
    }
    
    /**
     * Vérifie si le chronomètre est en cours
     * @returns {boolean}
     */
    isRunning() {
        return this.state === TimerState.RUNNING;
    }
    
    /**
     * Vérifie si le chronomètre est en pause
     * @returns {boolean}
     */
    isPaused() {
        return this.state === TimerState.PAUSED;
    }
    
    /**
     * Vérifie si le chronomètre est arrêté
     * @returns {boolean}
     */
    isStopped() {
        return this.state === TimerState.STOPPED;
    }
    
    /**
     * Récupère l'état actuel du chronomètre
     * @returns {object} État du chronomètre
     */
    getState() {
        return {
            state: this.state,
            mode: this.mode,
            timeLeft: this.timeLeft,
            totalTime: this.totalTime,
            focusDuration: this.focusDuration,
            breakDuration: this.breakDuration
        };
    }
    
    /**
     * Nettoie les ressources du chronomètre
     */
    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('🗑️ Chronomètre nettoyé');
    }
}

// Exporte la classe pour utilisation dans d'autres fichiers
// Note: Pour un projet réel avec modules, utiliser: export default FocusTimer;
// Pour ce projet simple, nous l'exposons à l'objet global window
window.FocusTimer = FocusTimer;