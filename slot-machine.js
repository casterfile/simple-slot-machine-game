// Define the AngularJS application
const app = angular.module('slotMachineApp', []);

// AngularJS controller for the slot machine
app.controller('SlotMachineController', function ($scope, $window) {
    const app = new PIXI.Application({
        view: document.getElementById('slotCanvas'),
        width: $window.innerWidth * 0.9,
        height: $window.innerHeight * 0.8,
        backgroundColor: 0x1e1e1e,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    const symbols = ['7️⃣', '🍋', '🍒', '🍉', '⭐', '🔔'];

    const reelSymbolCount = 3; 
    let toggleButton, messageText;
    let isSpinning = false;
    let spinningReels = [false, false, false];
    let currentState = 'spin';

    const reels = [];
    createGame();

    // Create the game and UI elements
    function createGame() {
        createReels();
        createUIButtons();
        positionUIElements();

        // Add resize listener
        $window.addEventListener('resize', () => {
            app.renderer.resize($window.innerWidth * 0.9, $window.innerHeight * 0.8);
            positionUIElements();
        });
    }

    function createReels() {
        for (let i = 0; i < 3; i++) {
            const reel = createReel(i);
            reels.push(reel);
            app.stage.addChild(reel);
        }
    }

    function createReel(index) {
        const reelContainer = new PIXI.Container();

        // Calculate the position of each reel
        const reelSpacing = app.screen.width / 5; // Adjusted spacing to position the middle reel at the center
        reelContainer.x = (app.screen.width / 2) - (reelSpacing) + (index * reelSpacing); // Set the middle reel at the center

        reelContainer.y = app.screen.height * 0.25;

        const symbolsOnReel = [];
        const symbolSize = Math.min(app.screen.width * 0.15, app.screen.height * 0.2);

        for (let i = 0; i < reelSymbolCount; i++) {
            const symbol = new PIXI.Text(randomSymbol(), {
                fontSize: symbolSize,
                fill: "white",
                fontWeight: "bold",
            });
            symbol.anchor.set(0.5);
            symbol.x = 0;
            symbol.y = i * symbolSize - symbolSize;
            symbolsOnReel.push(symbol);
            reelContainer.addChild(symbol);
        }

        reelContainer.symbols = symbolsOnReel;
        return reelContainer;
    }

    function randomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function createUIButtons() {
        toggleButton = createButton(app.screen.width / 2, app.screen.height * 0.85, "SPIN", onButtonClick);
        messageText = new PIXI.Text('', {
            fontSize: app.screen.width > 500 ? 48 : 32, // Smaller text for mobile devices
            fill: 0xffff00,
            fontWeight: 'bold',
        });
        messageText.anchor.set(0.5);
        app.stage.addChild(messageText);
    }

    function createButton(x, y, label, action) {
        const button = new PIXI.Graphics();
        button.beginFill(0xff0000);
        const buttonWidth = app.screen.width > 500 ? 200 : 150; // Smaller button for mobile
        const buttonHeight = app.screen.width > 500 ? 70 : 50;  // Smaller button height for mobile
        button.drawRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);
        button.endFill();
        button.x = x;
        button.y = y;
        button.interactive = true;
        button.buttonMode = true;
        button.on('pointerdown', action);

        const buttonText = new PIXI.Text(label, {
            fontSize: app.screen.width > 500 ? 28 : 20, // Adjust button label size for mobile
            fill: 0xffffff,
            fontWeight: 'bold',
        });
        buttonText.anchor.set(0.5);
        button.addChild(buttonText);

        app.stage.addChild(button);
        return button;
    }

    function positionUIElements() {
        // Adjust button and message positions
        toggleButton.x = app.screen.width / 2;
        toggleButton.y = app.screen.height * 0.85;

        // Position message at the top-center
        messageText.x = app.screen.width / 2;
        messageText.y = app.screen.height * 0.05; // Moved higher to avoid covering icons

        // Position reels to align with the button and center the middle reel
        const reelSpacing = app.screen.width / 5; // Adjust spacing to align the middle reel
        for (let i = 0; i < reels.length; i++) {
            reels[i].x = (app.screen.width / 2) - (reelSpacing) + (i * reelSpacing); // Set the middle reel at the center
            reels[i].y = app.screen.height * 0.3;
        }
    }

    function onButtonClick() {
        if (currentState === 'spin') {
            startSpin();
        } else if (currentState === 'stop') {
            stopSpin();
        }
    }

    function startSpin() {
        if (isSpinning) return;

        isSpinning = true;
        messageText.text = ""; 
        spinningReels = [true, true, true];
        currentState = 'stop';
        toggleButton.children[0].text = "STOP";

        reels.forEach((reel, index) => {
            const spinInterval = setInterval(() => {
                if (spinningReels[index]) {
                    spinReel(reel);
                } else {
                    clearInterval(spinInterval);
                }
            }, 50);
        });
    }

    function stopSpin() {
        for (let i = 0; i < reels.length; i++) {
            setTimeout(() => {
                spinningReels[i] = false;
                if (i === reels.length - 1) {
                    isSpinning = false;
                    currentState = 'spin';
                    toggleButton.children[0].text = "SPIN";
                    checkWin();
                }
            }, i * 500);
        }
    }

    $window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && isSpinning) {
            stopCheatCode();
        }
    });

    function stopCheatCode() {
        reels.forEach((reel) => {
            spinningReels[0] = spinningReels[1] = spinningReels[2] = false;
            reel.symbols[1].text = '7️⃣';
        });
        isSpinning = false;
        currentState = 'spin';
        toggleButton.children[0].text = "SPIN";
        messageText.text = "Test 777 JACKPOT!";
        winningEffect();
    }

    function spinReel(reel) {
        reel.symbols.forEach((symbol) => {
            symbol.text = randomSymbol();
        });
    }

    function checkWin() {
        const middleRowSymbols = reels.map((reel) => reel.symbols[1].text);
        const isWinning = middleRowSymbols.every((symbol) => symbol === middleRowSymbols[0]);

        if (isWinning) {
            messageText.text = "JACKPOT!";
            winningEffect();
        } else {
            messageText.text = "Try Again!";
        }
    }

    function winningEffect() {
        reels.forEach((reel) => {
            reel.symbols[1].style.fill = 'yellow';
            setTimeout(() => {
                reel.symbols[1].style.fill = 'white';
            }, 500);
        });
    }
});
