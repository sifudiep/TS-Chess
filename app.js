import { Piece } from "./classes/piece.js";
import { Coordinate } from "./classes/coordinate.js";
function setupBoardColors() {
    let board = document.getElementById('chessBoard');
    if (board == null)
        throw Error;
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
var Board = [[], [], [], [], [], [], [], []];
let lastTouchedPiece;
function initGame() {
    setupBoardColors();
    pawnCreator(true, new Coordinate(5, 6));
    rookCreator(true, new Coordinate(7, 0));
    bishopCreator(true, new Coordinate(2, 3));
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
}
function moveLikePawn(self) {
    var _a, _b, _c, _d;
    if (self.IsWhite) {
        if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1] !== undefined) {
            if (((_a = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1]) === null || _a === void 0 ? void 0 : _a.IsWhite) === false) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
            }
        }
        if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1] !== undefined) {
            if (((_b = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1]) === null || _b === void 0 ? void 0 : _b.IsWhite) === false) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
            }
        }
        if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 1] === undefined) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 1));
            if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 2] === undefined && self.HasBeenMoved === false) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 2));
            }
        }
    }
    else {
        if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1] !== undefined) {
            if (((_c = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1]) === null || _c === void 0 ? void 0 : _c.IsWhite) === true) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y - 1));
            }
        }
        if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1] !== undefined) {
            if (((_d = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1]) === null || _d === void 0 ? void 0 : _d.IsWhite) === true) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y - 1));
            }
        }
        if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 1] === undefined) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y - 1));
            if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 2] === undefined && self.HasBeenMoved === false) {
                self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y - 2));
            }
        }
    }
}
function moveLikeRook(self) {
    var _a, _b, _c, _d;
    for (let i = self.CurrentPosition.X - 1; i >= 0; i--) {
        if (((_a = Board[i][self.CurrentPosition.Y]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (let i = self.CurrentPosition.X + 1; i <= 7; i++) {
        if (((_b = Board[i][self.CurrentPosition.Y]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (let i = self.CurrentPosition.Y - 1; i >= 0; i--) {
        if (((_c = Board[self.CurrentPosition.X][i]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (let i = self.CurrentPosition.Y + 1; i <= 7; i++) {
        if (((_d = Board[self.CurrentPosition.X][i]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
}
function moveLikeBishop(self) {
    var _a, _b, _c, _d;
    for (let i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y + i <= 7; i++) {
        if (((_a = Board[self.CurrentPosition.X + i][self.CurrentPosition.Y + i]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y + i));
            if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y + i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (let i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y + i <= 7; i++) {
        if (((_b = Board[self.CurrentPosition.X - i][self.CurrentPosition.Y + i]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - i, self.CurrentPosition.Y + i));
            if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y + i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (let i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y - i >= 0; i++) {
        if (((_c = Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (let i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y - i >= 0; i++) {
        if (((_d = Board[self.CurrentPosition.X - i][self.CurrentPosition.Y - i]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y - i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
}
function pawnCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Pawn");
    piece.Moves.push(moveLikePawn);
    piece.Moves[0](piece);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function rookCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Rook");
    piece.Moves.push(moveLikeRook);
    piece.Moves[0](piece);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function bishopCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Bishop");
    piece.Moves.push(moveLikeBishop);
    piece.Moves[0](piece);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function drawBoard() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                const rowElement = document.getElementById(`row-${row + 1}`);
                if (rowElement == null)
                    throw Error;
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
function getLogicalCell(coordinate) {
    return Board[coordinate.X][coordinate.Y];
}
function getVisualCell(coordinate) {
    const rowElement = document.getElementById(`row-${coordinate.Y + 1}`);
    if (rowElement != null)
        return rowElement.children[coordinate.X];
    else
        throw Error;
}
function removeVisualCell(cellCoordinate) {
    let visualCell = getVisualCell(cellCoordinate);
    if (visualCell.firstElementChild != null) {
        visualCell.removeChild(visualCell.firstElementChild);
    }
}
function updatePiecePosition(piece, destination) {
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = undefined;
    piece.CurrentPosition = destination;
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
    piece.HasBeenMoved = true;
}
function drawVisualCell(piece) {
    let visualCell = getVisualCell(piece.CurrentPosition);
    let logicalCell = getLogicalCell(piece.CurrentPosition);
    if (logicalCell == undefined)
        throw Error;
    while (visualCell.firstElementChild != null)
        visualCell.removeChild(visualCell.firstElementChild);
    let visualCellImage = document.createElement("img");
    visualCellImage.setAttribute("src", `./pieces/${logicalCell.IsWhite ? "light" : "dark"}-${logicalCell.Name.toLowerCase()}.svg`);
    visualCellImage.setAttribute("class", "piece");
    visualCell.appendChild(visualCellImage);
}
function movePiece(piece, destination) {
    let formerCoordinates = piece.CurrentPosition;
    removeVisualCell(piece.CurrentPosition);
    updatePiecePosition(piece, destination);
    drawVisualCell(piece);
    Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
    console.log(`Moved ${piece.Name} at (${formerCoordinates.X},${formerCoordinates.Y}) -> (${piece.CurrentPosition.X},${piece.CurrentPosition.Y})`);
}
function updateLegalMoves(piece) {
    piece.LegalMoves = [];
    // använd addLegalPawnMoves() på ngt sätt....
    for (let i = 0; i < piece.Moves.length; i++) {
        piece.Moves[i](piece);
    }
}
function highlightLegalMoves(piece) {
    for (let i = 0; i < piece.LegalMoves.length; i++) {
        let visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className += " legalMove";
    }
}
function unhighlightLegalMoves(piece) {
    for (let i = 0; i < piece.LegalMoves.length; i++) {
        let visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className = visualCell.className.replace(" legalMove", "");
    }
}
function makePieceDraggable() {
    document.addEventListener("dragstart", (e) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        let piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        updateLegalMoves(piece);
        highlightLegalMoves(piece);
        lastTouchedPiece = piece;
    });
    //     // document.addEventListener("drag", (e) => {
    //     //     console.log("drag middle!");
    //     // });
    document.addEventListener("dragend", (e) => {
        let colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        let rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        let piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        unhighlightLegalMoves(piece);
    });
}
function makeCellsLandable() {
    //   // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
    document.addEventListener("dragover", function (e) {
        e.preventDefault();
    });
    // two different depending if target is an image or target is the div parent...
    document.addEventListener("drop", function (e) {
        e.preventDefault();
        if (!e)
            return false;
        if (e.target.className.includes("legalMove")) {
            let dropCoordinate = getCoordinateFromElement(e.target);
            movePiece(lastTouchedPiece, dropCoordinate);
            unhighlightLegalMoves(lastTouchedPiece);
            updateLegalMoves(lastTouchedPiece);
        }
    });
}
function getCoordinateFromElement(element) {
    let cellDiv;
    if (element.nodeName === "DIV") {
        cellDiv = element;
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
