// User preferences management
export interface UserPreferences {
    theme: "light" | "dark";
    favoriteTeams: string[];
    preferredSize?: string;
    currency: string;
    language: string;
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        priceDrops: boolean;
        backInStock: boolean;
        promotions: boolean;
    };
}

const PREFERENCES_KEY = "cediman:preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
    theme: "light",
    favoriteTeams: [],
    currency: "GHS",
    language: "en",
    notifications: {
        email: true,
        sms: false,
        push: true,
        priceDrops: true,
        backInStock: true,
        promotions: true,
    },
};

export class PreferencesService {
    static getPreferences(): UserPreferences {
        if (typeof window === "undefined") {
            return DEFAULT_PREFERENCES;
        }

        try {
            const stored = localStorage.getItem(PREFERENCES_KEY);
            if (!stored) {
                return DEFAULT_PREFERENCES;
            }

            return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        } catch (error) {
            console.error("Error reading preferences:", error);
            return DEFAULT_PREFERENCES;
        }
    }

    static setPreferences(preferences: Partial<UserPreferences>): void {
        try {
            const current = this.getPreferences();
            const updated = { ...current, ...preferences };
            localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));

            // Apply theme immediately
            if (preferences.theme) {
                document.documentElement.classList.toggle("dark", preferences.theme === "dark");
            }
        } catch (error) {
            console.error("Error saving preferences:", error);
        }
    }

    static setTheme(theme: "light" | "dark"): void {
        this.setPreferences({ theme });
    }

    static getTheme(): "light" | "dark" {
        return this.getPreferences().theme;
    }

    static addFavoriteTeam(teamId: string): void {
        const prefs = this.getPreferences();
        if (!prefs.favoriteTeams.includes(teamId)) {
            this.setPreferences({
                favoriteTeams: [...prefs.favoriteTeams, teamId],
            });
        }
    }

    static removeFavoriteTeam(teamId: string): void {
        const prefs = this.getPreferences();
        this.setPreferences({
            favoriteTeams: prefs.favoriteTeams.filter((id) => id !== teamId),
        });
    }

    static setPreferredSize(size: string): void {
        this.setPreferences({ preferredSize: size });
    }

    static getPreferredSize(): string | undefined {
        return this.getPreferences().preferredSize;
    }
}
