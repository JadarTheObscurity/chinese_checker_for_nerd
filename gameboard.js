document.addEventListener('DOMContentLoaded', function() {
    GameBoard.init();
});
const GameBoard = {
    canvas: null,
    ctx: null,
    boardRadius: 300, // Adjust as necessary for your canvas size
    holeRadius: 15,
    holeMargin: 10,
    colors: ['red', 'yellow', 'black', 'white', 'green', 'blue'],
    directionOffset: [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]],
    pieces: {
        '1,-4': { color: 'blue', hp: 1 },
        '2,-4': { color: 'blue', hp: 1 },
        '3,-4': { color: 'blue', hp: 1 },
        '3,-3': { color: 'blue', hp: 1 },
        '2,-3': { color: 'blue', hp: 1 },
        '1,-3': { color: 'blue', hp: 1 },
        '0,-3': { color: 'blue', hp: 1 },
        '0,-2': { color: 'blue', hp: 1 },
        '1,-2': { color: 'blue', hp: 1 },
        '2,-2': { color: 'blue', hp: 1 },
        '-3,4': { color: 'green', hp: 1 },
        '-2,4': { color: 'green', hp: 1 },
        '-1,4': { color: 'green', hp: 1 },
        '0,3': { color: 'green', hp: 1 },
        '-1,3': { color: 'green', hp: 1 },
        '-2,3': { color: 'green', hp: 1 },
        '-3,3': { color: 'green', hp: 1 },
        '-2,2': { color: 'green', hp: 1 },
        '-1,2': { color: 'green', hp: 1 },
        '0,2': { color: 'green', hp: 1 },
    },
    selectedHole: null,
    availableMoves: [],
    jumpedPieceList: [],
    currentMoveColor: null,
    canWalk: true,
    canJump: true,



    init() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 722; // Adjust based on your needs
        this.canvas.height = 885; // Adjust based on your needs
        this.drawBoard();
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const clickedHole = this.getHoleAt(x, y);
            //check if clickedHole is in availableMoves, if it is, move the pawn there
            if (this.selectedHole && this.availableMoves.find(move => move.u === clickedHole.u && move.v === clickedHole.v)) {
                // Update  current move color and clear jumpedPieceList
                const selectedPiece = this.getPiece(this.selectedHole);
                console.log("Current move color ", this.currentMoveColor);
                if (selectedPiece.color !== this.currentMoveColor) {
                    this.jumpedPieceList = [];
                    this.currentMoveColor = selectedPiece.color;
                    this.canWalk = true;
                    this.canJump = true;
                }
                
                const move = this.availableMoves.find(move => move.u === clickedHole.u && move.v === clickedHole.v);
                if (move.type === 'jump') {
                    // check if it's a jump move
                    const jumpedHole = { u: (this.selectedHole.u + clickedHole.u) / 2, v: (this.selectedHole.v + clickedHole.v) / 2 };
                    const jumpedPiece = this.getPiece(jumpedHole);
                    this.canWalk = selectedPiece.color === jumpedPiece.color;

                    this.jumpPieces(this.selectedHole, clickedHole);
                } 
                else {
                    // A walk move
                    this.canWalk = false;
                    this.canJump = false;

                    this.pieces[`${clickedHole.u},${clickedHole.v}`] = this.pieces[`${this.selectedHole.u},${this.selectedHole.v}`];
                    delete this.pieces[`${this.selectedHole.u},${this.selectedHole.v}`];
                }
                this.selectedHole = null;
                this.availableMoves = [];
                this.drawBoard();
                if (move.type === 'walk') return;
            }

            if (this.pieces[`${clickedHole.u},${clickedHole.v}`] ) {
                this.selectedHole = clickedHole;
                const selectedPiece = this.getPiece(this.selectedHole);
                // update available moves
                if (this.pieces[`${clickedHole.u},${clickedHole.v}`].hp !== 0) {
                    this.availableMoves = this.getAvailableMoves(clickedHole, this.canWalk || selectedPiece.color !== this.currentMoveColor, this.canJump || selectedPiece.color !== this.currentMoveColor);
                }
                else {
                    // If hp is zero, can only walk, no jump
                    this.availableMoves = this.getAvailableMoves(clickedHole, true, false);
                }
            } else {
                this.selectedHole = null;
            }
            this.drawBoard();
        }); 
    },
    getAvailableMoves(hole, canWalk, canJump) {
    const moves = [];
    console.log("jumped piece ", this.jumpedPieceList)
    this.directionOffset.forEach(offset => {
        const walkNeighbor = { u: hole.u + offset[0], v: hole.v + offset[1] };
        if (canWalk && !this.pieces[`${walkNeighbor.u},${walkNeighbor.v}`] && this.valid_coord(walkNeighbor.u, walkNeighbor.v)) {
            moves.push({ ...walkNeighbor, type: 'walk' });
        }

        const jumpNeighbor = { u: hole.u + 2 * offset[0], v: hole.v + 2 * offset[1] };
        if (canJump && this.pieces[`${walkNeighbor.u},${walkNeighbor.v}`] && !this.pieces[`${jumpNeighbor.u},${jumpNeighbor.v}`] && this.valid_coord(jumpNeighbor.u, jumpNeighbor.v)) {
            // Check if the jumped piece is not in the jumpedPieceList
            if (!this.jumpedPieceList.includes(this.pieces[`${walkNeighbor.u},${walkNeighbor.v}`])) {
                moves.push({ ...jumpNeighbor, type: 'jump' });
            }
        }
    });
    return moves;
    },

    getHoleAt(x, y) {
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const holeGap = this.holeRadius * 2 + this.holeMargin;
        const base_u = {x: 1 * holeGap, y: 0}
        const base_v = {x: 0.5 * holeGap, y: 0.8660254038 * holeGap}

        for (let u = -8; u <= 8; u++) {
            for (let v = -8; v <= 8; v++) {
                if (this.valid_coord(u, v)) {
                    let holeX = u * base_u.x + v * base_v.x;
                    let holeY = u * base_u.y + v * base_v.y;
                    holeX = center.x + holeX;
                    holeY = center.y - holeY;

                    const dx = x - holeX;
                    const dy = y - holeY;
                    if (Math.sqrt(dx * dx + dy * dy) <= this.holeRadius) {
                        return { u, v };
                    }
                }
            }
        }

        return null;
    },


    valid_coord(u, v) {
        return (u <= 4 
            && v <= 4
            && u+v >= -4)
            &&
            ( u >= -4
            && v >= -4
            && u+v <= 4);
    },

    // Write a function getPiece(hole)
    getPiece(hole) {
        return this.pieces[`${hole.u},${hole.v}`];
    },

    jumpPieces(fromHole, toHole) {
        const jumpedHole = { u: (fromHole.u + toHole.u) / 2, v: (fromHole.v + toHole.v) / 2 };
        const jumpedPiece = this.pieces[`${jumpedHole.u},${jumpedHole.v}`];
        const movingPiece = this.pieces[`${fromHole.u},${fromHole.v}`];
        if (jumpedPiece && movingPiece) {
            if (jumpedPiece.color === movingPiece.color) {
                if (jumpedPiece.hp !== 0) {
                    jumpedPiece.hp += movingPiece.hp;
                }
            }
            else {
                jumpedPiece.hp *= movingPiece.hp;
            }
            jumpedPiece.hp %= 36;
            // Add the jummped piece to this.jumpedPieceList
            this.jumpedPieceList.push(jumpedPiece);
            delete this.pieces[`${fromHole.u},${fromHole.v}`];
            this.pieces[`${toHole.u},${toHole.v}`] = movingPiece;
        }
    },

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the six triangles and the center hexagon
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        const angleIncrement = Math.PI / 3;
        const holeGap = this.holeRadius * 2 + this.holeMargin;
        const base_u = {x: 1 * holeGap, y: 0}
        const base_v = {x: 0.5 * holeGap, y: 0.8660254038 * holeGap}

        this.displayPieceCounts();
        
        coords = []
        for (let u = -8; u <= 8; u++) {
            for (let v = -8; v <= 8; v++) {
                if (this.valid_coord(u, v)) {
                    coords.push([u, v])
                }
            }
        }

        coords.forEach(i => {
            let u = i[0], v = i[1];
            let x = u * base_u.x + v * base_v.x;
            let y = u * base_u.y + v * base_v.y;
            const color = (this.highlightedHole && this.highlightedHole.u === u && this.highlightedHole.v === v) ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
            this.drawHole(center.x + x, center.y - y, color)
            const piece = this.pieces[`${u},${v}`];
                if (piece) {
                    if (piece.hp % 6 === 0) {
                        const highlightColor = 'rgba(255, 0 , 0, 1)'; // Change this to the desired highlight color
                        this.drawHole(center.x + x, center.y - y, highlightColor);
                    }
                    this.drawPiece(center.x + x, center.y - y, piece.color);
                    this.ctx.fillStyle = 'white';
                    this.ctx.font = '10px Arial';
                    const textWidth = this.ctx.measureText(piece.hp).width;
                    const fontSize = 16; // match this with the font size above
                    this.ctx.fillText(piece.hp, center.x + x - textWidth / 2, center.y - y + fontSize / 2);
                }
            });

        if (this.selectedHole) {
            // Highlight the available moves
            this.availableMoves.forEach(move => {
                const x = move.u * base_u.x + move.v * base_v.x;
                const y = move.u * base_u.y + move.v * base_v.y;
                const selectedPiece = this.pieces[`${this.selectedHole.u},${this.selectedHole.v}`];
                const colorMap = {
                    'red': '255, 0, 0',
                    'blue': '0, 0, 255',
                    'green': '0, 255, 0',
                    // Add more colors if needed
                };
                const rgbColor = selectedPiece ? colorMap[selectedPiece.color] : '0, 255, 0';
                const highlightColor = `rgba(${rgbColor}, 0.5)`;
                this.drawHole(center.x + x, center.y - y, highlightColor);
            });
        }
    },

    drawHole(x, y, color = 'rgba(255, 255, 255, 0.5)') {
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.holeRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.stroke();
    },
    // In your GameBoard object
    drawPiece(x, y, color) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.holeRadius * 4 / 5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    },
displayPieceCounts() {
    const counts = {
        green: { 0: 0, 6: 0, 12: 0, 18: 0, 24: 0 },
        blue: { 0: 0, 6: 0, 12: 0, 18: 0, 24: 0 }
    };

    for (let key in this.pieces) {
        const piece = this.pieces[key];
        if ([0, 6, 12, 18, 24].includes(piece.hp) && (piece.color === 'green' || piece.color === 'blue')) {
            counts[piece.color][piece.hp]++;
        }
    }

    const greenCountsElement = document.getElementById('greenCounts');
    const blueCountsElement = document.getElementById('blueCounts');

    greenCountsElement.innerHTML = this.createTable('Green', counts.green);
    blueCountsElement.innerHTML = this.createTable('Blue', counts.blue);
},

createTable(color, counts) {
    let table = `<table><tr><th>${color}</th><th>Count</th></tr>`;
    for (let hp in counts) {
        table += `<tr><td>${hp}</td><td>${counts[hp]}</td></tr>`;
    }
    table += '</table>';
    return table;
}


};

