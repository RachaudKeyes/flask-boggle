class BoggleGame {
    // create a new game at this DOM id

    constructor(boardId, secs = 60) {
        this.secs = secs; // game length
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        // create "tick" every second (1000ms)
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    // Show word in list of words
    showWord(word) {
        $(".words", this.board).append($("<li>", { text : word }));
    }

    // Show score in html
    showScore() {
        $(".score", this.board).text(this.score)
    }

    // Show status message
    showMessage(msg, cls) {
        $(".msg", this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${cls}`)
    }

    // Handle word submit
    // If word is unique and valid, add to score and show word

    async handleSubmit(evt) {
        evt.preventDefault();
        
        const $word = $(".word", this.board);
        let word = $word.val()

        // handle not a word
        if (!word) return;

        // handle already submitted word
        if (this.words.has(word)) {
            this.showMessage(`${word} has already been found`, "err");
            return;
        }

        // check server for word validity
        const res = await axios.get("/check-word", {params: {word : word}});

        
        if (res.data.result === "not-word") {
            this.showMessage(`${word} is not a valid English word`, "err");
        
        } else if (res.data.result === "not-on-board") {
            this.showMessage(`${word} is not a valid word on this board`, "err");

        } else {
            // Show word
            this.showWord(word);

            // Update and show score
            this.score += word.length;
            this.showScore();

            // Add word to words list
            this.words.add(word);

            // Show message
            this.showMessage(`Added: ${word}`, "ok");
        }

        // Reset input
        $word.val("").focus();
    }

    // Update timer in DOM
    showTimer() {
        $(".timer", this.board).text(this.secs)
    }

    // Handle seconds passing in game, "tick"

    async tick() {
        this.secs -= 1
        this.showTimer();

        // Timer reaches zero, end game
        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    // End of game
    // Score and update message
    
    async scoreGame() {
        // can no longer make guesses
        $(".add-word", this.board).hide();

        const res = await axios.post("/post-score", {score: this.score});

        if (res.data.brokeRecord) {
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final Score: ${this.score}`, "ok");
        }
    }
}
