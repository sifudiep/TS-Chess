import { Piece } from "./classes/Piece.js";
import { Coordinate } from "./classes/Coordinate.js";
import { MoveData } from "./interface/MoveData.js";
import { PieceColor } from "./enum/PieceColor.js";

const io = require("socket.io-client");

const socket = io("https://sifudiep-ts-chess.herokuapp.com/");

let moveAudio = new Audio('./sfx/move.wav');
let checkAudio = new Audio('./sfx/check.wav');
let errorAudio = new Audio('./sfx/error.wav')

function setupBoardColors() {
    let board = document.getElementById('chessBoard');
    if (board == null) throw Error;

    let lightColor = true;
    for (let i = 0; i < board.children.length; i++) {
        let row = board.children[i];
        for (let j = 0; j < row.children.length; j++) {
            lightColor ? row.children[j].className += ' light-cell' : row.children[j].className += ' dark-cell';
            lightColor ? lightColor = false : lightColor = true;
        }
        lightColor ? lightColor = false : lightColor = true;
    }
} 

let turn : PieceColor = PieceColor.White;
let playerColor : PieceColor = PieceColor.None;

function setupDefaultBoardPieces() {
    // White pieces...
    for (let i = 0; i < 8; i++) {
        pawnCreator(PieceColor.White, new Coordinate(i, 1));
    }
    rookCreator(PieceColor.White, new Coordinate(0,0)); 
    rookCreator(PieceColor.White, new Coordinate(7,0)); 
    knightCreator(PieceColor.White, new Coordinate(1,0));
    knightCreator(PieceColor.White, new Coordinate(6,0));
    bishopCreator(PieceColor.White, new Coordinate(2,0));
    bishopCreator(PieceColor.White, new Coordinate(5,0));
    kingCreator(PieceColor.White, new Coordinate(4,0));
    queenCreator(PieceColor.White, new Coordinate(3,0));

    // Black pieces...
    for (let i = 0; i < 8; i++) {
        pawnCreator(PieceColor.Black, new Coordinate(i, 6));
    }
    rookCreator(PieceColor.Black, new Coordinate(0,7)); 
    rookCreator(PieceColor.Black, new Coordinate(7,7)); 
    knightCreator(PieceColor.Black, new Coordinate(1,7));
    knightCreator(PieceColor.Black, new Coordinate(6,7));
    bishopCreator(PieceColor.Black, new Coordinate(2,7));
    bishopCreator(PieceColor.Black, new Coordinate(5,7));
    kingCreator(PieceColor.Black, new Coordinate(4,7));
    queenCreator(PieceColor.Black, new Coordinate(3,7));
}

let Board : Piece[][] | undefined[][] = [[],[],[],[],[],[],[],[]] 

let lastTouchedPiece : Piece;

let whiteKing : Piece; 
let blackKing : Piece;
let whiteKingIsChecked : boolean = false;
let blackKingIsChecked : boolean = false;


function initGame() {
    setupBoardColors();
    setupDefaultBoardPieces();
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
    updateAllLegalMovesAndFindChecks();
    detectMultiplayerMove()
}

function updatePieceJustMoved() {
    for (let y = 0; y <= 7; y++) {
        for (let x = 0; x <= 7; x++) {
            let boardElement = Board[x][y];
            if (boardElement !== undefined && boardElement.Name === "Pawn" && boardElement.JustMadeFirstMove) {
                boardElement.JustMadeFirstMove = false;
            }
        }
    }
}

