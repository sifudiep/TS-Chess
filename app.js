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
            lightColor ? row.children[j].className += ' light-cell' : row.children[j].className += ' dark-cell';
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
    rookCreator(true, new Coordinate(0, 0));
    rookCreator(true, new Coordinate(7, 0));
    knightCreator(true, new Coordinate(1, 0));
    knightCreator(true, new Coordinate(6, 0));
    bishopCreator(true, new Coordinate(2, 0));
    bishopCreator(true, new Coordinate(5, 0));
    kingCreator(true, new Coordinate(3, 0));
    queenCreator(true, new Coordinate(4, 0));
    // Black pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(false, new Coordinate(i, 6));
    }
    rookCreator(false, new Coordinate(0, 7));
    rookCreator(false, new Coordinate(7, 7));
    knightCreator(false, new Coordinate(1, 7));
    knightCreator(false, new Coordinate(6, 7));
    bishopCreator(false, new Coordinate(2, 7));
    bishopCreator(false, new Coordinate(5, 7));
    kingCreator(false, new Coordinate(3, 7));
    queenCreator(false, new Coordinate(4, 7));
    destroyPiece(new Coordinate(3, 6));
}
var Board = [[], [], [], [], [], [], [], []];
let lastTouchedPiece;
function initGame() {
    setupBoardColors();
    setupDefaultBoardPieces();
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
}
function moveLikePawn(self) {
    var _a, _b, _c, _d;
    // check for promotion...
    if (self.CurrentPosition.Y == 0 || self.CurrentPosition.Y == 7) {
        let coordinate = self.CurrentPosition;
        let isWhite = self.IsWhite;
        destroyPiece(self.CurrentPosition);
        console.log(`creating queen at coordinate : (${coordinate.X}, ${coordinate.Y})`);
        queenCreator(isWhite, coordinate);
        drawVisualCell(Board[coordinate.X][coordinate.Y]);
    }
    if (self.IsWhite) {
        if (self.CurrentPosition.X - 1 >= 0) {
            if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1] !== undefined) {
                if (((_a = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1]) === null || _a === void 0 ? void 0 : _a.IsWhite) === false) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
                }
            }
        }
        if (self.CurrentPosition.X + 1 <= 7) {
            if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1] !== undefined) {
                if (((_b = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1]) === null || _b === void 0 ? void 0 : _b.IsWhite) === false) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y + 1));
                }
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
        if (self.CurrentPosition.X - 1 >= 0) {
            if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1] !== undefined) {
                if (((_c = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1]) === null || _c === void 0 ? void 0 : _c.IsWhite) === true) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y - 1));
                }
            }
        }
        if (self.CurrentPosition.X + 1 <= 7) {
            if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1] !== undefined) {
                if (((_d = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1]) === null || _d === void 0 ? void 0 : _d.IsWhite) === true) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y - 1));
                }
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
function moveLikeKnight(self) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let y = self.CurrentPosition.Y;
    let x = self.CurrentPosition.X;
    if (y + 2 <= 7) {
        if (x + 1 <= 7 && ((_a = Board[x + 1][y + 2]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x + 1, y + 2));
        }
        if (x - 1 >= 0 && ((_b = Board[x - 1][y + 2]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x - 1, y + 2));
        }
    }
    if (y - 2 >= 0) {
        if (x + 1 <= 7 && ((_c = Board[x + 1][y - 2]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x + 1, y - 2));
        }
        if (x - 1 >= 0 && ((_d = Board[x - 1][y - 2]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x - 1, y - 2));
        }
    }
    if (x + 2 <= 7) {
        if (y + 1 <= 7 && ((_e = Board[x + 2][y + 1]) === null || _e === void 0 ? void 0 : _e.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x + 2, y + 1));
        }
        if (y - 1 >= 0 && ((_f = Board[x + 2][y - 1]) === null || _f === void 0 ? void 0 : _f.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x + 2, y - 1));
        }
    }
    if (x - 2 >= 0) {
        if (y + 1 <= 7 && ((_g = Board[x - 2][y + 1]) === null || _g === void 0 ? void 0 : _g.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x - 2, y + 1));
        }
        if (y - 1 >= 0 && ((_h = Board[x - 2][y - 1]) === null || _h === void 0 ? void 0 : _h.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new Coordinate(x - 2, y - 1));
        }
    }
}
function moveLikeKing(self) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let x = self.CurrentPosition.X;
    let y = self.CurrentPosition.Y;
    if (x + 1 <= 7 && ((_a = Board[x + 1][y]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x + 1, y));
    }
    if (x + 1 <= 7 && y + 1 <= 7 && ((_b = Board[x + 1][y + 1]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x + 1, y + 1));
    }
    if (x + 1 <= 7 && y - 1 >= 0 && ((_c = Board[x + 1][y - 1]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x + 1, y - 1));
    }
    if (x - 1 >= 0 && ((_d = Board[x - 1][y]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x - 1, y));
    }
    if (x - 1 >= 0 && y + 1 <= 7 && ((_e = Board[x - 1][y + 1]) === null || _e === void 0 ? void 0 : _e.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x - 1, y + 1));
    }
    if (x - 1 >= 0 && y - 1 >= 0 && ((_f = Board[x - 1][y - 1]) === null || _f === void 0 ? void 0 : _f.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x - 1, y - 1));
    }
    if (y + 1 <= 7 && ((_g = Board[x][y + 1]) === null || _g === void 0 ? void 0 : _g.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x, y + 1));
    }
    if (y - 1 >= 0 && ((_h = Board[x][y - 1]) === null || _h === void 0 ? void 0 : _h.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new Coordinate(x, y - 1));
    }
}
function moveLikeQueen(self) {
    moveLikeRook(self);
    moveLikeBishop(self);
}
function pawnCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Pawn");
    piece.Moves.push(moveLikePawn);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function rookCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Rook");
    piece.Moves.push(moveLikeRook);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function bishopCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Bishop");
    piece.Moves.push(moveLikeBishop);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function knightCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Knight");
    piece.Moves.push(moveLikeKnight);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function kingCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "King");
    piece.Moves.push(moveLikeKing);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function queenCreator(isWhite, currentPosition) {
    let piece = new Piece(isWhite, currentPosition, "Queen");
    piece.Moves.push(moveLikeQueen);
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
                    drawVisualCell(logicalCell);
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
    let visualCellImgBackground = document.createElement("div");
    visualCellImgBackground.setAttribute("style", `background-image: url("./pieces/${logicalCell.IsWhite ? "light" : "dark"}-${logicalCell.Name.toLowerCase()}.svg")`);
    visualCellImgBackground.setAttribute("class", " piece-background");
    visualCellImgBackground.setAttribute("draggable", "true");
    visualCell.appendChild(visualCellImgBackground);
}
function movePiece(piece, destination) {
    let formerCoordinates = piece.CurrentPosition;
    removeVisualCell(piece.CurrentPosition);
    destroyPiece(destination);
    updatePiecePosition(piece, destination);
    drawVisualCell(piece);
    Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
    // console.log(`Moved ${piece.Name} at (${formerCoordinates.X},${formerCoordinates.Y}) -> (${piece.CurrentPosition.X},${piece.CurrentPosition.Y})`);
}
function updateLegalMoves(piece) {
    piece.LegalMoves = [];
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
        if (e.target.className.includes("legalMove") || e.target.parentElement.className.includes("legalMove")) {
            let target = e.target.className.includes("legalMove") ? e.target : e.target.parentElement;
            let dropCoordinate = getCoordinateFromElement(target);
            console.log(`dropCoordinate : (${dropCoordinate.X}, ${dropCoordinate.Y})`);
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
function destroyPiece(coordinate) {
    if (Board[coordinate.X][coordinate.Y] !== undefined) {
        removeVisualCell(coordinate);
        Board[coordinate.X][coordinate.Y] = undefined;
    }
}
initGame();
