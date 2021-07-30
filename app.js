"use strict";
exports.__esModule = true;
var piece_js_1 = require("./classes/piece.js");
var coordinate_js_1 = require("./classes/coordinate.js");
function setupBoardColors() {
    var board = document.getElementById('chessBoard');
    if (board == null)
        throw Error;
    var lightColor = true;
    for (var i = 0; i < board.children.length; i++) {
        var row = board.children[i];
        for (var j = 0; j < row.children.length; j++) {
            lightColor ? row.children[j].className += ' light-cell' : row.children[j].className += ' dark-cell';
            lightColor ? lightColor = false : lightColor = true;
        }
        lightColor ? lightColor = false : lightColor = true;
    }
}
var isWhiteTurn = true;
function setupDefaultBoardPieces() {
    // White pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(true, new coordinate_js_1.Coordinate(i, 1));
    }
    rookCreator(true, new coordinate_js_1.Coordinate(0, 0));
    rookCreator(true, new coordinate_js_1.Coordinate(7, 0));
    knightCreator(true, new coordinate_js_1.Coordinate(1, 0));
    knightCreator(true, new coordinate_js_1.Coordinate(6, 0));
    bishopCreator(true, new coordinate_js_1.Coordinate(2, 0));
    bishopCreator(true, new coordinate_js_1.Coordinate(5, 0));
    kingCreator(true, new coordinate_js_1.Coordinate(4, 0));
    queenCreator(true, new coordinate_js_1.Coordinate(3, 0));
    // Black pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(false, new coordinate_js_1.Coordinate(i, 6));
    }
    rookCreator(false, new coordinate_js_1.Coordinate(0, 7));
    rookCreator(false, new coordinate_js_1.Coordinate(7, 7));
    knightCreator(false, new coordinate_js_1.Coordinate(1, 7));
    knightCreator(false, new coordinate_js_1.Coordinate(6, 7));
    bishopCreator(false, new coordinate_js_1.Coordinate(2, 7));
    bishopCreator(false, new coordinate_js_1.Coordinate(5, 7));
    kingCreator(false, new coordinate_js_1.Coordinate(4, 7));
    queenCreator(false, new coordinate_js_1.Coordinate(3, 7));
}
var Board = [[], [], [], [], [], [], [], []];
var lastTouchedPiece;
var whiteKing;
var blackKing;
var whiteKingIsChecked = false;
var blackKingIsChecked = false;
function initGame() {
    setupBoardColors();
    setupDefaultBoardPieces();
    drawBoard();
    makePieceDraggable();
    makeCellsLandable();
    updateAllLegalMovesAndFindChecks();
}
function updatePieceJustMoved() {
    for (var y = 0; y <= 7; y++) {
        for (var x = 0; x <= 7; x++) {
            var boardElement = Board[x][y];
            if (boardElement !== undefined && boardElement.Name === "Pawn" && boardElement.JustMadeFirstMove) {
                boardElement.JustMadeFirstMove = false;
            }
        }
    }
}
function moveLikePawn(self) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    // auto promoting into queen
    if (self.CurrentPosition.Y == 0 || self.CurrentPosition.Y == 7) {
        var coordinate = self.CurrentPosition;
        var isWhite = self.IsWhite;
        destroyPiece(self.CurrentPosition);
        queenCreator(isWhite, coordinate);
        drawVisualCell(Board[coordinate.X][coordinate.Y]);
    }
    if (self.IsWhite) {
        if (self.CurrentPosition.X - 1 >= 0) {
            if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1] !== undefined) {
                if (((_a = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1]) === null || _a === void 0 ? void 0 : _a.IsWhite) === false) {
                    self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
                }
            }
        }
        if (self.CurrentPosition.X + 1 <= 7) {
            if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1] !== undefined) {
                if (((_b = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1]) === null || _b === void 0 ? void 0 : _b.IsWhite) === false) {
                    self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y + 1));
                }
            }
        }
        if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 1] === undefined) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 1));
            if (Board[self.CurrentPosition.X][self.CurrentPosition.Y + 2] === undefined && self.HasBeenMoved === false) {
                self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y + 2));
            }
        }
        if (self.CurrentPosition.X + 1 <= 7 &&
            Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y] !== undefined &&
            ((_c = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _c === void 0 ? void 0 : _c.Name) === "Pawn" &&
            ((_d = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _d === void 0 ? void 0 : _d.JustMadeFirstMove) &&
            ((_e = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _e === void 0 ? void 0 : _e.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y + 1));
        }
        if (self.CurrentPosition.X - 1 >= 0 &&
            Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y] !== undefined &&
            ((_f = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _f === void 0 ? void 0 : _f.Name) === "Pawn" &&
            ((_g = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _g === void 0 ? void 0 : _g.JustMadeFirstMove) &&
            ((_h = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _h === void 0 ? void 0 : _h.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
        }
    }
    else {
        if (self.CurrentPosition.X - 1 >= 0) {
            if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1] !== undefined) {
                if (((_j = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1]) === null || _j === void 0 ? void 0 : _j.IsWhite) === true) {
                    self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y - 1));
                }
            }
        }
        if (self.CurrentPosition.X + 1 <= 7) {
            if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1] !== undefined) {
                if (((_k = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1]) === null || _k === void 0 ? void 0 : _k.IsWhite) === true) {
                    self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y - 1));
                }
            }
        }
        if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 1] === undefined) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y - 1));
            if (Board[self.CurrentPosition.X][self.CurrentPosition.Y - 2] === undefined && self.HasBeenMoved === false) {
                self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X, self.CurrentPosition.Y - 2));
            }
        }
        if (self.CurrentPosition.X + 1 <= 7 &&
            Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y] !== undefined &&
            ((_l = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _l === void 0 ? void 0 : _l.Name) === "Pawn" &&
            ((_m = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _m === void 0 ? void 0 : _m.JustMadeFirstMove) &&
            ((_o = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _o === void 0 ? void 0 : _o.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y - 1));
        }
        if (self.CurrentPosition.X - 1 >= 0 &&
            Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y] !== undefined &&
            ((_p = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _p === void 0 ? void 0 : _p.Name) === "Pawn" &&
            ((_q = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _q === void 0 ? void 0 : _q.JustMadeFirstMove) &&
            ((_r = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _r === void 0 ? void 0 : _r.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y - 1));
        }
    }
}
function moveLikeRook(self) {
    var _a, _b, _c, _d;
    for (var i = self.CurrentPosition.X - 1; i >= 0; i--) {
        if (((_a = Board[i][self.CurrentPosition.Y]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = self.CurrentPosition.X + 1; i <= 7; i++) {
        if (((_b = Board[i][self.CurrentPosition.Y]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = self.CurrentPosition.Y - 1; i >= 0; i--) {
        if (((_c = Board[self.CurrentPosition.X][i]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = self.CurrentPosition.Y + 1; i <= 7; i++) {
        if (((_d = Board[self.CurrentPosition.X][i]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X, i));
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
    for (var i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y + i <= 7; i++) {
        if (((_a = Board[self.CurrentPosition.X + i][self.CurrentPosition.Y + i]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y + i));
            if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y + i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y + i <= 7; i++) {
        if (((_b = Board[self.CurrentPosition.X - i][self.CurrentPosition.Y + i]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X - i, self.CurrentPosition.Y + i));
            if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y + i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y - i >= 0; i++) {
        if (((_c = Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y - i >= 0; i++) {
        if (((_d = Board[self.CurrentPosition.X - i][self.CurrentPosition.Y - i]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(self.CurrentPosition.X - i, self.CurrentPosition.Y - i));
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
    var y = self.CurrentPosition.Y;
    var x = self.CurrentPosition.X;
    if (y + 2 <= 7) {
        if (x + 1 <= 7 && ((_a = Board[x + 1][y + 2]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 1, y + 2));
        }
        if (x - 1 >= 0 && ((_b = Board[x - 1][y + 2]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 1, y + 2));
        }
    }
    if (y - 2 >= 0) {
        if (x + 1 <= 7 && ((_c = Board[x + 1][y - 2]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 1, y - 2));
        }
        if (x - 1 >= 0 && ((_d = Board[x - 1][y - 2]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 1, y - 2));
        }
    }
    if (x + 2 <= 7) {
        if (y + 1 <= 7 && ((_e = Board[x + 2][y + 1]) === null || _e === void 0 ? void 0 : _e.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 2, y + 1));
        }
        if (y - 1 >= 0 && ((_f = Board[x + 2][y - 1]) === null || _f === void 0 ? void 0 : _f.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 2, y - 1));
        }
    }
    if (x - 2 >= 0) {
        if (y + 1 <= 7 && ((_g = Board[x - 2][y + 1]) === null || _g === void 0 ? void 0 : _g.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 2, y + 1));
        }
        if (y - 1 >= 0 && ((_h = Board[x - 2][y - 1]) === null || _h === void 0 ? void 0 : _h.IsWhite) !== self.IsWhite) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 2, y - 1));
        }
    }
}
function moveLikeKing(self) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var x = self.CurrentPosition.X;
    var y = self.CurrentPosition.Y;
    if (x + 1 <= 7 && ((_a = Board[x + 1][y]) === null || _a === void 0 ? void 0 : _a.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 1, y));
    }
    if (x + 1 <= 7 && y + 1 <= 7 && ((_b = Board[x + 1][y + 1]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 1, y + 1));
    }
    if (x + 1 <= 7 && y - 1 >= 0 && ((_c = Board[x + 1][y - 1]) === null || _c === void 0 ? void 0 : _c.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x + 1, y - 1));
    }
    if (x - 1 >= 0 && ((_d = Board[x - 1][y]) === null || _d === void 0 ? void 0 : _d.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 1, y));
    }
    if (x - 1 >= 0 && y + 1 <= 7 && ((_e = Board[x - 1][y + 1]) === null || _e === void 0 ? void 0 : _e.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 1, y + 1));
    }
    if (x - 1 >= 0 && y - 1 >= 0 && ((_f = Board[x - 1][y - 1]) === null || _f === void 0 ? void 0 : _f.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x - 1, y - 1));
    }
    if (y + 1 <= 7 && ((_g = Board[x][y + 1]) === null || _g === void 0 ? void 0 : _g.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x, y + 1));
    }
    if (y - 1 >= 0 && ((_h = Board[x][y - 1]) === null || _h === void 0 ? void 0 : _h.IsWhite) !== self.IsWhite) {
        self.LegalMoves.push(new coordinate_js_1.Coordinate(x, y - 1));
    }
    // castling...
    var ownKingIsChecked = self.IsWhite ? whiteKingIsChecked : blackKingIsChecked;
    if (!self.HasBeenMoved && !ownKingIsChecked) {
        if (Board[5][self.CurrentPosition.Y] === undefined && Board[6][self.CurrentPosition.Y] === undefined && Board[7][self.CurrentPosition.Y] !== undefined && ((_j = Board[7][self.CurrentPosition.Y]) === null || _j === void 0 ? void 0 : _j.HasBeenMoved) === false) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(6, self.CurrentPosition.Y));
            self.LegalMoves.push(new coordinate_js_1.Coordinate(7, self.CurrentPosition.Y));
        }
        if (Board[3][self.CurrentPosition.Y] === undefined && Board[2][self.CurrentPosition.Y] === undefined && Board[0][self.CurrentPosition.Y] !== undefined && ((_k = Board[0][self.CurrentPosition.Y]) === null || _k === void 0 ? void 0 : _k.HasBeenMoved) === false) {
            self.LegalMoves.push(new coordinate_js_1.Coordinate(2, self.CurrentPosition.Y));
            self.LegalMoves.push(new coordinate_js_1.Coordinate(0, self.CurrentPosition.Y));
        }
    }
}
function pawnCreator(isWhite, currentPosition) {
    var piece = new piece_js_1.Piece(isWhite, currentPosition, "Pawn");
    piece.Moves.push(moveLikePawn);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function rookCreator(isWhite, currentPosition) {
    var piece = new piece_js_1.Piece(isWhite, currentPosition, "Rook");
    piece.Moves.push(moveLikeRook);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function bishopCreator(isWhite, currentPosition) {
    var piece = new piece_js_1.Piece(isWhite, currentPosition, "Bishop");
    piece.Moves.push(moveLikeBishop);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function knightCreator(isWhite, currentPosition) {
    var piece = new piece_js_1.Piece(isWhite, currentPosition, "Knight");
    piece.Moves.push(moveLikeKnight);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function kingCreator(isWhite, currentPosition) {
    var piece = new piece_js_1.Piece(isWhite, currentPosition, "King");
    piece.Moves.push(moveLikeKing);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
    if (isWhite) {
        whiteKing = piece;
    }
    else {
        blackKing = piece;
    }
}
function queenCreator(isWhite, currentPosition) {
    var piece = new piece_js_1.Piece(isWhite, currentPosition, "Queen");
    piece.Moves.push(moveLikeBishop);
    piece.Moves.push(moveLikeRook);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function drawBoard() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                var rowElement = document.getElementById("row-" + (row + 1));
                if (rowElement == null)
                    throw Error;
                var visualCell = rowElement.children[col];
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
    var rowElement = document.getElementById("row-" + (coordinate.Y + 1));
    if (rowElement != null)
        return rowElement.children[coordinate.X];
    else
        throw Error;
}
function removeVisualCell(cellCoordinate) {
    var visualCell = getVisualCell(cellCoordinate);
    if (visualCell.firstElementChild != null) {
        visualCell.removeChild(visualCell.firstElementChild);
    }
}
function updatePiecePosition(piece, destination) {
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = undefined;
    piece.CurrentPosition = destination;
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function drawVisualCell(piece) {
    var visualCell = getVisualCell(piece.CurrentPosition);
    var logicalCell = getLogicalCell(piece.CurrentPosition);
    if (logicalCell == undefined)
        throw Error;
    while (visualCell.firstElementChild != null)
        visualCell.removeChild(visualCell.firstElementChild);
    var visualCellImgBackground = document.createElement("div");
    visualCellImgBackground.setAttribute("style", "background-image: url(\"./pieces/" + (logicalCell.IsWhite ? "light" : "dark") + "-" + logicalCell.Name.toLowerCase() + ".svg\")");
    visualCellImgBackground.setAttribute("class", " piece-background");
    visualCellImgBackground.setAttribute("draggable", "true");
    visualCell.appendChild(visualCellImgBackground);
}
function movePiece(piece, destination) {
    var _a, _b;
    // Castling
    if (piece.Name === "King") {
        var xDifference = piece.CurrentPosition.X - destination.X;
        if (Math.abs(xDifference) > 1) {
            // Castle LEFT
            if (xDifference > 0) {
                for (var i = 3; i >= 2; i--) {
                    if (moveIsIllegal(piece, new coordinate_js_1.Coordinate(i, piece.CurrentPosition.Y)))
                        return;
                }
                destination.X = 2;
                movePiece(Board[0][piece.CurrentPosition.Y], new coordinate_js_1.Coordinate(3, piece.CurrentPosition.Y));
            }
            else { // Castle RIGHT
                for (var i = 5; i <= 6; i++) {
                    if (moveIsIllegal(piece, new coordinate_js_1.Coordinate(i, piece.CurrentPosition.Y)))
                        return;
                }
                destination.X = 6;
                movePiece(Board[7][piece.CurrentPosition.Y], new coordinate_js_1.Coordinate(5, piece.CurrentPosition.Y));
            }
        }
    }
    // destroy piece enpassant
    if (piece.Name === "Pawn") {
        if (piece.HasBeenMoved === false) {
            piece.JustMadeFirstMove = true;
        }
        if (Board[destination.X][destination.Y] === undefined) {
            var behindDestination = piece.IsWhite ? destination.Y - 1 : destination.Y + 1;
            console.log("");
            if (Board[destination.X][behindDestination] !== undefined &&
                ((_a = Board[destination.X][behindDestination]) === null || _a === void 0 ? void 0 : _a.Name) === "Pawn" &&
                ((_b = Board[destination.X][behindDestination]) === null || _b === void 0 ? void 0 : _b.IsWhite) !== piece.IsWhite) {
                destroyPiece(new coordinate_js_1.Coordinate(destination.X, behindDestination));
            }
        }
    }
    var formerCoordinates = piece.CurrentPosition;
    removeVisualCell(formerCoordinates);
    destroyPiece(destination);
    updatePiecePosition(piece, destination);
    drawVisualCell(piece);
    Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
    isWhiteTurn = !isWhiteTurn;
    updateAllLegalMovesAndFindChecks();
    // console.log(`Moved ${piece.Name} at (${formerCoordinates.X},${formerCoordinates.Y}) -> (${piece.CurrentPosition.X},${piece.CurrentPosition.Y})`);
}
function moveIsIllegal(piece, destination) {
    var formerCoordinates = piece.CurrentPosition;
    var destinationPiece = Board[destination.X][destination.Y];
    unhighlightLegalMoves(piece);
    updatePiecePosition(piece, destination);
    updateAllLegalMovesAndFindChecks();
    var kingGetsChecked = false;
    if (piece.IsWhite && whiteKingIsChecked)
        kingGetsChecked = true;
    if (piece.IsWhite === false && blackKingIsChecked)
        kingGetsChecked = true;
    // Revert board to former state
    updatePiecePosition(piece, formerCoordinates);
    updateLegalMoves(piece);
    if (destinationPiece !== undefined)
        updatePiecePosition(destinationPiece, destinationPiece.CurrentPosition);
    drawBoard();
    return kingGetsChecked;
}
function updateLegalMoves(piece) {
    piece.LegalMoves = [];
    for (var i = 0; i < piece.Moves.length; i++) {
        piece.Moves[i](piece);
    }
}
function highlightLegalMoves(piece) {
    for (var i = 0; i < piece.LegalMoves.length; i++) {
        var visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className += " legalMove";
    }
}
function unhighlightLegalMoves(piece) {
    for (var i = 0; i < piece.LegalMoves.length; i++) {
        var visualCell = getVisualCell(piece.LegalMoves[i]);
        visualCell.className = visualCell.className.replace(" legalMove", "");
    }
}
function updateAllLegalMovesAndFindChecks() {
    whiteKingIsChecked = false;
    blackKingIsChecked = false;
    var _loop_1 = function (y) {
        var _loop_2 = function (x) {
            if (Board[x][y] === undefined)
                return "continue";
            updateLegalMoves(Board[x][y]);
            var opponentKing = Board[x][y].IsWhite ? blackKing : whiteKing;
            Board[x][y].LegalMoves.forEach(function (legalMove) {
                var _a;
                if (legalMove.X === opponentKing.CurrentPosition.X && legalMove.Y === opponentKing.CurrentPosition.Y) {
                    if ((_a = Board[x][y]) === null || _a === void 0 ? void 0 : _a.IsWhite)
                        blackKingIsChecked = true;
                    else
                        whiteKingIsChecked = true;
                }
            });
        };
        for (var x = 0; x <= 7; x++) {
            _loop_2(x);
        }
    };
    for (var y = 0; y <= 7; y++) {
        _loop_1(y);
    }
}
function makePieceDraggable() {
    document.addEventListener("dragstart", function (e) {
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        var piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        if (piece.IsWhite === isWhiteTurn || true) {
            updateLegalMoves(piece);
            highlightLegalMoves(piece);
            lastTouchedPiece = piece;
        }
    });
    //     // document.addEventListener("drag", (e) => {
    //     //     console.log("drag middle!");
    //     // });
    document.addEventListener("dragend", function (e) {
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        var piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        unhighlightLegalMoves(lastTouchedPiece);
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
            var target = e.target.className.includes("legalMove") ? e.target : e.target.parentElement;
            var dropCoordinate = getCoordinateFromElement(target);
            if (moveIsIllegal(lastTouchedPiece, dropCoordinate) === false) {
                updatePieceJustMoved();
                movePiece(lastTouchedPiece, dropCoordinate);
                lastTouchedPiece.HasBeenMoved = true;
                drawBoard();
            }
            unhighlightLegalMoves(lastTouchedPiece);
        }
    });
}
function getCoordinateFromElement(element) {
    var cellDiv;
    if (element.nodeName === "DIV") {
        cellDiv = element;
    }
    else if (element.nodeName === "IMG") {
        cellDiv = element.parentElement;
    }
    else {
        throw Error;
    }
    var rowIndex = parseInt(cellDiv.getAttribute("row")) - 1;
    var colIndex = parseInt(cellDiv.id.replace("col-", "")) - 1;
    return new coordinate_js_1.Coordinate(colIndex, rowIndex);
}
function destroyPiece(coordinate) {
    if (Board[coordinate.X][coordinate.Y] !== undefined) {
        removeVisualCell(coordinate);
        Board[coordinate.X][coordinate.Y] = undefined;
    }
}
initGame();
