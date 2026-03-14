export interface VolumeMenuOptions {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    isMuted: boolean;
    onMasterChange: (value: number) => void;
    onMusicChange: (value: number) => void;
    onSfxChange: (value: number) => void;
    onMuteToggle: (muted: boolean) => void;
    onClose: () => void;
}

export class VolumeMenu {
    private overlay: HTMLElement;
    private container: HTMLElement;
    private options: VolumeMenuOptions;
    private boundBlockKeydown: (e: KeyboardEvent) => void;
    private boundBlockPointer: (e: Event) => void;

    constructor(options: VolumeMenuOptions) {
        this.options = options;

        this.boundBlockKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                this.destroy();
            }
            e.stopPropagation();
        };
        this.boundBlockPointer = (e: Event) => {
            e.stopPropagation();
        };

        this.overlay = document.createElement("div");
        Object.assign(this.overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "1000",
            fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
            userSelect: "none",
        });

        // Block all input from reaching the game
        this.overlay.addEventListener("pointerdown", this.boundBlockPointer);
        this.overlay.addEventListener("pointerup", this.boundBlockPointer);
        this.overlay.addEventListener("click", this.boundBlockPointer);
        window.addEventListener("keydown", this.boundBlockKeydown, true);

        this.injectFont();

        this.container = document.createElement("div");
        Object.assign(this.container.style, {
            position: "relative",
            width: "440px",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, rgba(162, 240, 245, 0.9) 0%, rgba(105, 215, 230, 0.95) 100%)",
            border: "6px solid rgba(255, 255, 255, 0.7)",
            borderRadius: "40px",
            padding: "60px 40px 30px",
            boxShadow: "inset 0 0 30px rgba(255,255,255,0.8), inset 0 0 10px #70d6e6, 0 10px 30px rgba(0,0,0,0.3)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            gap: "25px",
        });

        const header = this.createHeader();
        this.container.appendChild(header);

        // Sliders
        const masterSlider = this.createSliderRow(
            `<svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" stroke="#e0fbfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.3));"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
            "MASTER",
            Math.round(options.masterVolume * 100),
            (val) => options.onMasterChange(val / 100)
        );
        const musicSlider = this.createSliderRow(
            `<svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" stroke="#e0fbfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.3));"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
            "MUSIC",
            Math.round(options.musicVolume * 100),
            (val) => options.onMusicChange(val / 100)
        );
        const sfxSlider = this.createSliderRow(
            `<svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)" stroke="#e0fbfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.3));"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
            "SFX",
            Math.round(options.sfxVolume * 100),
            (val) => options.onSfxChange(val / 100)
        );

        this.container.appendChild(masterSlider);
        this.container.appendChild(musicSlider);
        this.container.appendChild(sfxSlider);

        // Mute All Checkbox
        const muteContainer = this.createMuteCheckbox();
        this.container.appendChild(muteContainer);

        // Close Button
        const closeBtn = this.createCloseButton();
        this.container.appendChild(closeBtn);

        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
    }

    private injectFont() {
        if (!document.getElementById("fredoka-font")) {
            const link = document.createElement("link");
            link.id = "fredoka-font";
            link.rel = "stylesheet";
            link.href = "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap";
            document.head.appendChild(link);

            const style = document.createElement("style");
            style.textContent = `
                input[type=range].water-slider {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    width: 100%;
                    background: transparent;
                    outline: none;
                    margin: 0;
                    padding: 0;
                }
                input[type=range].water-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 44px;
                    width: 44px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #ffffff 0%, #b3e5fc 30%, #4fc3f7 70%, #0288d1 100%);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(0,0,0,0.2), inset 2px 2px 6px rgba(255,255,255,0.9);
                    cursor: pointer;
                    border: 2px solid rgba(255,255,255,0.9);
                    margin-top: -14px;
                }
                input[type=range].water-slider::-moz-range-thumb {
                    height: 44px;
                    width: 44px;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%, #ffffff 0%, #b3e5fc 30%, #4fc3f7 70%, #0288d1 100%);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(0,0,0,0.2), inset 2px 2px 6px rgba(255,255,255,0.9);
                    cursor: pointer;
                    border: 2px solid rgba(255,255,255,0.9);
                }
                input[type=range].water-slider::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 16px;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                }
                input[type=range].water-slider::-moz-range-track {
                    width: 100%;
                    height: 16px;
                    cursor: pointer;
                    background: transparent;
                    border: none;
                }
                input[type=range].water-slider::-moz-range-progress {
                    background: transparent;
                }
                input[type=range].water-slider:focus {
                    outline: none;
                    background: transparent;
                }
                input[type=range].water-slider:focus::-webkit-slider-runnable-track {
                    background: transparent;
                }
                .text-outline-brown {
                    color: #ffdea6;
                    text-shadow:
                        -2px -2px 0 #7b3e1f,
                         2px -2px 0 #7b3e1f,
                        -2px  2px 0 #7b3e1f,
                         2px  2px 0 #7b3e1f,
                         0px  3px 0 #5b2e12,
                         0px  4px 4px rgba(0,0,0,0.4);
                }
                .title-outline-brown {
                    color: #ffdea6;
                    text-shadow:
                        -2px -2px 0 #7b3e1f,
                         2px -2px 0 #7b3e1f,
                        -2px  2px 0 #7b3e1f,
                         2px  2px 0 #7b3e1f,
                         0px  3px 0 #5b2e12;
                }
            `;
            document.head.appendChild(style);
        }
    }

    private createHeader(): HTMLElement {
        const headerContainer = document.createElement("div");
        Object.assign(headerContainer.style, {
            position: "absolute",
            top: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(180deg, #d38753 0%, #b45e2c 100%)",
            borderRadius: "30px",
            padding: "6px",
            boxShadow: "0 6px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.4)",
            border: "4px solid #6b3e1f",
            whiteSpace: "nowrap",
        });

        const headerInner = document.createElement("div");
        Object.assign(headerInner.style, {
            background: "linear-gradient(180deg, #f2d4a6 0%, #e3a96e 100%)",
            borderRadius: "20px",
            padding: "8px 30px",
            border: "3px solid #ffe8c4",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
        });

        const headerText = document.createElement("span");
        headerText.textContent = "AUDIO SETTINGS";
        headerText.className = "title-outline-brown";
        Object.assign(headerText.style, {
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "1px",
        });

        headerInner.appendChild(headerText);
        headerContainer.appendChild(headerInner);
        return headerContainer;
    }

    private createSliderRow(iconSvg: string, label: string, initialValue: number, onChange: (value: number) => void): HTMLElement {
        const row = document.createElement("div");
        Object.assign(row.style, {
            display: "flex",
            alignItems: "center",
            gap: "15px",
            width: "100%",
        });

        const iconContainer = document.createElement("div");
        iconContainer.innerHTML = iconSvg;
        Object.assign(iconContainer.style, {
            width: "44px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        });

        const sliderSection = document.createElement("div");
        Object.assign(sliderSection.style, {
            flex: "1",
            display: "flex",
            flexDirection: "column",
        });

        const labelRow = document.createElement("div");
        Object.assign(labelRow.style, {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            padding: "0 4px",
        });

        const labelEl = document.createElement("span");
        labelEl.textContent = label;
        labelEl.className = "text-outline-brown";
        Object.assign(labelEl.style, {
            fontSize: "24px",
            fontWeight: "700",
        });

        const valueEl = document.createElement("span");
        valueEl.textContent = `${initialValue}%`;
        valueEl.className = "text-outline-brown";
        Object.assign(valueEl.style, {
            fontSize: "24px",
            fontWeight: "700",
        });

        labelRow.appendChild(labelEl);
        labelRow.appendChild(valueEl);

        const thumbRadius = 22;
        const trackBorder = 2;

        const sliderTrackContainer = document.createElement("div");
        Object.assign(sliderTrackContainer.style, {
            position: "relative",
            width: "100%",
            height: "20px",
            background: "rgba(255, 255, 255, 0.4)",
            borderRadius: "12px",
            border: `${trackBorder}px solid rgba(255,255,255,0.8)`,
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.15)",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
        });

        const computeFillWidth = (pct: number) => {
            return `calc(${thumbRadius}px + (100% - ${thumbRadius * 2}px) * ${pct / 100})`;
        };

        const fill = document.createElement("div");
        Object.assign(fill.style, {
            position: "absolute",
            top: `-${trackBorder}px`,
            left: `-${trackBorder}px`,
            height: "20px",
            width: computeFillWidth(initialValue),
            background: "linear-gradient(90deg, #64b5f6 0%, #29b6f6 100%)",
            borderRadius: "10px",
            pointerEvents: "none",
            boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.1)",
            zIndex: "1",
        });

        const input = document.createElement("input");
        input.type = "range";
        input.min = "0";
        input.max = "100";
        input.value = initialValue.toString();
        input.className = "water-slider";
        Object.assign(input.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            margin: "0",
            zIndex: "2",
        });

        input.addEventListener("input", (e) => {
            const val = parseInt((e.target as HTMLInputElement).value);
            valueEl.textContent = `${val}%`;
            fill.style.width = computeFillWidth(val);
            onChange(val);
        });

        sliderTrackContainer.appendChild(fill);
        sliderTrackContainer.appendChild(input);

        sliderSection.appendChild(labelRow);
        sliderSection.appendChild(sliderTrackContainer);

        row.appendChild(iconContainer);
        row.appendChild(sliderSection);

        return row;
    }

    private createMuteCheckbox(): HTMLElement {
        const container = document.createElement("div");
        Object.assign(container.style, {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "15px",
            cursor: "pointer",
        });

        const box = document.createElement("div");
        Object.assign(box.style, {
            width: "36px",
            height: "36px",
            background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(200,240,255,0.6) 100%)",
            border: "3px solid #81d4fa",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 2px 6px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.2)",
        });

        const checkMark = document.createElement("div");
        checkMark.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        checkMark.style.display = this.options.isMuted ? "block" : "none";
        box.appendChild(checkMark);

        const text = document.createElement("span");
        text.textContent = "MUTE ALL";
        text.className = "text-outline-brown";
        Object.assign(text.style, {
            fontSize: "26px",
            fontWeight: "700",
        });

        const cross = document.createElement("span");
        cross.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.4));"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

        let isMuted = this.options.isMuted;
        container.addEventListener("click", () => {
            isMuted = !isMuted;
            checkMark.style.display = isMuted ? "block" : "none";
            this.options.onMuteToggle(isMuted);
        });

        container.appendChild(box);
        container.appendChild(text);
        container.appendChild(cross);

        return container;
    }

    private createCloseButton(): HTMLElement {
        const btnContainer = document.createElement("div");
        Object.assign(btnContainer.style, {
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
        });

        const btnOuter = document.createElement("div");
        Object.assign(btnOuter.style, {
            background: "linear-gradient(180deg, #f2b872 0%, #d86c35 100%)",
            padding: "5px",
            borderRadius: "30px",
            cursor: "pointer",
            boxShadow: "0 6px 12px rgba(0,0,0,0.3)",
            transition: "transform 0.1s",
            border: "2px solid #a4481b",
        });

        const btnInner = document.createElement("div");
        Object.assign(btnInner.style, {
            background: "linear-gradient(180deg, #426e75 0%, #22434a 100%)",
            padding: "10px 50px",
            borderRadius: "25px",
            border: "3px solid #71a0a8",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 4px 6px rgba(255,255,255,0.2)",
        });

        const btnText = document.createElement("span");
        btnText.textContent = "CLOSE";
        Object.assign(btnText.style, {
            color: "#ffffff",
            fontSize: "26px",
            fontWeight: "700",
            letterSpacing: "1px",
            textShadow: "0 3px 6px rgba(0,0,0,0.6)",
            position: "relative",
            zIndex: "2",
        });

        // Add small decorative dots
        const dot1 = document.createElement("div");
        Object.assign(dot1.style, {
            position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)",
            width: "8px", height: "8px", borderRadius: "50%", background: "#a5d8d8",
            boxShadow: "0 0 6px #fff", zIndex: "1",
        });
        const dot2 = document.createElement("div");
        Object.assign(dot2.style, {
            position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)",
            width: "8px", height: "8px", borderRadius: "50%", background: "#a5d8d8",
            boxShadow: "0 0 6px #fff", zIndex: "1",
        });

        btnInner.appendChild(dot1);
        btnInner.appendChild(btnText);
        btnInner.appendChild(dot2);
        btnOuter.appendChild(btnInner);

        btnOuter.addEventListener("mousedown", () => btnOuter.style.transform = "scale(0.95)");
        btnOuter.addEventListener("mouseup", () => btnOuter.style.transform = "scale(1)");
        btnOuter.addEventListener("mouseleave", () => btnOuter.style.transform = "scale(1)");
        btnOuter.addEventListener("click", () => this.destroy());

        btnContainer.appendChild(btnOuter);
        return btnContainer;
    }

    public destroy() {
        window.removeEventListener("keydown", this.boundBlockKeydown, true);
        this.overlay.removeEventListener("pointerdown", this.boundBlockPointer);
        this.overlay.removeEventListener("pointerup", this.boundBlockPointer);
        this.overlay.removeEventListener("click", this.boundBlockPointer);
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        this.options.onClose();
    }
}
