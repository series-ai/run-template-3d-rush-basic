export class FlappyUI {
    private scoreElement: HTMLElement
    private overlayElement: HTMLElement
    private overlayText: HTMLElement
    private flashElement: HTMLElement
    private leaderboardElement: HTMLElement | null = null
    private leaderboardBlocker: (() => void) | null = null
    private deadScore = 0
    private deadBest = 0
    private onContinueCallback: (() => void) | null = null

    constructor() {
        this.scoreElement = this.createScoreElement()
        const { overlay, text } = this.createOverlay()
        this.overlayElement = overlay
        this.overlayText = text
        this.flashElement = this.createFlashElement()

        document.body.appendChild(this.scoreElement)
        document.body.appendChild(this.overlayElement)
        document.body.appendChild(this.flashElement)

        this.showIdle()
    }

    private createScoreElement(): HTMLElement {
        this.injectFont()
        const el = document.createElement("div")
        el.className = "title-outline-brown"
        Object.assign(el.style, {
            position: "fixed",
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "64px",
            fontWeight: "700",
            fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
            pointerEvents: "none",
            zIndex: "100",
            letterSpacing: "2px",
        })
        el.textContent = "0"
        return el
    }

    private createOverlay(): { overlay: HTMLElement; text: HTMLElement } {
        const overlay = document.createElement("div")
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: "101",
        })

        const text = document.createElement("div")
        Object.assign(text.style, {
            color: "white",
            fontSize: "28px",
            fontWeight: "bold",
            fontFamily: "'Segoe UI', sans-serif",
            textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            textAlign: "center",
            lineHeight: "1.6",
        })

        overlay.appendChild(text)
        return { overlay, text }
    }

    private isMobile(): boolean {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0
    }

    public setOnContinue(callback: () => void): void {
        this.onContinueCallback = callback
    }

    public showIdle(): void {
        this.injectFont()
        this.scoreElement.style.display = "none"
        this.overlayElement.style.display = "flex"
        const tapOrClick = this.isMobile() ? "Tap" : "Click or press Space"
        this.overlayText.innerHTML = ""
        const startSpan = document.createElement("span")
        startSpan.textContent = `${tapOrClick} to start!`
        startSpan.className = "title-outline-brown"
        Object.assign(startSpan.style, {
            fontSize: "28px",
            fontWeight: "700",
            fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
            display: "inline-block",
            animation: "retry-pulse 1s ease-in-out infinite",
        })
        this.overlayText.appendChild(startSpan)
    }

    public showPlaying(): void {
        this.scoreElement.style.display = "block"
        this.overlayElement.style.display = "none"
        this.hideLeaderboard()
    }

    public showDead(score: number, best: number): void {
        this.scoreElement.style.display = "none"
        this.deadScore = score
        this.deadBest = best
        this.overlayElement.style.display = "none"
    }

    private createFlashElement(): HTMLElement {
        const el = document.createElement("div")
        Object.assign(el.style, {
            position: "fixed",
            inset: "0",
            backgroundColor: "white",
            opacity: "0",
            pointerEvents: "none",
            zIndex: "200",
            transition: "opacity 0.3s ease-out",
        })
        return el
    }

    public flashScreen(): void {
        this.flashElement.style.transition = "none"
        this.flashElement.style.opacity = "0.7"
        requestAnimationFrame(() => {
            this.flashElement.style.transition = "opacity 0.3s ease-out"
            this.flashElement.style.opacity = "0"
        })
    }

    public updateScore(score: number): void {
        this.scoreElement.textContent = String(score)
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
                .text-outline-brown {
                    color: #ffdea6;
                    -webkit-text-stroke: 3px #7b3e1f;
                    paint-order: stroke fill;
                    text-shadow: 0 3px 0 #5b2e12, 0 4px 6px rgba(0,0,0,0.35);
                    padding: 2px 3px;
                }
                .title-outline-brown {
                    color: #ffdea6;
                    -webkit-text-stroke: 4px #7b3e1f;
                    paint-order: stroke fill;
                    text-shadow: 0 3px 0 #5b2e12;
                    padding: 2px 4px;
                }
                @keyframes retry-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    public showLeaderboard(podium: any, rank: any, currentUsername: string): void {
        this.hideLeaderboard()
        this.injectFont()

        const compact = window.innerHeight < 450

        this.overlayElement.style.display = "none"

        const container = document.createElement("div")
        Object.assign(container.style, {
            position: "fixed",
            inset: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0",
            boxSizing: "border-box",
            zIndex: "102",
            fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
        })

        const blockKeydown = (e: Event) => { e.stopPropagation(); e.preventDefault() }
        document.addEventListener("keydown", blockKeydown, true)
        container.addEventListener("pointerdown", (e) => { e.stopPropagation() })
        this.leaderboardBlocker = () => {
            document.removeEventListener("keydown", blockKeydown, true)
        }

        const wrapper = document.createElement("div")
        Object.assign(wrapper.style, {
            position: "relative",
            width: compact ? "min(92vw, 340px)" : "min(90vw, 400px)",
            maxHeight: "100%",
            display: "flex",
            flexDirection: "column",
        })

        const headerContainer = document.createElement("div");
        Object.assign(headerContainer.style, {
            alignSelf: "center",
            background: "linear-gradient(180deg, #d38753 0%, #b45e2c 100%)",
            borderRadius: compact ? "16px" : "30px",
            padding: compact ? "3px" : "6px",
            boxShadow: "0 6px 12px rgba(0,0,0,0.3), inset 0 2px 6px rgba(255,255,255,0.4)",
            border: compact ? "2px solid #6b3e1f" : "4px solid #6b3e1f",
            whiteSpace: "nowrap",
            marginBottom: compact ? "-14px" : "-24px",
            zIndex: "1",
        });

        const headerInner = document.createElement("div");
        Object.assign(headerInner.style, {
            background: "linear-gradient(180deg, #f2d4a6 0%, #e3a96e 100%)",
            borderRadius: compact ? "12px" : "20px",
            padding: compact ? "3px 14px" : "8px 30px",
            border: compact ? "2px solid #ffe8c4" : "3px solid #ffe8c4",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
        });

        const headerText = document.createElement("span");
        headerText.className = "title-outline-brown";
        headerText.textContent = "LEADERBOARD";
        Object.assign(headerText.style, {
            fontSize: compact ? "16px" : "28px",
            fontWeight: "700",
            letterSpacing: "1px",
        });

        headerInner.appendChild(headerText);
        headerContainer.appendChild(headerInner);
        wrapper.appendChild(headerContainer);

        const panel = document.createElement("div")
        Object.assign(panel.style, {
            width: "100%",
            boxSizing: "border-box",
            background: "linear-gradient(180deg, rgba(162, 240, 245, 0.9) 0%, rgba(105, 215, 230, 0.95) 100%)",
            border: compact ? "4px solid rgba(255, 255, 255, 0.7)" : "6px solid rgba(255, 255, 255, 0.7)",
            borderRadius: compact ? "20px" : "40px",
            padding: compact ? "24px 14px 14px" : "40px 30px 24px",
            boxShadow: "inset 0 0 30px rgba(255,255,255,0.8), inset 0 0 10px #70d6e6, 0 10px 30px rgba(0,0,0,0.3)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flex: "1",
            minHeight: "0",
        })

        const scoreRow = document.createElement("div");
        Object.assign(scoreRow.style, {
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            gap: compact ? "16px" : "24px",
            marginBottom: compact ? "4px" : "8px",
            flexShrink: "0",
        });

        const scoreLabel = document.createElement("span");
        scoreLabel.className = "text-outline-brown";
        scoreLabel.innerHTML = `Score: <b>${this.deadScore}</b>`;
        Object.assign(scoreLabel.style, {
            fontSize: compact ? "15px" : "22px",
            fontWeight: "600",
        });

        const bestLabel = document.createElement("span");
        bestLabel.className = "text-outline-brown";
        bestLabel.innerHTML = `Best: <b>${this.deadBest}</b>`;
        Object.assign(bestLabel.style, {
            fontSize: compact ? "15px" : "22px",
            fontWeight: "600",
        });

        scoreRow.appendChild(scoreLabel);
        scoreRow.appendChild(bestLabel);
        panel.appendChild(scoreRow);

        const isAnonymous = !currentUsername || currentUsername.toLowerCase().startsWith("anonymous")
        if (isAnonymous) {
            const loginWarning = document.createElement("div");
            loginWarning.className = "text-outline-brown";
            loginWarning.textContent = "Log in to appear on the leaderboard!";
            Object.assign(loginWarning.style, {
                textAlign: "center",
                fontSize: compact ? "12px" : "16px",
                fontWeight: "600",
                marginBottom: compact ? "4px" : "8px",
                color: "#ff6b6b",
                flexShrink: "0",
            });
            panel.appendChild(loginWarning);
        }

        const entriesContainer = document.createElement("div");
        Object.assign(entriesContainer.style, {
            display: "flex",
            flexDirection: "column",
            gap: compact ? "4px" : "8px",
            overflowY: "auto",
            flex: "1",
            minHeight: "0",
            WebkitOverflowScrolling: "touch",
        });

        const rawEntries = podium?.entries ?? podium?.topScores ?? podium?.scores ?? []
        const entries = [...rawEntries]
            .filter((e: any) => {
                const name = e.username ?? e.metadata?.username ?? ""
                return name && !name.toLowerCase().startsWith("anonymous")
            })
            .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
        if (entries.length > 0) {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i]
                const name = entry.username ?? entry.metadata?.username ?? "Player"
                const score = entry.score ?? 0
                const position = i + 1
                const isMe = name === currentUsername

                const row = document.createElement("div");
                Object.assign(row.style, {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: isMe ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.2)",
                    borderRadius: compact ? "10px" : "15px",
                    padding: compact ? "3px 8px" : "8px 15px",
                    border: isMe ? "2px solid rgba(255, 255, 255, 0.9)" : "2px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.3)",
                    flexShrink: "0",
                });

                const leftSide = document.createElement("span");
                leftSide.textContent = `${position}. ${name}`;
                leftSide.className = "text-outline-brown";
                Object.assign(leftSide.style, {
                    fontSize: compact ? "13px" : "18px",
                    fontWeight: "700",
                    color: isMe ? "#ffffff" : "#ffdea6",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginRight: "8px",
                    minWidth: "0",
                    flex: "1",
                });

                const rightSide = document.createElement("span");
                rightSide.textContent = `${score}`;
                rightSide.className = "text-outline-brown";
                Object.assign(rightSide.style, {
                    fontSize: compact ? "13px" : "18px",
                    fontWeight: "700",
                    color: isMe ? "#ffffff" : "#ffdea6",
                    flexShrink: "0",
                });

                row.appendChild(leftSide);
                row.appendChild(rightSide);
                entriesContainer.appendChild(row);
            }
        }

        panel.appendChild(entriesContainer);

        if (rank != null && typeof rank === "number") {
            const rankLabel = document.createElement("div");
            rankLabel.textContent = `Your Rank: #${rank}`;
            rankLabel.className = "text-outline-brown";
            Object.assign(rankLabel.style, {
                marginTop: compact ? "4px" : "6px",
                textAlign: "center",
                fontSize: compact ? "14px" : "20px",
                fontWeight: "700",
                color: "#ffffff",
                flexShrink: "0",
            });
            panel.appendChild(rankLabel);
        }

        const btnOuter = document.createElement("div");
        Object.assign(btnOuter.style, {
            marginTop: compact ? "8px" : "14px",
            alignSelf: "center",
            background: "linear-gradient(180deg, #d38753 0%, #b45e2c 100%)",
            borderRadius: compact ? "16px" : "24px",
            padding: compact ? "3px" : "5px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)",
            border: compact ? "2px solid #6b3e1f" : "3px solid #6b3e1f",
            cursor: "pointer",
            flexShrink: "0",
            userSelect: "none",
        });

        const btnInner = document.createElement("div");
        Object.assign(btnInner.style, {
            background: "linear-gradient(180deg, #f2d4a6 0%, #e3a96e 100%)",
            borderRadius: compact ? "12px" : "18px",
            padding: compact ? "6px 28px" : "10px 40px",
            border: compact ? "2px solid #ffe8c4" : "3px solid #ffe8c4",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.1)",
        });

        const btnText = document.createElement("span");
        btnText.textContent = "CONTINUE";
        btnText.className = "title-outline-brown";
        Object.assign(btnText.style, {
            fontSize: compact ? "16px" : "22px",
            fontWeight: "700",
            letterSpacing: "1px",
        });

        btnInner.appendChild(btnText);
        btnOuter.appendChild(btnInner);

        btnOuter.addEventListener("pointerdown", (e) => {
            e.stopPropagation()
            btnOuter.style.transform = "scale(0.93)"
        })
        btnOuter.addEventListener("pointerup", () => { btnOuter.style.transform = "scale(1)" })
        btnOuter.addEventListener("pointerleave", () => { btnOuter.style.transform = "scale(1)" })
        btnOuter.addEventListener("click", (e) => {
            e.stopPropagation()
            this.hideLeaderboard()
            this.onContinueCallback?.()
        })

        panel.appendChild(btnOuter);
        wrapper.appendChild(panel);
        container.appendChild(wrapper);
        document.body.appendChild(container)
        this.leaderboardElement = container
    }

    private showDeadRetry(): void {
        this.injectFont()
        this.overlayElement.style.display = "flex"
        const tapOrClick = this.isMobile() ? "Tap" : "Click or press Space"
        this.overlayText.innerHTML = ""
        const retrySpan = document.createElement("span")
        retrySpan.textContent = `${tapOrClick} to retry!`
        retrySpan.className = "title-outline-brown"
        Object.assign(retrySpan.style, {
            fontSize: "28px",
            fontWeight: "700",
            fontFamily: "'Fredoka', 'Segoe UI', sans-serif",
            display: "inline-block",
            animation: "retry-pulse 1s ease-in-out infinite",
        })
        this.overlayText.appendChild(retrySpan)
    }

    private hideLeaderboard(): void {
        if (this.leaderboardBlocker) {
            this.leaderboardBlocker()
            this.leaderboardBlocker = null
        }
        if (this.leaderboardElement) {
            this.leaderboardElement.remove()
            this.leaderboardElement = null
        }
    }

    public dispose(): void {
        this.scoreElement.remove()
        this.overlayElement.remove()
        this.flashElement.remove()
        this.hideLeaderboard()
    }
}
