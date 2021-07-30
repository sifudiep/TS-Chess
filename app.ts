import { Piece } from "./classes/piece.js";
import { Coordinate } from "./classes/coordinate.js";

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

let isWhiteTurn : boolean = true;

function setupDefaultBoardPieces() {
    // White pieces...
    for (let i = 0; i < 8; i++) {
        pawnCreator(true, new Coordinate(i, 1));
    }
    rookCreator(true, new Coordinate(0,0)); 
    rookCreator(true, new Coordinate(7,0)); 
    knightCreator(true, new Coordinate(1,0));
    knightCreator(true, new Coordinate(6,0));
    bishopCreator(true, new Coordinate(2,0));
    bishopCreator(true, new Coordinate(5,0));
    kingCreator(true, new Coordinate(4,0));
    queenCreator(true, new Coordinate(3,0));

    // Black pieces...
    for (let i = 0; i < 8; i++) {
        pawnCreator(false, new Coordinate(i, 6));
    }
    rookCreator(false, new Coordinate(0,7)); 
    rookCreator(false, new Coordinate(7,7)); 
    knightCreator(false, new Coordinate(1,7));
    knightCreator(false, new Coordinate(6,7));
    bishopCreator(false, new Coordinate(2,7));
    bishopCreator(false, new Coordinate(5,7));
    kingCreator(false, new Coordinate(4,7));
    queenCreator(false, new Coordinate(3,7));
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
        let isWhite : boolean = self.IsWhite;
        destroyPiece(self.CurrentPosition);
        queenCreator(isWhite, coordinate);
        drawVisualCell(Board[coordinate.X][coordinate.Y]!);
    }

    if (self.IsWhite) {

        if (self.CurrentPosition.X-1 >= 0) {
            if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y+1] !== undefined) {
                if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y+1]?.IsWhite === false){
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y+1));
                }
            }
        }

        if (self.CurrentPosition.X+1 <= 7) {
            if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y+1] !== undefined) {
                if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y+1]?.IsWhite === false){
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
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y+1));
        }

        if (self.CurrentPosition.X-1 >= 0 &&
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y] !== undefined && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.Name === "Pawn" && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.JustMadeFirstMove && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y+1));
        }

        
    } else {
        if (self.CurrentPosition.X-1 >= 0) {
            if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y-1] !== undefined) {
                if (Board[self.CurrentPosition.X-1][self.CurrentPosition.Y-1] ?.IsWhite === true){
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y-1));
                }
            }
        }

        if (self.CurrentPosition.X+1 <= 7) {
            if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y-1] !== undefined) {
                if (Board[self.CurrentPosition.X+1][self.CurrentPosition.Y-1]?.IsWhite === true){
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
            Board[self.CurrentPosition.X+1][self.CurrentPosition.Y]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+1, self.CurrentPosition.Y-1));
        }

        if (self.CurrentPosition.X-1 >= 0 &&
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y] !== undefined && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.Name === "Pawn" && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.JustMadeFirstMove && 
            Board[self.CurrentPosition.X-1][self.CurrentPosition.Y]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-1, self.CurrentPosition.Y-1));
        }
    } 

}

function moveLikeRook(self : Piece) {
    for (let i = self.CurrentPosition.X - 1; i >= 0; i--) {
        if (Board[i][self.CurrentPosition.Y]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        } else {
            break;
        }
    } 

    for (let i = self.CurrentPosition.X + 1; i <= 7; i++) {
        if (Board[i][self.CurrentPosition.Y]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        } else {
            break
        }
    } 
    
    for (let i = self.CurrentPosition.Y - 1; i >= 0; i--) {
        if (Board[self.CurrentPosition.X][i]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    } 

    for (let i = self.CurrentPosition.Y + 1; i <= 7; i++) {
        if (Board[self.CurrentPosition.X][i]?.IsWhite !== self.IsWhite) {
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
        if (Board[self.CurrentPosition.X+i][self.CurrentPosition.Y+i]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X+i, self.CurrentPosition.Y+i));
            if (Board[self.CurrentPosition.X+i][self.CurrentPosition.Y+i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

    for (let i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y + i <= 7; i++) {
        if (Board[self.CurrentPosition.X-i][self.CurrentPosition.Y+i]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X-i, self.CurrentPosition.Y+i));
            if (Board[self.CurrentPosition.X-i][self.CurrentPosition.Y+i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

    for (let i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y - i >= 0; i++) {
        if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X+i][self.CurrentPosition.Y-i] !== undefined) {
                break;
            }
        } else {
            break;
        }
    }

    for (let i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y - i >= 0; i++) {
        if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y - i]?.IsWhite !== self.IsWhite) {
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
        if (x + 1 <= 7 && Board[x+1][y+2]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x+1,y+2));
        }

        if (x - 1 >= 0 && Board[x-1][y+2]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x-1,y+2));
        }
    }

    if (y - 2 >= 0) {
        if (x + 1 <= 7 && Board[x+1][y-2]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x+1,y-2));
        }

        if (x - 1 >= 0 && Board[x-1][y-2]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x-1,y-2));
        }
    }

    if (x + 2 <= 7) {
        if (y + 1 <= 7 && Board[x+2][y+1]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x+2,y+1));
        }

        if (y - 1 >= 0 && Board[x+2][y-1]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x+2,y-1));
        }
    }

    if (x - 2 >= 0) {
        if (y + 1 <= 7 && Board[x-2][y+1]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x-2,y+1));
        }

        if (y - 1 >= 0 && Board[x-2][y-1]?.IsWhite !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x-2,y-1));
        }
    }
}

