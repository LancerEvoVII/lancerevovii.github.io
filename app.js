function gameCompanion() {
    return {
        // Kern-Spielstatus
        activePhase: '2',
        playerCount: 0,
        revenue: null,
        showResults: false,
        payoutLog: [],
        
        shares: {
            p1: 0,
            p2: 0,
            p3: 0,
            treasury: 0
        },

        // Phasenkonfiguration (Regeln & Musik)
        phases: {
            '2': {
                theme: 'qing',
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                rules: [
                    'Gelbe Schienenteile sind erlaubt.',
                    'Schmalspur-Minors dürfen Strecken bauen.',
                    'Züge vom Typ 2 sind voll einsatzbereit.'
                ]
            },
            '4': {
                theme: 'industrial',
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                rules: [
                    'Grüne Upgrades sind ab sofort freigeschaltet.',
                    'Ausländische Investoren (Foreign Investors) verändern ihr Verhalten.',
                    '⚠️ Züge vom Typ 2 werden am Ende der nächsten Operationsrunde OBSOLET (rosten)!'
                ]
            },
            '6': {
                theme: 'industrial', // Teilt sich das saubere graue Design
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                rules: [
                    'Braune Streckenteile dürfen verbaut werden.',
                    'Regierungszüge (G-Trains) kommen auf den Markt.',
                    '⚠️ Züge vom Typ 3 werden am Ende der nächsten Operationsrunde obsolet!'
                ]
            },
            'E': {
                theme: 'modern', // Wechselt in das dunkle, neonfarbene Zukunfts-Design
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
                rules: [
                    'Graue finale Upgrades (Magnetschwebebahn/Modern) sind offen.',
                    '⚠️ Züge vom Typ 4 werden sofort obsolet!'
                ]
            }
        },

        // Berechnet die Summe aller eingetragenen Aktienwerte
        get totalShares() {
            return (this.shares.p1 || 0) + (this.shares.p2 || 0) + (this.shares.p3 || 0) + (this.shares.treasury || 0);
        },

        // Logik für den glatten Phasen- und Musikwechsel
        switchPhase(phaseKey) {
            this.activePhase = phaseKey;
            const config = this.phases[phaseKey];
            
            // Audio-Element ansteuern
            const audio = document.getElementById('bg-audio');
            if (audio && config.music) {
                audio.src = config.music;
                audio.volume = 0.2;
                audio.play().catch(e => console.log("Audio-Autoplay erfordert Klick auf der Seite."));
            }
        },

        // Berechnet das Startkapital anhand der Lookout-Regeln
        calculateStartingCash() {
            const p = parseInt(this.playerCount);
            if (p === 3) return 600;
            if (p === 4) return 480;
            if (p === 5) return 400;
            if (p === 6) return 340;
            if (p === 7) return 300;
            return 0;
        },

        // Führt die Dividendenrechnung aus
        payout(isPayingOut) {
            this.payoutLog = [];
            
            if (!this.revenue || this.revenue <= 0) {
                alert("Bitte gib zuerst einen gültigen Routenertrag ein.");
                return;
            }

            if (!isPayingOut) {
                this.payoutLog.push(`<strong>Unternehmen behält Ertrag ein:</strong> +¥ ${this.revenue} fließen in die Firmenkasse.`);
                this.payoutLog.push(`<em>Aktienkurs-Effekt:</em> Der Kursmarker sinkt oder wandert nach links.`);
                this.showResults = true;
                return;
            }

            if (this.totalShares !== 100) {
                alert(`Fehler: Die Summe der Anteile muss exakt 100% ergeben. Aktuell: ${this.totalShares}%`);
                return;
            }

            // Dividenden pro Shareholder ausrechnen
            for (const [key, percent] of Object.entries(this.shares)) {
                if (percent > 0) {
                    const payoutAmount = Math.round(this.revenue * (percent / 100));
                    const name = key === 'treasury' ? 'Firmenkasse (Unverkaufte Aktien)' : `Spieler ${key.replace('p', '')}`;
                    this.payoutLog.push(`<strong>${name}:</strong> +¥ ${payoutAmount} (${percent}%)`);
                }
            }
            this.payoutLog.push(`<em>Aktienkurs-Effekt:</em> Der Kursmarker steigt / rückt ein Feld nach rechts.`);
            this.showResults = true;
        }
    };
}
