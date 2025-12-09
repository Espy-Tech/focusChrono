/**
 * Gestionnaire des paramètres pour Focus Chronométré
 * Gère le stockage local et les préférences utilisateur
 */

// Clés pour le localStorage
const STORAGE_KEYS = {
    FOCUS_DURATION: 'focusDuration',
    BREAK_DURATION: 'breakDuration',
    SOUND_ENABLED: 'soundEnabled',
    THEME: 'theme',
    STATS: 'focusStats'
};

/**
 * Classe de gestion des paramètres
 */
class SettingsManager {
    constructor() {
        // Valeurs par défaut
        this.defaults = {
            focusDuration: 25,    // minutes
            breakDuration: 5,     // minutes
            soundEnabled: true,
            theme: 'dark',
            stats: {
                sessionsToday: 0,
                totalFocusTime: 0,
                lastResetDate: null
            }
        };

        // État actuel des paramètres
        this.settings = { ...this.defaults };

        // Callbacks pour les changements
        this.onSettingsChange = null;

        // Initialisation
        this._init();
    }

    /**
     * Initialisation du gestionnaire
     * @private
     */
    _init() {
        this._loadSettings();
        this._checkStatsReset();
        console.log('⚙️ Gestionnaire de paramètres initialisé');
    }

    /**
     * Charge les paramètres depuis le localStorage
     * @private
     */
    _loadSettings() {
        try {
            // Charge chaque paramètre
            const focusDuration = localStorage.getItem(STORAGE_KEYS.FOCUS_DURATION);
            const breakDuration = localStorage.getItem(STORAGE_KEYS.BREAK_DURATION);
            const soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
            const theme = localStorage.getItem(STORAGE_KEYS.THEME);
            const stats = localStorage.getItem(STORAGE_KEYS.STATS);

            // Applique les paramètres chargés
            if (focusDuration !== null) {
                this.settings.focusDuration = parseInt(focusDuration);
            }

            if (breakDuration !== null) {
                this.settings.breakDuration = parseInt(breakDuration);
            }

            if (soundEnabled !== null) {
                this.settings.soundEnabled = soundEnabled === 'true';
            }

            if (theme !== null) {
                this.settings.theme = theme;
            }

            if (stats !== null) {
                this.settings.stats = JSON.parse(stats);
            }

            console.log('📂 Paramètres chargés depuis le localStorage');
        } catch (error) {
            console.error('❌ Erreur lors du chargement des paramètres:', error);
            // Réinitialise aux valeurs par défaut en cas d'erreur
            this.settings = { ...this.defaults };
        }
    }

