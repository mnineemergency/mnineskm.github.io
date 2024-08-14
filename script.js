const player1Hand = [];
const player2Hand = [];
let deck = [];
let currentPlayer = 1;
const socket = io(); // Socket.IO Initialization

function createDeck() {
    deck = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (let suit of suits) {
        for (let value of values) {
            deck.push(value + suit);
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    player1Hand.length = 0;
    player2Hand.length = 0;
    for (let i = 0; i < 13; i++) {
        player1Hand.push(deck.pop());
        player2Hand.push(deck.pop());
    }
    displayHands();
}

function displayHands() {
    const player1Div = document.querySelector('#player1 .hand');
    const player2Div = document.querySelector('#player2 .hand');

    player1Div.innerHTML = '';
    player2Div.innerHTML = '';

    player1Hand.sort(sortCards).forEach(card => {
        const cardDiv = createCardDiv(card);
        player1Div.appendChild(cardDiv);
    });

    player2Hand.sort(sortCards).forEach(card => {
        const cardDiv = createCardDiv(card);
        player2Div.appendChild(cardDiv);
    });
}

function createCardDiv(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.textContent = card;
    cardDiv.addEventListener('click', () => playCard(card));
    return cardDiv;
}

function sortCards(a, b) {
    const valueOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suitOrder = ['♠', '♥', '♦', '♣'];
    
    const valueA = valueOrder.indexOf(a.slice(0, -1));
    const valueB = valueOrder.indexOf(b.slice(0, -1));
    const suitA = suitOrder.indexOf(a.slice(-1));
    const suitB = suitOrder.indexOf(b.slice(-1));

    if (valueA !== valueB) {
        return valueA - valueB;
    }
    return suitA - suitB;
}

function playCard(card) {
    if (currentPlayer === 1) {
        const index = player1Hand.indexOf(card);
        player1Hand.splice(index, 1);
        updateMessage("Player 1 played " + card);
        currentPlayer = 2;
    } else {
        const index = player2Hand.indexOf(card);
        player2Hand.splice(index, 1);
        updateMessage("Player 2 played " + card);
        currentPlayer = 1;
    }
    displayHands();
}

function updateMessage(message) {
    document.getElementById('message').textContent = message;
}

document.getElementById('start-game').addEventListener('click', () => {
    createDeck();
    shuffleDeck();
    dealCards();
    document.getElementById('message').textContent = "Good luck!";
});

// Socket.IO Event Handling
socket.on('cardPlayed', (card, player) => {
    playCard(card);
    updateMessage(`Player ${player} played ${card}`);
});

socket.on('updateLeaderboard', (scores) => {
    const scoresList = document.getElementById('scores');
    scoresList.innerHTML = '';
    scores.forEach(score => {
        const li = document.createElement('li');
        li.textContent = `${score.player}: ${score.points} points`;
        scoresList.appendChild(li);
    });
});