function moveLikePawn(self : Piece) {
    // auto promoting into queen
    if (self.CurrentPosition.Y == 0 || self.CurrentPosition.Y == 7) {
        let coordinate : Coordinate = self.CurrentPosition;
        let color : PieceColor = self.Color;
        destroyPiece(self.CurrentPosition);
        queenCreator(color, coordinate);
        drawVisualCell(Board[coordinate.X][coordinate.Y]!);
    }

    if (self.Color === PieceColor.White) {

        if (self.CurrentPosition.X-1 >= 0) {
            if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y+1] !== undefined) {
                if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y+1]?.Color === PieceColor.Black){
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y+1));
                }
            }
        }

        if (self.CurrentPosition.X+1 <= 7) {
            if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y+1] !== undefined) {
                if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y+1]?.Color === PieceColor.Black){
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y+1));
                }
            }
        }

        if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 1] === undefined) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y+1));

            if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 2] === undefined && self.HasBeenMoved === false) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y+2));
            }
        }

        if (self.CurrentPosition.X+1 <= 7 &&
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y] !== undefined && 
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.Name === "Pawn" && 
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.JustMadeFirstMove && 
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y+1));
        }

        if (self.CurrentPosition.X-1 >= 0 &&
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y] !== undefined && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.Name === "Pawn" && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.JustMadeFirstMove && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y+1));
        }

        
    } else if (self.Color === PieceColor.Black) {
        if (self.CurrentPosition.X-1 >= 0) {
            if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y-1] !== undefined) {
                if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y-1] ?.Color === PieceColor.White){
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y-1));
                }
            }
        }

        if (self.CurrentPosition.X+1 <= 7) {
            if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y-1] !== undefined) {
                if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y-1]?.Color === PieceColor.White){
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y-1));
                }
            }
        }

        if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 1] === undefined) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y-1));

            if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 2] === undefined && self.HasBeenMoved === false) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y-2));
            }
        } 

        if (self.CurrentPosition.X+1 <= 7 &&
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y] !== undefined && 
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.Name === "Pawn" && 
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.JustMadeFirstMove && 
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y-1));
        }

        if (self.CurrentPosition.X-1 >= 0 &&
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y] !== undefined && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.Name === "Pawn" && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.JustMadeFirstMove && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y-1));
        }
    } 

}

function moveLikeRook(self : Piece) {
    for (let i = self.CurrentPosition.X - 1; i >= 0; i--) {
        if (Board[i][self.CurrentPosition.Y]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        } else {
            break;
        }
    } 

    for (let i = self.CurrentPosition.X + 1; i <= 7; i++) {
        if (Board[i][self.CurrentPosition.Y]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        } else {
            break
        }
    } 
    
    for (let i = self.CurrentPosition.Y - 1; i >= 0; i--) {
        if (Board[self.CurrentPosition.X][i]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    } 

    for (let i = self.CurrentPosition.Y + 1; i <= 7; i++) {
        if (Board[self.CurrentPosition.X][i]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    } 
}

function moveLikeBishop(self : Piece) {
    for (let i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y + i <= 7; i++) {
        if (Board[self.CurrentPosition.X+i][self.CurrentPosition.Y+i]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+i, self.CurrentPosition.Y+i));
            if (Board[self.CurrentPosition.X+i][self.CurrentPosition.Y+i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

    for (let i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y + i <= 7; i++) {
        if (Board[self.CurrentPosition.X-i][self.CurrentPosition.Y+i]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-i, self.CurrentPosition.Y+i));
            if (Board[self.CurrentPosition.X-i][self.CurrentPosition.Y+i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

    for (let i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y - i >= 0; i++) {
        if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X+i][self.CurrentPosition.Y-i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

    for (let i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y - i >= 0; i++) {
        if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y - i]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y-i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

}

function moveLikeKnight(self : Piece) {
    let y = self.CurrentPosition.Y;
    let x = self.CurrentPosition.X;

    if (y + 2 <= 7) {
        if (x + 1 <= 7 && Board[x+1][y+2]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x+1,y+2));
        }

        if (x - 1 >= 0 && Board[x-1][y+2]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x-1,y+2));
        }
    }

    if (y - 2 >= 0) {
        if (x + 1 <= 7 && Board[x+1][y-2]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x+1,y-2));
        }

        if (x - 1 >= 0 && Board[x-1][y-2]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x-1,y-2));
        }
    }

    if (x + 2 <= 7) {
        if (y + 1 <= 7 && Board[x+2][y+1]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x+2,y+1));
        }

        if (y - 1 >= 0 && Board[x+2][y-1]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x+2,y-1));
        }
    }

    if (x - 2 >= 0) {
        if (y + 1 <= 7 && Board[x-2][y+1]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x-2,y+1));
        }

        if (y - 1 >= 0 && Board[x-2][y-1]?.Color !== self.Color) {
            self.LegalMoves.push(new Coordinate(x-2,y-1));
        }
    }
}

