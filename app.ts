import { Piece } from "./classes/piece.js";
import { Coordinate } from "./classes/coordinate.js";

function setupBoardColors() {
    let board = document.getElementById('chessBoard');
    if (board == null) throw Error;

    let lightColor = true;
    for (let i = 0; i < board.children.length; i++) {
        let row = board.children[i];
        for (let j = 0; j < row.children.length; j++) {
            lightColor ? row.children[j].className += ' ligth-cell' : row.children[j].className += ' dark-cell';
            lightColor ? lightColor = false : lightColor = true;
        }
        lightColor ? lightColor = false : lightColor = true;
    }
}

function setupDefaultBoardPieces() {
    // White pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(true, new Coordinate(i, 1));
    }
    rookCreator(true, new Coordinate(0,0)); 
    rookCreator(true, new Coordinate(7,0)); 
    knightCreator(true, new Coordinate(1,0));
    knightCreator(true, new Coordinate(6,0));
    bishopCreator(true, new Coordinate(2,0));
    bishopCreator(true, new Coordinate(5,0));

    // Black pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(false, new Coordinate(i, 6));
    }
    rookCreator(false, new Coordinate(0,7)); 
    rookCreator(false, new Coordinate(7,7)); 
    knightCreator(false, new Coordinate(1,7));
    knightCreator(false, new Coordinate(6,7));
    bishopCreator(false, new Coordinate(2,7));
    bishopCreator(false, new Coordinate(5,7));
}

var Board : Piece[][] | undefined[][] = [[],[],[],[],[],[],[],[]] 

let lastTouchedPiece : Piece;

function initGame() {
    setupBoardColors();
    setupDefaultBoardPieces();
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
}


function moveLikePawn(self : Piece) {
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





function drawBoard() {    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                const rowElement = document.getElementById(`row-${row+1}`);
                if (rowElement == null) throw Error;
                let visualCell = rowElement.children[col];
                
                if (visualCell.children.length === 0) {
                    let visualCellImage = document.createElement("img");

                    let color = logicalCell.IsWhite ? "light" : "dark";
                    let pieceName = logicalCell.Name.toLowerCase();
                    
                    visualCellImage.setAttribute("src", `./pieces/${color}-${pieceName}.svg`);
                    visualCellImage.setAttribute("class", "piece");
                    visualCell.appendChild(visualCellImage);
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
    piece.HasBeenMoved = true;
}

function drawVisualCell(piece : Piece) {
    let visualCell = getVisualCell(piece.CurrentPosition);
    let logicalCell = getLogicalCell(piece.CurrentPosition);

    if (logicalCell == undefined) throw Error;

    while (visualCell.firstElementChild != null) 
        visualCell.removeChild(visualCell.firstElementChild);

    let visualCellImage = document.createElement("img");
    visualCellImage.setAttribute("src", `./pieces/${logicalCell.IsWhite ? "light" : "dark"}-${logicalCell.Name.toLowerCase()}.svg`);
    visualCellImage.setAttribute("class", "piece");
    visualCell.appendChild(visualCellImage);
}

function movePiece(piece : Piece, destination : Coordinate) {
    let formerCoordinates = piece.CurrentPosition;
    removeVisualCell(piece.CurrentPosition);
    updatePiecePosition(piece, destination)
    drawVisualCell(piece);
    Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
    console.log(`Moved ${piece.Name} at (${formerCoordinates.X},${formerCoordinates.Y}) -> (${piece.CurrentPosition.X},${piece.CurrentPosition.Y})`);

}
function updateLegalMoves(piece : Piece) {
    piece.LegalMoves = [];
    // använd addLegalPawnMoves() på ngt sätt....
    for (let i = 0; i < piece.Moves.length; i++) {
        console.log(`updating for ${piece.Name}, i:${i}`);
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

function makePieceDraggable() {
    document.addEventListener("dragstart", (e : DragEvent) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")!) - 1;

        let piece : Piece | undefined = Board[colIndex][rowIndex];
        if (piece == undefined) return;

        updateLegalMoves(piece);

        highlightLegalMoves(piece);

        lastTouchedPiece = piece;
    });

//     // document.addEventListener("drag", (e) => {
//     //     console.log("drag middle!");

//     // });

    document.addEventListener("dragend", (e) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")!) - 1;

        let piece : Piece | undefined = Board[colIndex][rowIndex];        
        if (piece == undefined) return;
        unhighlightLegalMoves(piece);
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
        
        if (e.target.className.includes("legalMove")) {
            let dropCoordinate : Coordinate = getCoordinateFromElement(e.target)!;
            movePiece(lastTouchedPiece, dropCoordinate);
            unhighlightLegalMoves(lastTouchedPiece);
            updateLegalMoves(lastTouchedPiece);
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

initGame();