function moveLikeKing(self : Piece) {
    let x = self.CurrentPosition.X;
    let y = self.CurrentPosition.Y;

    if (x + 1 <= 7 && Board[x+1][y]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x + 1, y));
    }

    if (x + 1 <= 7 && y + 1 <= 7 && Board[x+1][y+1]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x+1,y+1));
    }
    if (x + 1 <= 7 && y - 1 >= 0 && Board[x+1][y-1]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x+1,y-1));
    }

    if (x - 1 >= 0 && Board[x-1][y]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x - 1, y));
    }

    if (x - 1 >= 0 && y + 1 <= 7 && Board[x-1][y+1]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x-1,y+1));
    }
    if (x - 1 >= 0 && y - 1 >= 0 && Board[x-1][y-1]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x-1,y-1));
    }

    if (y + 1 <= 7 && Board[x][y+1]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x, y + 1));
    }

    if (y - 1 >= 0 && Board[x][y-1]?.IsWhite !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x, y - 1));
    }

    // castling...
    let ownKingIsChecked = self.IsWhite ? whiteKingIsChecked : blackKingIsChecked;
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

function pawnCreator(isWhite : boolean, currentPosition : Coordinate) {
    let piece = new Piece(isWhite, currentPosition, "Pawn");

    piece.Moves.push(moveLikePawn);
    
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function rookCreator(isWhite : boolean, currentPosition : Coordinate) {
    let piece = new Piece(isWhite, currentPosition, "Rook");
    piece.Moves.push(moveLikeRook)
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function bishopCreator(isWhite: boolean, currentPosition : Coordinate) {
    let piece = new Piece(isWhite, currentPosition, "Bishop");

    piece.Moves.push(moveLikeBishop);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function knightCreator(isWhite : boolean, currentPosition : Coordinate) {
    let piece = new Piece(isWhite, currentPosition, "Knight");

    piece.Moves.push(moveLikeKnight);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function kingCreator(isWhite : boolean, currentPosition : Coordinate) {
    let piece = new Piece(isWhite, currentPosition, "King");

    piece.Moves.push(moveLikeKing);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
    if (isWhite) {
        whiteKing = piece;
    } else {
        blackKing = piece;
    }
}
function queenCreator(isWhite : boolean, currentPosition : Coordinate) {
    let piece = new Piece(isWhite, currentPosition, "Queen");

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
    visualCellImgBackground.setAttribute("style", `background-image: url("./pieces/${logicalCell.IsWhite ? "light" : "dark"}-${logicalCell.Name.toLowerCase()}.svg")`);
    visualCellImgBackground.setAttribute("class"," piece-background")
    visualCellImgBackground.setAttribute("draggable", "true")

    visualCell.appendChild(visualCellImgBackground);    
}

function movePiece(piece : Piece, destination : Coordinate) {
    // Castling
    if (piece.Name === "King") {
        let xDifference = piece.CurrentPosition.X - destination.X;
        if (Math.abs(xDifference) > 1) {
            // Castle LEFT
            if (xDifference > 0) {
                for (let i = 3; i >= 2; i--) {
                    if (moveIsIllegal(piece, new Coordinate(i, piece.CurrentPosition.Y))) return
                }
                destination.X = 2;
                movePiece(Board[0][piece.CurrentPosition.Y]!, new Coordinate(3, piece.CurrentPosition.Y));
            } else { // Castle RIGHT
                for (let i = 5; i <= 6; i++) {
                    if (moveIsIllegal(piece, new Coordinate(i, piece.CurrentPosition.Y))) return
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
            let behindDestination = piece.IsWhite ? destination.Y - 1 : destination.Y + 1;
            if (Board[destination.X][behindDestination] !== undefined && 
                Board[destination.X][behindDestination]?.Name === "Pawn" && 
                Board[destination.X][behindDestination]?.IsWhite !== piece.IsWhite) {
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
    isWhiteTurn = !isWhiteTurn;
    updateAllLegalMovesAndFindChecks();
    // console.log(`Moved ${piece.Name} at (${formerCoordinates.X},${formerCoordinates.Y}) -> (${piece.CurrentPosition.X},${piece.CurrentPosition.Y})`);

}

function moveIsIllegal(piece : Piece, destination : Coordinate) {
    let formerCoordinates = piece.CurrentPosition;
    let destinationPiece = Board[destination.X][destination.Y];
    unhighlightLegalMoves(piece);

    updatePiecePosition(piece, destination)
    updateAllLegalMovesAndFindChecks();
    let kingGetsChecked : boolean = false;
    if (piece.IsWhite && whiteKingIsChecked) kingGetsChecked = true;
    if (piece.IsWhite === false && blackKingIsChecked) kingGetsChecked = true;

    // Revert board to former state
    updatePiecePosition(piece, formerCoordinates);
    updateLegalMoves(piece);
    if (destinationPiece !== undefined) updatePiecePosition(destinationPiece, destinationPiece.CurrentPosition);

    drawBoard();
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
            let opponentKing : Piece = Board[x][y]!.IsWhite ? blackKing : whiteKing;
            Board[x][y]!.LegalMoves.forEach(legalMove => {
                if (legalMove.X === opponentKing.CurrentPosition.X && legalMove.Y === opponentKing.CurrentPosition.Y) {
                    if (Board[x][y]?.IsWhite) blackKingIsChecked = true;
                    else whiteKingIsChecked = true; 
                }
            });
       }
    }

}


function makePieceDraggable() {
    document.addEventListener("dragstart", (e) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")!) - 1;

        let piece : Piece | undefined = Board[colIndex][rowIndex];
        if (piece == undefined) return;
        if (piece.IsWhite === isWhiteTurn) {
            updateLegalMoves(piece);
            highlightLegalMoves(piece);
            lastTouchedPiece = piece;
        }
    });

//     // document.addEventListener("drag", (e) => {
//     //     console.log("drag middle!");

//     // });

    document.addEventListener("dragend", (e) => {
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