function moveLikeKing(self : Piece) {
    let x = self.CurrentPosition.X;
    let y = self.CurrentPosition.Y;

    if (x + 1 <= 7 && Board[x+1][y]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x + 1, y));
    }

    if (x + 1 <= 7 && y + 1 <= 7 && Board[x+1][y+1]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x+1,y+1));
    }
    if (x + 1 <= 7 && y - 1 >= 0 && Board[x+1][y-1]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x+1,y-1));
    }

    if (x - 1 >= 0 && Board[x-1][y]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x - 1, y));
    }

    if (x - 1 >= 0 && y + 1 <= 7 && Board[x-1][y+1]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x-1,y+1));
    }
    if (x - 1 >= 0 && y - 1 >= 0 && Board[x-1][y-1]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x-1,y-1));
    }

    if (y + 1 <= 7 && Board[x][y+1]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x, y + 1));
    }

    if (y - 1 >= 0 && Board[x][y-1]?.Color !== self.Color) {
        self.LegalMoves.push(new Coordinate(x, y - 1));
    }

    // castling...
    let ownKingIsChecked = self.Color === PieceColor.White ? whiteKingIsChecked : blackKingIsChecked;
    if (!self.HasBeenMoved && !ownKingIsChecked) {
        if (Board[5][self.CurrentPosition.Y] === undefined && Board[6][self.CurrentPosition.Y] === undefined && Board[7][self.CurrentPosition.Y] !== undefined && Board[7][self.CurrentPosition.Y]?.HasBeenMoved === false) {
            self.LegalMoves.push(new Coordinate(6,self.CurrentPosition.Y));
            self.LegalMoves.push(new Coordinate(7,self.CurrentPosition.Y));
        }
        if (Board[3][self.CurrentPosition.Y] === undefined && Board[2][self.CurrentPosition.Y] === undefined && Board[0][self.CurrentPosition.Y] !== undefined && Board[0][self.CurrentPosition.Y]?.HasBeenMoved === false) {
            self.LegalMoves.push(new Coordinate(2,self.CurrentPosition.Y));
            self.LegalMoves.push(new Coordinate(0, self.CurrentPosition.Y));
        }
    }
    

}

