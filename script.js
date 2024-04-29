document.addEventListener("DOMContentLoaded", function() {
    const board = document.getElementById('chessboard');
    let selectedPawn = null;
    // Direction offsets for up, down, left, and right movements
    const directionOffsets = [-8, 8, -1, 1, -16, 16, -2, 2]; // Corresponds to moving up, down, left, and right

    // Create the board and initialize pawns with HP
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell ' + ((i + j) % 2 === 0 ? 'white' : 'black');
            cell.dataset.index = i * 8 + j;
            board.appendChild(cell);

            //White
            if (i >= 6 && (j === 2 || j === 5) || i >= 5 && (j === 3 || j === 4)) {
                cell.appendChild(createPawn('white-pawn', i * 8 + j));
            }
            //Black
            if (i <= 1 && (j === 2 || j === 5) || i <= 2 && (j === 3 || j === 4)) {
                cell.appendChild(createPawn('black-pawn', i * 8 + j));
            }
        }
    }

    function createPawn(name, index) {
        const pawn = document.createElement('div');
        pawn.className = 'pawn ' + name;
        pawn.dataset.hp = 1; // Starting HP
        pawn.dataset.index = index; // Starting HP
        pawn.dataset.name = name; // Starting HP
        pawn.textContent = pawn.dataset.hp; // Display HP
        pawn.addEventListener('click', function() {
            if (selectedPawn) {
                selectedPawn.classList.remove('highlight');
            }
            selectedPawn = pawn;
            pawn.classList.add('highlight');
            if (pawn.dataset.hp > 0)
                showMoves(parseInt(pawn.parentNode.dataset.index));
        });
        return pawn
    }

    function showMoves(index) {
        clearHighlights();
        // Logic to show available moves goes here...
        directionOffsets.forEach(offset => {
            const targetIndex = index + offset;
            if (isValidMove(index, targetIndex)) {
                const targetCell = board.children[targetIndex];
                if (!targetCell.firstChild || canJump(index, targetIndex, offset)) {
                    targetCell.classList.add('available');
                    targetCell.addEventListener('click', movePawn);
                }
            }
        });
    }


    // function isValidMove(fromIndex, toIndex) {


    function canJump(fromIndex, toIndex, offset) {
        // Jumping logic: must jump over another pawn
        if (Math.abs(offset) === 1 || Math.abs(offset) === 8) {
            const middleIndex = Math.floor((fromIndex + toIndex) / 2);
            const middleCell = board.children[middleIndex];
            return middleCell.firstChild && !board.children[toIndex].firstChild;
        }
        return false;
    }

    function clearHighlights() {
        document.querySelectorAll('.available').forEach(cell => {
            cell.classList.remove('available');
            cell.removeEventListener('click', movePawn);
        });
    }

    function isValidMove(fromIndex, toIndex) {
    // Check boundaries
    if (toIndex < 0 || toIndex >= 64) return false; // Out of bounds


    // Horizontal and vertical movement handling
    if (Math.abs(fromIndex - toIndex) === 1 || Math.abs(fromIndex - toIndex) === 8) {
        // Prevent wrap-around movement between rows for horizontal movement
        // if (Math.abs(fromIndex - toIndex) === 1) {
        //     return Math.floor(fromIndex / 8) === Math.floor(toIndex / 8);
        // }
        // Check if there is a piece in the target cell
        if (board.children[toIndex].firstChild) {
            return false;
        }
        return true
    }

    // Jumping over a piece
    if (Math.abs(fromIndex - toIndex) === 2 || Math.abs(fromIndex - toIndex) === 16) {
        const middleIndex = Math.floor((fromIndex + toIndex) / 2);
        const middleCell = board.children[middleIndex];
        // Check if there is a piece in the middle cell
        if (middleCell.firstChild) {
            return true;
        }
    }

    return false;
}

    function movePawn(event) {
        if (event.target.className.includes('available')) {
            event.target.appendChild(selectedPawn);
            clearHighlights();
            let currentHP = parseInt(selectedPawn.dataset.hp);

            // Check if a piece was jumped over
            const fromIndex = parseInt(selectedPawn.dataset.index);
            const toIndex = Array.from(board.children).indexOf(event.target);
            console.log("Move!")
            console.log(fromIndex, toIndex)
            if (Math.abs(fromIndex - toIndex) === 2 || Math.abs(fromIndex - toIndex) === 16) {
                console.log("Jump!")
                const middleIndex = Math.floor((fromIndex + toIndex) / 2);
                const middleCell = board.children[middleIndex];
                middlePawn = middleCell.firstChild;
                selectedHP = parseInt(selectedPawn.dataset.hp)
                middleHP = parseInt(middlePawn.dataset.hp)
                if (middlePawn.dataset.name !== selectedPawn.dataset.name) {
                    console.log("Enemy!");
                    middlePawn.dataset.hp = (middleHP * selectedHP) % 36;
                    middlePawn.textContent = middlePawn.dataset.hp;
                }
                else {
                    console.log("Friend!");
                    middlePawn.dataset.hp = (middleHP + selectedHP) % 36;
                    middlePawn.textContent = middlePawn.dataset.hp;
                }
                // Set the HP of the jumped piece to 0
            }

            selectedPawn.dataset.index = toIndex;
            selectedPawn.classList.remove('highlight');
            selectedPawn = null;
        }
    }
});