    /**
     * Sauvegarde les paramètres dans le localStorage
     * @private
     */
    _saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEYS.FOCUS_DURATION, this.settings.focusDuration);
            localStorage.setItem(STORAGE_KEYS.BREAK_DURATION, this.settings.breakDuration);
            localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, this.settings.soundEnabled);
            localStorage.setItem(STORAGE_KEYS.THEME, this.settings.theme);
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.settings.stats));

            console.log('💾 Paramètres sauvegardés dans le localStorage');
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde des paramètres:', error);
        }
    }

    /**
     * Vérifie et réinitialise les statistiques si nécessaire
     * @private
     */
    _checkStatsReset() {
        const today = new Date().toDateString();
        const lastResetDate = this.settings.stats.lastResetDate;

        // Réinitialise les statistiques si c'est un nouveau jour
        if (lastResetDate !== today) {
            this.settings.stats.sessionsToday = 0;
            this.settings.stats.totalFocusTime = 0;
            this.settings.stats.lastResetDate = today;
            this._saveSettings();

            console.log('📊 Statistiques réinitialisées pour le nouveau jour');
        }
    }

    /**
     * Définit la durée de focus
     * @param {number} minutes - Durée en minutes
     */
    setFocusDuration(minutes) {
        if (minutes < 1 || minutes > 120) {
            console.error('Durée de focus invalide:', minutes);
            return false;
        }

        const oldValue = this.settings.focusDuration;
        this.settings.focusDuration = minutes;
        this._saveSettings();

        // Notifie le changement
        this._notifyChange('focusDuration', minutes, oldValue);

        return true;
    }

    /**
     * Définit la durée de pause
     * @param {number} minutes - Durée en minutes
     */
    setBreakDuration(minutes) {
        if (minutes < 1 || minutes > 30) {
            console.error('Durée de pause invalide:', minutes);
            return false;
        }

        const oldValue = this.settings.breakDuration;
        this.settings.breakDuration = minutes;
        this._saveSettings();

        // Notifie le changement
        this._notifyChange('breakDuration', minutes, oldValue);

        return true;
    }

    /**
     * Active ou désactive le son
     * @param {boolean} enabled - État du son
     */
    setSoundEnabled(enabled) {
        const oldValue = this.settings.soundEnabled;
        this.settings.soundEnabled = enabled;
        this._saveSettings();

        // Notifie le changement
        this._notifyChange('soundEnabled', enabled, oldValue);

        return true;
    }

    /**
     * Définit le thème
     * @param {string} theme - 'dark' ou 'light'
     */
    setTheme(theme) {
        if (theme !== 'dark' && theme !== 'light') {
            console.error('Thème invalide:', theme);
            return false;
        }

        const oldValue = this.settings.theme;
        this.settings.theme = theme;
        this._saveSettings();

        // Notifie le changement
        this._notifyChange('theme', theme, oldValue);

        return true;
    }

    /**
     * Incrémente le nombre de sessions
     */
    incrementSessions() {
        this.settings.stats.sessionsToday++;
        this._saveSettings();

        console.log(`📈 Session ajoutée. Total: ${this.settings.stats.sessionsToday}`);
    }

    /**
     * Ajoute du temps de focus aux statistiques
     * @param {number} minutes - Temps en minutes
     */
    addFocusTime(minutes) {
        this.settings.stats.totalFocusTime += minutes;
        this._saveSettings();

        console.log(`⏱️ ${minutes} minutes ajoutées aux statistiques`);
    }

    /**
     * Notifie les observateurs d'un changement
     * @private
     */
    _notifyChange(key, newValue, oldValue) {
        if (this.onSettingsChange) {
            this.onSettingsChange(key, newValue, oldValue);
        }
    }

    /**
     * Récupère les paramètres actuels
     * @returns {object} Paramètres actuels
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Récupère une valeur spécifique
     * @param {string} key - Clé du paramètre
     * @returns {*} Valeur du paramètre
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Réinitialise tous les paramètres aux valeurs par défaut
     */
    resetToDefaults() {
        const oldSettings = { ...this.settings };
        this.settings = { ...this.defaults };
        this._saveSettings();

        console.log('🔄 Paramètres réinitialisés aux valeurs par défaut');

        // Notifie tous les changements
        if (this.onSettingsChange) {
            Object.keys(this.settings).forEach(key => {
                this.onSettingsChange(key, this.settings[key], oldSettings[key]);
            });
        }

        return true;
    }

    /**
     * Exporte les paramètres sous forme de JSON
     * @returns {string} JSON des paramètres
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * Importe des paramètres depuis du JSON
     * @param {string} jsonString - JSON des paramètres
     */
    importSettings(jsonString) {
        try {
            const importedSettings = JSON.parse(jsonString);
            const oldSettings = { ...this.settings };

            // Fusionne les paramètres importés avec les paramètres actuels
            this.settings = { ...this.settings, ...importedSettings };
            this._saveSettings();

            console.log('📤 Paramètres importés avec succès');

            // Notifie les changements
            if (this.onSettingsChange) {
                Object.keys(importedSettings).forEach(key => {
                    this.onSettingsChange(key, this.settings[key], oldSettings[key]);
                });
            }

            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'importation des paramètres:', error);
            return false;
        }
    }

    /**
     * Nettoie le gestionnaire
     */
    destroy() {
        console.log('🗑️ Gestionnaire de paramètres nettoyé');
    }
}

// Exporte la classe
window.SettingsManager = SettingsManager;