function pawnCreator(color : PieceColor, currentPosition : Coordinate) {
    let piece = new Piece(color, currentPosition, "Pawn");

    piece.Moves.push(moveLikePawn);
    
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function rookCreator(color : PieceColor, currentPosition : Coordinate) {
    let piece = new Piece(color, currentPosition, "Rook");
    piece.Moves.push(moveLikeRook)
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function bishopCreator(color: PieceColor, currentPosition : Coordinate) {
    let piece = new Piece(color, currentPosition, "Bishop");

    piece.Moves.push(moveLikeBishop);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function knightCreator(color : PieceColor, currentPosition : Coordinate) {
    let piece = new Piece(color, currentPosition, "Knight");

    piece.Moves.push(moveLikeKnight);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function kingCreator(color : PieceColor, currentPosition : Coordinate) {
    let piece = new Piece(color, currentPosition, "King");

    piece.Moves.push(moveLikeKing);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
    if (color === PieceColor.White) {
        whiteKing = piece;
    } else if (color === PieceColor.Black) {
        blackKing = piece;
    }
}
function queenCreator(color : PieceColor, currentPosition : Coordinate) {
    let piece = new Piece(color, currentPosition, "Queen");

    piece.Moves.push(moveLikeBishop);
    piece.Moves.push(moveLikeRook);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}

function drawBoard() {    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                const rowElement = document.getElementById(`row-${row+1}`);
                if (rowElement == null) throw Error;
                let visualCell = rowElement.children[col];
                
                if (visualCell.children.length === 0) {
                    drawVisualCell(logicalCell);
                }
            }
        }
    } 
}

function getLogicalCell(coordinate : Coordinate) {
    return Board[coordinate.X][coordinate.Y];
}

function getVisualCell(coordinate : Coordinate) {
    const rowElement = document.getElementById(`row-${coordinate.Y+1}`);
    if (rowElement != null)
        return rowElement.children[coordinate.X];
    else 
        throw Error;
}

function removeVisualCell(cellCoordinate : Coordinate) {
    let visualCell = getVisualCell(cellCoordinate);
    if (visualCell.firstElementChild != null) {
        visualCell.removeChild(visualCell.firstElementChild);
    }
}

function updatePiecePosition(piece : Piece, destination : Coordinate) {
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = undefined;
    piece.CurrentPosition = destination;
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}

function drawVisualCell(piece : Piece) {
    let visualCell = getVisualCell(piece.CurrentPosition);
    let logicalCell = getLogicalCell(piece.CurrentPosition);

    if (logicalCell == undefined) throw Error;

    while (visualCell.firstElementChild != null) 
        visualCell.removeChild(visualCell.firstElementChild);

    let visualCellImgBackground = document.createElement("div");

    let color = "";
    if (piece.Color === PieceColor.White) color = "light";
    if (piece.Color === PieceColor.Black) color = "dark"
    visualCellImgBackground.setAttribute("style", `background-image: url("./pieces/${color}-${logicalCell.Name.toLowerCase()}.svg")`);
    visualCellImgBackground.setAttribute("class"," piece-background")
    visualCellImgBackground.setAttribute("draggable", "true")

    visualCell.appendChild(visualCellImgBackground);    
}

function movePieceByText(textInput : string) {
    let firstCoordinate : Coordinate = translateTextToCoordinate(textInput.substring(0,2));
    let secondCoordinate : Coordinate = translateTextToCoordinate(textInput.substring(2,4));

    let piece = Board[firstCoordinate.X][firstCoordinate.Y];

    if (piece !== undefined) {
        movePiece(piece, secondCoordinate);
    }
}

function translateTextToCoordinate(textCoordinate : string) {
    let x : number = -1;
    let y : number = parseInt(textCoordinate[1]) - 1;

    if (textCoordinate.length === 2) {
        switch (textCoordinate[0]) {
            case 'a':
                x = 0;
                break;
            case 'b':
                x = 1;
                break;
            case 'c':
                x = 2;
                break;
            case 'd':
                x = 3;
                break;
            case 'e':
                x = 4;
                break;
            case 'f':
                x = 5;
                break;
            case 'g':
                x = 6;
                break;
            case 'h':
                x = 7;
                break;
        }
    }
            
    return new Coordinate(x, y);
}

function translateCoordinateToText(start : Coordinate, end : Coordinate) {
    let text = "";
    text += (start.X+10).toString(36);
    text += start.Y+1;
    text += (end.X+10).toString(36);
    text += end.Y+1;

    return text;
}

function detectMultiplayerMove() {
    socket.on('move', (data : MoveData) => {
        console.log(`move : ${data.coordinate}`);
        movePieceByText(data.coordinate);
        turn = data.turn;
    })    
}


function movePiece(piece : Piece, destination : Coordinate) {
    // Castling
    if (piece.Name === "King") {
        let xDifference = piece.CurrentPosition.X - destination.X;
        if (Math.abs(xDifference) > 1) {
            // Castle LEFT
            if (xDifference > 0) {
                for (let i = 3; i >= 2; i--) {
                    if (moveIsIllegal(piece, new Coordinate(i, piece.CurrentPosition.Y))) {
                        return
                    }
                }
                destination.X = 2;
                movePiece(Board[0][piece.CurrentPosition.Y]!, new Coordinate(3, piece.CurrentPosition.Y));
            } else { // Castle RIGHT
                for (let i = 5; i <= 6; i++) {
                    if (moveIsIllegal(piece, new Coordinate(i, piece.CurrentPosition.Y))) {
                        return
                    }
                }
                destination.X = 6;
                movePiece(Board[7][piece.CurrentPosition.Y]!, new Coordinate(5, piece.CurrentPosition.Y));
            }
        }
    }

    // destroy piece enpassant
    if (piece.Name === "Pawn") {
        if (piece.HasBeenMoved === false) {
            piece.JustMadeFirstMove = true;
        }
        if (Board[destination.X][destination.Y] === undefined) {
            let behindDestination = piece.Color === PieceColor.White ? destination.Y - 1 : destination.Y + 1;
            if (Board[destination.X][behindDestination] !== undefined && 
                Board[destination.X][behindDestination]?.Name === "Pawn" && 
                Board[destination.X][behindDestination]?.Color !== piece.Color) {
                destroyPiece(new Coordinate(destination.X, behindDestination));
            }
        }
    }

    let formerCoordinates = piece.CurrentPosition;
    removeVisualCell(formerCoordinates);
    destroyPiece(destination);
    updatePiecePosition(piece, destination);
    drawVisualCell(piece);
    Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
    updateAllLegalMovesAndFindChecks();
    changeTurn();

    let data : MoveData = <MoveData>{};
    data.coordinate = translateCoordinateToText(formerCoordinates, destination);
    data.turn = turn;
    socket.emit('move', data);

    if (blackKingIsChecked || whiteKingIsChecked) {
        checkAudio.play();
    } else {
        moveAudio.play();
    }
}

function changeTurn() {
    if (turn === PieceColor.White) {
        turn = PieceColor.Black;
    } else if (turn === PieceColor.Black) {
        turn = PieceColor.White;
    }
}

function moveIsIllegal(piece : Piece, destination : Coordinate) {
    let formerCoordinates = piece.CurrentPosition;
    let destinationPiece = Board[destination.X][destination.Y];
    unhighlightLegalMoves(piece);
    updatePiecePosition(piece, destination)
    updateAllLegalMovesAndFindChecks();
    let kingGetsChecked : boolean = false;
    if (piece.Color === PieceColor.White && whiteKingIsChecked) kingGetsChecked = true;
    if (piece.Color === PieceColor.Black && blackKingIsChecked) kingGetsChecked = true;

    // Revert board to former state
    updatePiecePosition(piece, formerCoordinates);
    updateLegalMoves(piece);
    if (destinationPiece !== undefined) updatePiecePosition(destinationPiece, destinationPiece.CurrentPosition);

    if (kingGetsChecked) {
        errorAudio.play();
    }

    return kingGetsChecked;
}

function updateLegalMoves(piece : Piece) {
    piece.LegalMoves = [];
    for (let i = 0; i < piece.Moves.length; i++) {
        piece.Moves[i](piece);
    }
}

function highlightLegalMoves(piece : Piece) {
    for (let i = 0; i < piece.LegalMoves.length; i++) {
        let visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className += " legalMove";
    }
}

function unhighlightLegalMoves(piece : Piece) {
    for (let i = 0; i < piece.LegalMoves.length; i++) {
        let visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className = visualCell.className.replace(" legalMove", "");
    }
}

function updateAllLegalMovesAndFindChecks() {
    whiteKingIsChecked = false;
    blackKingIsChecked = false;

    for (let y = 0; y <= 7; y++) {
       for (let x = 0; x <= 7; x++) {
            if (Board[x][y] === undefined) continue;
            updateLegalMoves(Board[x][y]!);
            let opponentKing : Piece = Board[x][y]!.Color === PieceColor.White ? blackKing : whiteKing;
            Board[x][y]!.LegalMoves.forEach(legalMove => {
                if (legalMove.X === opponentKing.CurrentPosition.X && legalMove.Y === opponentKing.CurrentPosition.Y) {
                    console.log(`ChECK!`);
                    if (Board[x][y]?.Color === PieceColor.White) blackKingIsChecked = true;
                    else whiteKingIsChecked = true; 
                }
            });
       }
    }

}


function makePieceDraggable() {
    document.addEventListener("dragstart", (e : any) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")!) - 1;

        let piece : Piece | undefined = Board[colIndex][rowIndex];
        if (piece == undefined) return;

        if (piece.Color === turn) {
            if (playerColor === piece.Color || playerColor === PieceColor.None) {
                updateLegalMoves(piece);
                highlightLegalMoves(piece);
                lastTouchedPiece = piece;
            }
        }
    });

//     // document.addEventListener("drag", (e) => {
//     //     console.log("drag middle!");

//     // });

    document.addEventListener("dragend", (e : any) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")!) - 1;

        let piece : Piece | undefined = Board[colIndex][rowIndex];        
        if (piece == undefined) return;

        unhighlightLegalMoves(lastTouchedPiece);


    });
}

