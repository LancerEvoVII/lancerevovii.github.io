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

        // Theme-Definitionen passend zur Epoche
        themes: {
            qing: {
                bg: 'bg-[#f4edd2]',
                text: 'text-[#2c2519]',
                card: 'bg-[#fffdf6]',
                border: 'border-[#8b7355]',
                highlight: 'bg-[#e2d5b6]',
                font: 'font-qing'
            },
            industrial: {
                bg: 'bg-[#e2e8f0]',
                text: 'text-[#1e293b]',
                card: 'bg-white',
                border: 'border-slate-400',
                highlight: 'bg-slate-200',
                font: 'font-modern'
            },
            republican: {
                bg: 'bg-[#1e293b]',
                text: 'text-[#f8fafc]',
                card: 'bg-[#0f172a]',
                border: 'border-slate-700',
                highlight: 'bg-slate-800',
                font: 'font-modern'
            }
        },

        // Phasenkonfiguration (Regeln, Buttons & Musik)
        phases: {
            '2': {
                theme: 'qing',
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Temporärer Platzhalter für Erhu/Guzheng
                btnActive: 'bg-[#8b7355] text-white border-[#8b7355]',
                btnInactive: 'bg-transparent text-[#8b7355] border-[#8b7355] hover:bg-[#8b7355] hover:text-white',
                rules: [
                    'Gelbe Schienenteile sind erlaubt.',
                    'Schmalspur-Minors dürfen Strecken bauen.',
                    'Züge vom Typ 2 sind voll einsatzbereit.'
                ]
            },
            '4': {
                theme: 'industrial',
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                btnActive: 'bg-emerald-700 text-white border-emerald-700',
                btnInactive: 'bg-transparent text-emerald-700 border-emerald-700 hover:bg-emerald-700 hover:text-white',
                rules: [
                    'Grüne Upgrades sind ab sofort freigeschaltet.',
                    'Ausländische Investoren (Foreign Investors) verändern ihr Verhalten.',
                    '⚠️ Züge vom Typ 2 werden am Ende der nächsten Operationsrunde OBSOLET (rosten)!'
                ]
            },
            '6': {
                theme: 'republican',
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
                btnActive: 'bg-blue-600 text-white border-blue-600',
                btnInactive: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white',
                rules: [
                    'Braune Streckenteile dürfen verbaut werden.',
                    'Regierungszüge (G-Trains) kommen auf den Markt.',
                    '⚠️ Züge vom Typ 3 werden am Ende der nächsten Operationsrunde obsolet!'
                ]
            },
            'E': {
                theme: 'republican', // Nutzt das dunkle Industrial-Design für die Moderne
                music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
                btnActive: 'bg-indigo-600 text-white border-indigo-600',
                btnInactive: 'bg-transparent text-indigo-600 border-indigo-600 hover:bg-indigo-600 hover:text-white',
                rules: [
                    'Graue finale Upgrades (Magnetschwebebahn/Modern) sind offen.',
                    '⚠️ Züge vom Typ 4 werden sofort obsolet!'
                ]
            }
        },

        // Gibt das aktuell aktive CSS-Designpaket zurück
        get currentTheme() {
            const currentPhaseData = this.phases[this.activePhase];
            return this.themes[currentPhaseData.theme];
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
                audio.volume = 0.3; // Angenehme Hintergrundlautstärke
                // play() erfordert oft eine Nutzerinteraktion auf der Website vorab
                audio.play().catch(e => console.log("Audio-Autoplay blockiert. Warte auf Klick."));
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