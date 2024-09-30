// Define the AngularJS application
const app = angular.module('slotMachineApp', []);

// AngularJS controller for the slot machine
app.controller('SlotMachineController', function ($scope, $window) {
    // Create a PixiJS Application to manage the rendering of the slot machine
    const app = new PIXI.Application({
        view: document.getElementById('slotCanvas'), // Link to canvas element in HTML
        width: $window.innerWidth * 0.9, // Set width to 90% of window width for responsiveness
        height: $window.innerHeight * 0.8, // Set height to 80% of window height for responsiveness
        backgroundColor: 0x1e1e1e, // Set background color
        resolution: window.devicePixelRatio || 1, // Set resolution for high DPI screens
        autoDensity: true, // Ensure that density is scaled based on screen DPI
    });

    // Define the available slot machine symbols
    const symbols = ['7️⃣', '🍋', '🍒', '🍉', '⭐', '🔔']; // Array of emoji symbols for the reels

    const reelSymbolCount = 3; // Number of symbols per reel
    let toggleButton, messageText; // Variables to store spin/stop button and message text
    let isSpinning = false; // Boolean to track whether reels are spinning
    let spinningReels = [false, false, false]; // Track the spinning state of each reel
    let currentState = 'spin'; // Initial state of the button ('spin' or 'stop')

    const reels = []; // Array to hold the reel containers
    createGame(); // Call function to set up the game

    // Function to create the slot machine game and UI elements
    function createGame() {
        createReels(); // Create the reels for the slot machine
        createUIButtons(); // Create the spin/stop button and message text
        positionUIElements(); // Position the UI elements correctly on screen

        // Add event listener to resize the canvas when the window size changes
        $window.addEventListener('resize', () => {
            app.renderer.resize($window.innerWidth * 0.9, $window.innerHeight * 0.8); // Resize renderer
            positionUIElements(); // Reposition UI elements after resize
        });
    }

    // Function to create reels for the slot machine
    function createReels() {
        for (let i = 0; i < 3; i++) {
            const reel = createReel(i); // Create a reel container
            reels.push(reel); // Add the created reel to the reels array
            app.stage.addChild(reel); // Add reel to the PixiJS stage for rendering
        }
    }

    // Function to create an individual reel with symbols
    function createReel(index) {
        const reelContainer = new PIXI.Container();

        // Calculate the position of each reel to center the middle reel
        const reelSpacing = app.screen.width / 5; // Adjusted spacing to position reels evenly
        reelContainer.x = (app.screen.width / 2) - reelSpacing + (index * reelSpacing); // Set the position
        reelContainer.y = app.screen.height * 0.25; // Set the vertical position

        const symbolsOnReel = []; // Array to hold the symbols on the reel
        const symbolSize = Math.min(app.screen.width * 0.15, app.screen.height * 0.2); // Size for symbols

        // Loop to add symbols to the reel
        for (let i = 0; i < reelSymbolCount; i++) {
            const symbol = new PIXI.Text(randomSymbol(), {
                fontSize: symbolSize, // Set the font size for the symbol
                fill: "white", // Set the fill color
                fontWeight: "bold", // Set the font weight
            });
            symbol.anchor.set(0.5); // Anchor the symbol at its center
            symbol.x = 0;
            symbol.y = i * symbolSize - symbolSize; // Position each symbol vertically on the reel
            symbolsOnReel.push(symbol); // Add the symbol to the array
            reelContainer.addChild(symbol); // Add the symbol to the reel container
        }

        reelContainer.symbols = symbolsOnReel; // Store symbols in the reel container
        return reelContainer; // Return the complete reel container
    }

    // Function to get a random symbol from the symbols array
    function randomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Function to create the spin/stop button and message text
    function createUIButtons() {
        // Create the spin/stop button
        toggleButton = createButton(app.screen.width / 2, app.screen.height * 0.85, "SPIN", onButtonClick);
        
        // Create the message text to display win/lose messages
        messageText = new PIXI.Text('', {
            fontSize: app.screen.width > 500 ? 48 : 32, // Set font size depending on screen size
            fill: 0xffff00, // Set fill color to yellow
            fontWeight: 'bold', // Set font weight to bold
        });
        messageText.anchor.set(0.5); // Anchor message at its center
        app.stage.addChild(messageText); // Add message text to the stage
    }

    // Function to create a button with specified properties
    function createButton(x, y, label, action) {
        const button = new PIXI.Graphics();
        button.beginFill(0xff0000); // Set button color to red
        const buttonWidth = app.screen.width > 500 ? 200 : 150; // Set button width based on screen size
        const buttonHeight = app.screen.width > 500 ? 70 : 50; // Set button height based on screen size
        button.drawRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15); // Draw button shape
        button.endFill();
        button.x = x;
        button.y = y;
        button.interactive = true; // Make button interactive
        button.buttonMode = true; // Show pointer cursor on hover
        button.on('pointerdown', action); // Add click event listener to button

        // Create label for the button
        const buttonText = new PIXI.Text(label, {
            fontSize: app.screen.width > 500 ? 28 : 20, // Set label font size based on screen size
            fill: 0xffffff, // Set label color to white
            fontWeight: 'bold', // Set label font weight to bold
        });
        buttonText.anchor.set(0.5); // Anchor label at its center
        button.addChild(buttonText); // Add label to button

        app.stage.addChild(button); // Add button to the stage
        return button;
    }

    // Function to position the UI elements on the screen
    function positionUIElements() {
        // Set the button and message positions
        toggleButton.x = app.screen.width / 2; // Center button horizontally
        toggleButton.y = app.screen.height * 0.85; // Position button at the bottom

        // Set the message position at the top-center
        messageText.x = app.screen.width / 2;
        messageText.y = app.screen.height * 0.05; // Move higher to avoid covering icons

        // Set the position of the reels to align with the button
        const reelSpacing = app.screen.width / 5; // Adjust spacing for reels
        for (let i = 0; i < reels.length; i++) {
            reels[i].x = (app.screen.width / 2) - reelSpacing + (i * reelSpacing); // Center middle reel
            reels[i].y = app.screen.height * 0.3; // Set vertical position
        }
    }

    // Function to handle spin/stop button click
    function onButtonClick() {
        if (currentState === 'spin') {
            startSpin(); // Start spinning reels
        } else if (currentState === 'stop') {
            stopSpin(); // Stop spinning reels
        }
    }

    // Function to start spinning the reels
    function startSpin() {
        if (isSpinning) return; // Prevent multiple spins

        isSpinning = true; // Set spinning state to true
        messageText.text = ""; // Clear message text
        spinningReels = [true, true, true]; // Set all reels to spinning
        currentState = 'stop'; // Change button state to stop
        toggleButton.children[0].text = "STOP"; // Update button label to "STOP"

        // Loop through each reel and spin
        reels.forEach((reel, index) => {
            const spinInterval = setInterval(() => {
                if (spinningReels[index]) {
                    spinReel(reel); // Spin the current reel
                } else {
                    clearInterval(spinInterval); // Stop spinning when done
                }
            }, 50); // Spin interval
        });
    }

    // Function to stop each reel sequentially
    function stopSpin() {
        for (let i = 0; i < reels.length; i++) {
            setTimeout(() => {
                spinningReels[i] = false; // Stop current reel
                if (i === reels.length - 1) {
                    isSpinning = false; // Set spinning state to false when all reels stop
                    currentState = 'spin'; // Change button state to spin
                    toggleButton.children[0].text = "SPIN"; // Update button label to "SPIN"
                    checkWin(); // Check if the player won
                }
            }, i * 500); // Delay for each reel stop
        }
    }

    // Function to handle cheat code (pressing space to win)
    $window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && isSpinning) {
            stopCheatCode(); // Stop and set a winning combination
        }
    });

    // Function to set the winning combination (777) using cheat code
    function stopCheatCode() {
        reels.forEach((reel) => {
            spinningReels[0] = spinningReels[1] = spinningReels[2] = false; // Stop all reels
            reel.symbols[1].text = '7️⃣'; // Set the middle symbol to '7️⃣' for all reels
        });
        isSpinning = false; // Set spinning state to false
        currentState = 'spin'; // Change button state to spin
        toggleButton.children[0].text = "SPIN"; // Update button label to "SPIN"
        messageText.text = "Test 777 JACKPOT!"; // Display winning message
        winningEffect(); // Add visual effect for winning
    }

    // Function to spin the given reel by randomizing its symbols
    function spinReel(reel) {
        reel.symbols.forEach((symbol) => {
            symbol.text = randomSymbol(); // Set a new random symbol for each
        });
    }

    // Function to check if the middle row has a winning combination
    function checkWin() {
        const middleRowSymbols = reels.map((reel) => reel.symbols[1].text); // Get middle symbols
        const isWinning = middleRowSymbols.every((symbol) => symbol === middleRowSymbols[0]); // Check if all are equal

        if (isWinning) {
            messageText.text = "JACKPOT!"; // Display win message
            winningEffect(); // Show visual effect for winning
        } else {
            messageText.text = "Try Again!"; // Display lose message
        }
    }

    // Function to add a visual effect for winning
    function winningEffect() {
        reels.forEach((reel) => {
            reel.symbols[1].style.fill = 'yellow'; // Highlight winning symbols
            setTimeout(() => {
                reel.symbols[1].style.fill = 'white'; // Reset color after delay
            }, 500); // Duration for highlighting effect
        });
    }
});