function makeCellsLandable() {
    //   // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
    document.addEventListener("dragover", function(e) {
        e.preventDefault();
        
    });
      
    // two different depending if target is an image or target is the div parent...
    document.addEventListener("drop", function(e : any) {
        e.preventDefault();
        if(!e) return false;

        if (e.target.className.includes("legalMove") || e.target.parentElement.className.includes("legalMove")) {
            let target = e.target.className.includes("legalMove") ? e.target : e.target.parentElement; 
            let dropCoordinate : Coordinate = getCoordinateFromElement(target)

            if (moveIsIllegal(lastTouchedPiece, dropCoordinate) === false) {
                updatePieceJustMoved();
                movePiece(lastTouchedPiece, dropCoordinate);
                lastTouchedPiece.HasBeenMoved = true;

                if (playerColor === PieceColor.None) {
                    playerColor = lastTouchedPiece.Color;
                }
                
                drawBoard();
            }

            unhighlightLegalMoves(lastTouchedPiece);
        }
    })
}

function getCoordinateFromElement(element : any) {
    let cellDiv : HTMLDivElement | HTMLImageElement | any;
    if (element.nodeName === "DIV") {
        cellDiv = element 
    }
    else if (element.nodeName === "IMG") {
        cellDiv = element.parentElement;
    }
    else {
        throw Error;
    }
    
    const rowIndex = parseInt(cellDiv.getAttribute("row")) - 1;
    const colIndex = parseInt(cellDiv.id.replace("col-", "")) - 1;

    return new Coordinate(colIndex, rowIndex);
    
}

function destroyPiece(coordinate : Coordinate) {
    if (Board[coordinate.X][coordinate.Y] !== undefined) {
        removeVisualCell(coordinate);
        Board[coordinate.X][coordinate.Y] = undefined;
    }
}

initGame();