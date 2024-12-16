// Обновим константы для более точной оценки позиции
const PIECE_VALUES = {
    '♟': 100,  // пешка
    '♜': 500,  // ладья
    '♞': 320,  // конь
    '♝': 330,  // слон
    '♛': 900,  // ферзь
    '♚': 20000, // король
    '♙': 100,
    '♖': 500,
    '♘': 320,
    '♗': 330,
    '♕': 900,
    '♔': 20000
};

// Расширим позиционные бонусы
const POSITION_BONUS = {
    pawn: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
    ],
    knight: [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
    ],
    bishop: [
        [-20,-10,-10,-10,-10,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5, 10, 10,  5,  0,-10],
        [-10,  5,  5, 10, 10,  5,  5,-10],
        [-10,  0, 10, 10, 10, 10,  0,-10],
        [-10, 10, 10, 10, 10, 10, 10,-10],
        [-10,  5,  0,  0,  0,  0,  5,-10],
        [-20,-10,-10,-10,-10,-10,-10,-20]
    ],
    rook: [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [5, 10, 10, 10, 10, 10, 10,  5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [-5,  0,  0,  0,  0,  0,  0, -5],
        [0,  0,  0,  5,  5,  0,  0,  0]
    ],
    queen: [
        [-20,-10,-10, -5, -5,-10,-10,-20],
        [-10,  0,  0,  0,  0,  0,  0,-10],
        [-10,  0,  5,  5,  5,  5,  0,-10],
        [-5,  0,  5,  5,  5,  5,  0, -5],
        [0,  0,  5,  5,  5,  5,  0, -5],
        [-10,  5,  5,  5,  5,  5,  0,-10],
        [-10,  0,  5,  0,  0,  0,  0,-10],
        [-20,-10,-10, -5, -5,-10,-10,-20]
    ],
    kingMiddle: [
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-30,-40,-40,-50,-50,-40,-40,-30],
        [-20,-30,-30,-40,-40,-30,-30,-20],
        [-10,-20,-20,-20,-20,-20,-20,-10],
        [20, 20,  0,  0,  0,  0, 20, 20],
        [20, 30, 10,  0,  0, 10, 30, 20]
    ],
    kingEnd: [
        [-50,-40,-30,-20,-20,-30,-40,-50],
        [-30,-20,-10,  0,  0,-10,-20,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 30, 40, 40, 30,-10,-30],
        [-30,-10, 20, 30, 30, 20,-10,-30],
        [-30,-30,  0,  0,  0,  0,-30,-30],
        [-50,-30,-30,-30,-30,-30,-30,-50]
    ]
};

class ChessGame {
    constructor(boardId) {
        this.board = document.getElementById(boardId);
        this.selectedPiece = null;
        this.currentPlayer = 'white';
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        this.initializeBoard();
        this.updateTurnIndicator();
    }

    initializeBoard() {
        // Очищаем текущее состояние
        this.boardState = Array(8).fill().map(() => Array(8).fill(null));
        this.board.innerHTML = '';
        this.currentPlayer = 'white';
        
        const initialPosition = [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];

        // Создаем доску заново
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                if (initialPosition[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${row <= 1 ? 'black-piece' : 'white-piece'}`;
                    piece.textContent = initialPosition[row][col];
                    square.appendChild(piece);
                    
                    // Обновляем состояние доски
                    this.boardState[row][col] = {
                        piece: initialPosition[row][col],
                        color: row <= 1 ? 'black' : 'white'
                    };
                }

                square.addEventListener('click', () => this.handleSquareClick(square, row, col));
                this.board.appendChild(square);
            }
        }

        // Сбрасываем остальные параметры
        this.selectedPiece = null;
        this.clearHighlights();
        this.updateTurnIndicator();
    }

    updateBoardState(position) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (position[row][col]) {
                    this.boardState[row][col] = {
                        piece: position[row][col],
                        color: row <= 1 ? 'black' : 'white'
                    };
                }
            }
        }
    }

    createBoard(position) {
        this.board.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                if (position[row][col]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${row <= 1 ? 'black-piece' : 'white-piece'}`;
                    piece.textContent = position[row][col];
                    square.appendChild(piece);
                }

                square.addEventListener('click', () => this.handleSquareClick(square, row, col));
                this.board.appendChild(square);
            }
        }
    }

    handleSquareClick(square, row, col) {
        this.clearHighlights();
        const piece = this.boardState[row][col];

        if (this.selectedPiece) {
            if (this.canMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            }
            this.selectedPiece = null;
            return;
        }

        if (piece && piece.color === 'white' && this.currentPlayer === 'white') {
            this.selectedPiece = { row, col, piece: piece.piece };
            square.classList.add('highlighted');
            this.showPossibleMoves(row, col, piece.piece);
        }
    }

    clearHighlights() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('highlighted', 'possible-move', 'possible-capture');
        });
    }

    showPossibleMoves(row, col, piece) {
        const moves = this.getPossibleMoves(row, col, piece);
        moves.forEach(move => {
            const square = this.board.children[move.row * 8 + move.col];
            square.classList.add(move.capture ? 'possible-capture' : 'possible-move');
        });
    }

    getPossibleMoves(row, col, piece) {
        const moves = [];
        const isWhite = this.boardState[row][col].color === 'white';
        
        switch (piece) {
            case '♙': // Белая пешка
            case '♟': // Черная пешка
                const direction = piece === '♙' ? -1 : 1;
                const startRow = piece === '♙' ? 6 : 1;
                
                // Ход вперед на одну клетку
                if (row + direction >= 0 && row + direction < 8) {
                    if (!this.boardState[row + direction][col]) {
                        moves.push({row: row + direction, col: col});
                        
                        // Ход на две клетки с начальной позиции
                        if (row === startRow && !this.boardState[row + direction * 2][col]) {
                            moves.push({row: row + direction * 2, col: col});
                        }
                    }
                    
                    // Взятие по диагнали
                    for (let colOffset of [-1, 1]) {
                        if (col + colOffset >= 0 && col + colOffset < 8) {
                            const targetSquare = this.boardState[row + direction][col + colOffset];
                            if (targetSquare && targetSquare.color !== (piece === '♙' ? 'white' : 'black')) {
                                moves.push({
                                    row: row + direction, 
                                    col: col + colOffset, 
                                    capture: true
                                });
                            }
                        }
                    }
                }
                break;

            case '♖': // Ладья
            case '♜':
                this.addStraightMoves(row, col, moves, isWhite);
                break;

            case '♘': // Конь
            case '♞':
                const knightMoves = [
                    {row: -2, col: -1}, {row: -2, col: 1},
                    {row: -1, col: -2}, {row: -1, col: 2},
                    {row: 1, col: -2}, {row: 1, col: 2},
                    {row: 2, col: -1}, {row: 2, col: 1}
                ];
                this.addSpecialMoves(row, col, moves, knightMoves, isWhite);
                break;

            case '♗': // Слон
            case '♝':
                this.addDiagonalMoves(row, col, moves, isWhite);
                break;

            case '♕': // Ферзь
            case '♛':
                this.addStraightMoves(row, col, moves, isWhite);
                this.addDiagonalMoves(row, col, moves, isWhite);
                break;

            case '♔': // Король
            case '♚':
                const kingMoves = [
                    {row: -1, col: -1}, {row: -1, col: 0}, {row: -1, col: 1},
                    {row: 0, col: -1}, {row: 0, col: 1},
                    {row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}
                ];
                this.addSpecialMoves(row, col, moves, kingMoves, isWhite);
                break;
        }
        
        return moves;
    }

    addStraightMoves(row, col, moves, isWhite) {
        const directions = [{row: -1, col: 0}, {row: 1, col: 0}, {row: 0, col: -1}, {row: 0, col: 1}];
        
        for (let dir of directions) {
            let newRow = row + dir.row;
            let newCol = col + dir.col;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetSquare = this.boardState[newRow][newCol];
                
                if (!targetSquare) {
                    moves.push({row: newRow, col: newCol});
                } else {
                    if (targetSquare.color !== (isWhite ? 'white' : 'black')) {
                        moves.push({row: newRow, col: newCol, capture: true});
                    }
                    break; // Останавливаемся при встрече любой фигуры
                }
                
                newRow += dir.row;
                newCol += dir.col;
            }
        }
    }

    addDiagonalMoves(row, col, moves, isWhite) {
        const directions = [{row: -1, col: -1}, {row: -1, col: 1}, {row: 1, col: -1}, {row: 1, col: 1}];
        
        for (let dir of directions) {
            let newRow = row + dir.row;
            let newCol = col + dir.col;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetSquare = this.boardState[newRow][newCol];
                
                if (!targetSquare) {
                    moves.push({row: newRow, col: newCol});
                } else {
                    if (targetSquare.color !== (isWhite ? 'white' : 'black')) {
                        moves.push({row: newRow, col: newCol, capture: true});
                    }
                    break; // Останавливаемся при встрече любой фигуры
                }
                
                newRow += dir.row;
                newCol += dir.col;
            }
        }
    }

    addSpecialMoves(row, col, moves, movePatterns, isWhite) {
        for (let pattern of movePatterns) {
            const newRow = row + pattern.row;
            const newCol = col + pattern.col;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.boardState[newRow][newCol];
                if (!targetPiece) {
                    moves.push({row: newRow, col: newCol});
                } else if (targetPiece.color !== (isWhite ? 'white' : 'black')) {
                    moves.push({row: newRow, col: newCol, capture: true});
                }
            }
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.boardState[fromRow][fromCol];
        const targetPiece = this.boardState[toRow][toCol];
        
        const fromSquare = this.board.children[fromRow * 8 + fromCol];
        const toSquare = this.board.children[toRow * 8 + toCol];
        
        // Проверяем победу
        if (targetPiece && (targetPiece.piece === '♚' || targetPiece.piece === '♔')) {
            alert(piece.color === 'white' ? "Победа! Вы выиграли!" : "Поражение! Компьютер выиграл!");
            this.initializeBoard();
            return;
        }

        // Очищаем исходную клетку
        this.boardState[fromRow][fromCol] = null;
        fromSquare.innerHTML = '';

        // Очищаем целевую клетку (если там была фигура)
        toSquare.innerHTML = '';
        
        // Создаем новый элемент фигуры
        const newPieceElement = document.createElement('div');
        newPieceElement.className = `piece ${piece.color}-piece`;
        newPieceElement.textContent = piece.piece;
        
        // Обновляем состояние доски и DOM
        this.boardState[toRow][toCol] = piece;
        toSquare.appendChild(newPieceElement);

        // Меняем ход
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateTurnIndicator();

        // Ход компьютера
        if (this.currentPlayer === 'black') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeAIMove() {
        // Сначала собираем все возможные ходы пешками
        let allMoves = [];
        
        // Приоритет ходов пешками
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.boardState[row][col];
                if (piece && piece.color === 'black' && piece.piece === '♟') {
                    const moves = this.getAIPossibleMoves(row, col);
                    moves.forEach(move => {
                        allMoves.push({
                            from: { row, col },
                            to: move,
                            priority: 1
                        });
                    });
                }
            }
        }
        
        // Если нет ходов пешками, добавляем ходы другими фигурами
        if (allMoves.length === 0) {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.boardState[row][col];
                    if (piece && piece.color === 'black' && piece.piece !== '♟') {
                        const moves = this.getAIPossibleMoves(row, col);
                        moves.forEach(move => {
                            allMoves.push({
                                from: { row, col },
                                to: move,
                                priority: 0
                            });
                        });
                    }
                }
            }
        }
        
        // Выбираем случайный ход из доступных, предпочитая ходы пешками
        if (allMoves.length > 0) {
            const priorityMoves = allMoves.filter(m => m.priority === 1);
            const selectedMove = priorityMoves.length > 0 
                ? priorityMoves[Math.floor(Math.random() * priorityMoves.length)]
                : allMoves[Math.floor(Math.random() * allMoves.length)];
                
            this.makeMove(selectedMove.from.row, selectedMove.from.col, 
                         selectedMove.to.row, selectedMove.to.col);
        }
    }

    minimax(depth, alpha, beta, isMaximizingPlayer) {
        if (depth === 0) {
            return this.evaluatePosition();
        }

        if (isMaximizingPlayer) {
            let maxScore = -Infinity;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.boardState[row][col];
                    if (piece && piece.color === 'white') {
                        const moves = this.getPossibleMoves(row, col, piece.piece);
                        for (const move of moves) {
                            const tempState = JSON.parse(JSON.stringify(this.boardState));
                            this.boardState[move.row][move.col] = piece;
                            this.boardState[row][col] = null;

                            const score = this.minimax(depth - 1, alpha, beta, false);
                            this.boardState = JSON.parse(JSON.stringify(tempState));

                            maxScore = Math.max(maxScore, score);
                            alpha = Math.max(alpha, score);
                            if (beta <= alpha) break;
                        }
                    }
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = this.boardState[row][col];
                    if (piece && piece.color === 'black') {
                        const moves = this.getAIPossibleMoves(row, col);
                        for (const move of moves) {
                            const tempState = JSON.parse(JSON.stringify(this.boardState));
                            this.boardState[move.row][move.col] = piece;
                            this.boardState[row][col] = null;

                            const score = this.minimax(depth - 1, alpha, beta, true);
                            this.boardState = JSON.parse(JSON.stringify(tempState));

                            minScore = Math.min(minScore, score);
                            beta = Math.min(beta, score);
                            if (beta <= alpha) break;
                        }
                    }
                }
            }
            return minScore;
        }
    }

    getAIPossibleMoves(row, col) {
        const moves = [];
        const piece = this.boardState[row][col];

        // Простая логика для черных фигур (аналогично белым, но в противоположном направлении)
        if (piece.piece === '♟') { // Черная пешка
            if (row < 7 && !this.boardState[row+1][col]) {
                moves.push({row: row+1, col: col});
                if (row === 1 && !this.boardState[row+2][col]) {
                    moves.push({row: row+2, col: col});
                }
            }
            // Взятие по диагонали
            if (row < 7 && col > 0 && this.boardState[row+1][col-1]?.color === 'white') {
                moves.push({row: row+1, col: col-1});
            }
            if (row < 7 && col < 7 && this.boardState[row+1][col+1]?.color === 'white') {
                moves.push({row: row+1, col: col+1});
            }
        } else {
            // Для остальных фигур используем ту же логику, что и для белых
            // но проверяем возможность взятия белых фигур
            const possibleMoves = this.getPossibleMoves(row, col, piece.piece);
            moves.push(...possibleMoves.filter(move => 
                !this.boardState[move.row][move.col] || 
                this.boardState[move.row][move.col].color === 'white'
            ));
        }

        return moves;
    }

    updateBoardDisplay() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.board.children[row * 8 + col];
                const piece = this.boardState[row][col];

                // Очищаем клетку
                square.innerHTML = '';

                // Если есть фигура, отображаем её
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color}-piece`;
                    pieceElement.textContent = piece.piece;
                    square.appendChild(pieceElement);
                }
            }
        }
    }

    updateTurnIndicator() {
        const turnIndicator = document.getElementById('current-turn');
        const indicatorContainer = turnIndicator.parentElement;
        
        if (this.currentPlayer === 'white') {
            turnIndicator.textContent = 'белых';
            indicatorContainer.className = 'turn-indicator white-turn';
        } else {
            turnIndicator.textContent = 'черных';
            indicatorContainer.className = 'turn-indicator black-turn';
        }
    }

    // Добавим новый метод для проверки возможности хода
    canMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.boardState[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;
        
        const possibleMoves = this.getPossibleMoves(fromRow, fromCol, piece.piece);
        return possibleMoves.some(move => 
            move.row === toRow && 
            move.col === toCol && 
            (move.capture === undefined || move.capture === (this.boardState[toRow][toCol] !== null))
        );
    }

    evaluatePosition() {
        let score = 0;
        let materialCount = 0;
        let isEndgame = false;
        
        // Анализ угроз и защиты
        const threats = this.analyzeThreatMap();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.boardState[row][col];
                if (!piece) continue;

                const isWhite = piece.color === 'white';
                const multiplier = isWhite ? 1 : -1;
                
                // Базовая ценность фигуры
                let value = PIECE_VALUES[piece.piece] * multiplier;

                // Оценка угроз для фигуры
                const threatLevel = threats[row][col];
                if (threatLevel) {
                    if (isWhite) {
                        value -= threatLevel * 50; // Штраф за угрозу белым фигурам
                    } else {
                        value += threatLevel * 50; // Бонус за угрозу черным фигурам
                    }
                }

                // Защита важных фигур
                if (piece.piece === '♚' || piece.piece === '♔') {
                    value += this.evaluateKingSafety(row, col, isWhite) * multiplier;
                }

                // Атака на важные фи��уры противника
                const attackValue = this.evaluateAttackPotential(row, col, isWhite);
                value += attackValue * multiplier;

                // Контроль центра
                if ((row >= 2 && row <= 5) && (col >= 2 && col <= 5)) {
                    value += 30 * multiplier;
                }

                score += value;
            }
        }
        
        return score;
    }

    // Анализ карты угроз на доске
    analyzeThreatMap() {
        const threats = Array(8).fill().map(() => Array(8).fill(0));
        
        // Пров��ряем все возможные ходы и отмечаем угрозы
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.boardState[row][col];
                if (!piece) continue;

                const moves = this.getPossibleMoves(row, col, piece.piece);
                moves.forEach(move => {
                    const targetPiece = this.boardState[move.row][move.col];
                    if (targetPiece) {
                        // Увеличиваем уровень угрозы на основе ценности атакующей фигуры
                        threats[move.row][move.col] += PIECE_VALUES[piece.piece] / 1000;
                    }
                });
            }
        }
        
        return threats;
    }

    // Оценка безопасности короля
    evaluateKingSafety(row, col, isWhite) {
        let safety = 0;
        
        // Проверяем защиту пешками
        const pawnDirection = isWhite ? -1 : 1;
        for (let offset = -1; offset <= 1; offset++) {
            if (col + offset >= 0 && col + offset < 8) {
                const pawnRow = row + pawnDirection;
                if (pawnRow >= 0 && pawnRow < 8) {
                    const piece = this.boardState[pawnRow][col + offset];
                    if (piece && piece.color === (isWhite ? 'white' : 'black') && 
                        (piece.piece === '♙' || piece.piece === '♟')) {
                        safety += 50;
                    }
                }
            }
        }

        // Штраф за открытые линии перед королем
        for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c++) {
            let isOpenFile = true;
            for (let r = Math.min(row + (isWhite ? -1 : 1), 7); 
                 isWhite ? r >= 0 : r < 8; 
                 r += (isWhite ? -1 : 1)) {
                if (this.boardState[r][c]) {
                    isOpenFile = false;
                    break;
                }
            }
            if (isOpenFile) safety -= 30;
        }

        return safety;
    }

    // Оценка потенциала атаки
    evaluateAttackPotential(row, col, isWhite) {
        let attackValue = 0;
        const piece = this.boardState[row][col];
        
        // Получаем все возможные ходы фигуры
        const moves = this.getPossibleMoves(row, col, piece.piece);
        
        moves.forEach(move => {
            const targetPiece = this.boardState[move.row][move.col];
            if (targetPiece && targetPiece.color !== piece.color) {
                // Увеличиваем ценность атаки на важные фигуры
                let targetValue = PIECE_VALUES[targetPiece.piece];
                
                // Бонус за атаку на незащищенные фигуры
                if (!this.isPieceProtected(move.row, move.col, !isWhite)) {
                    targetValue *= 1.5;
                }
                
                // Дополнительный бонус за атаку на короля или ферзя
                if (targetPiece.piece === '♔' || targetPiece.piece === '♚' ||
                    targetPiece.piece === '♕' || targetPiece.piece === '♛') {
                    targetValue *= 2;
                }
                
                attackValue += targetValue / 100;
            }
        });
        
        return attackValue;
    }

    // Проверка защищенности фигуры
    isPieceProtected(row, col, isWhite) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.boardState[r][c];
                if (piece && piece.color === (isWhite ? 'white' : 'black')) {
                    const moves = this.getPossibleMoves(r, c, piece.piece);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame('chess-board');
}); 