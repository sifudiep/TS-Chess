import { Piece } from "./classes/Piece.js";
import { Coordinate } from "./classes/Coordinate.js";
import { PieceColor } from "./enum/PieceColor.js";
// export server.js, init server!
var io = require("socket.io-client");
var socket = io("https://ts-chess.onrender.com/");
// const socket = io("ws://localhost:3000")
var moveAudio = new Audio('./sfx/move.wav');
var checkAudio = new Audio('./sfx/check.wav');
var errorAudio = new Audio('./sfx/error.wav');
var turn = PieceColor.White;
var playerColor = PieceColor.None;
var isPlayer = false;
var playerName = "Spectator";
var lobbyId = window.location.href.split("/").pop();
var Board = [[], [], [], [], [], [], [], []];
var lastTouchedPiece;
var whiteKing;
var blackKing;
var whiteKingIsChecked = false;
var blackKingIsChecked = false;
initGame();
function emitGetLobbyId() {
    socket.emit("lobby", lobbyId);
}
function setBoardPerspective() {
    var _a, _b, _c;
    if (playerColor === PieceColor.White) {
        (_a = document.getElementById("black-perspective")) === null || _a === void 0 ? void 0 : _a.remove();
    }
    else if (playerColor === PieceColor.Black) {
        (_b = document.getElementById("white-perspective")) === null || _b === void 0 ? void 0 : _b.remove();
    }
    else if (playerColor === PieceColor.None) {
        (_c = document.getElementById("black-perspective")) === null || _c === void 0 ? void 0 : _c.remove();
    }
    document.getElementsByClassName("chessBoard")[0].setAttribute("style", "display: grid");
    drawBoard();
}
function setupBoardColors() {
    var blackBoard = document.getElementsByClassName('chessBoard')[0];
    var whiteBoard = document.getElementsByClassName('chessBoard')[1];
    var lightColor = true;
    for (var i = 0; i < whiteBoard.children.length; i++) {
        var whiteRow = whiteBoard.children[i];
        var blackRow = blackBoard.children[i];
        for (var j = 0; j < whiteRow.children.length; j++) {
            lightColor ? whiteRow.children[j].className += ' light-cell' : whiteRow.children[j].className += ' dark-cell';
            lightColor ? blackRow.children[j].className += ' light-cell' : blackRow.children[j].className += ' dark-cell';
            lightColor = !lightColor;
        }
        lightColor = !lightColor;
    }
}
function connectToGame() {
    socket.on('player-connect', function (data) {
        if (playerColor !== PieceColor.None)
            return;
        if (data !== PieceColor.None)
            isPlayer = true;
        if (data == PieceColor.White) {
            playerName = "White";
            playerColor = PieceColor.White;
        }
        else if (data == PieceColor.Black) {
            playerName = "Black";
            playerColor = PieceColor.Black;
        }
        setBoardPerspective();
        drawPlayerName();
    });
    socket.on('spectator-connect', function () {
        drawPlayerName();
        setBoardPerspective();
    });
    socket.on("get-board", function (data) {
        console.log(data.moveArray);
        drawBoardFromArray(data.moveArray, data.turn);
    });
}
function drawBoardFromArray(moveArray, playerTurn) {
    for (var i = 0; i < moveArray.length; i++) {
        movePieceByText(moveArray[i]);
    }
}
function detectMultiplayerMove() {
    socket.on('move', function (data) {
        movePieceByText(data.coordinate);
        turn = data.turn;
    });
}
function drawPlayerName() {
    document.querySelector('h1').innerHTML = "Name: ".concat(playerName);
}
function setupDefaultBoardPieces() {
    // White pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(PieceColor.White, new Coordinate(i, 1));
    }
    rookCreator(PieceColor.White, new Coordinate(0, 0));
    rookCreator(PieceColor.White, new Coordinate(7, 0));
    knightCreator(PieceColor.White, new Coordinate(1, 0));
    knightCreator(PieceColor.White, new Coordinate(6, 0));
    bishopCreator(PieceColor.White, new Coordinate(2, 0));
    bishopCreator(PieceColor.White, new Coordinate(5, 0));
    kingCreator(PieceColor.White, new Coordinate(4, 0));
    queenCreator(PieceColor.White, new Coordinate(3, 0));
    // Black pieces...
    for (var i = 0; i < 8; i++) {
        pawnCreator(PieceColor.Black, new Coordinate(i, 6));
    }
    rookCreator(PieceColor.Black, new Coordinate(0, 7));
    rookCreator(PieceColor.Black, new Coordinate(7, 7));
    knightCreator(PieceColor.Black, new Coordinate(1, 7));
    knightCreator(PieceColor.Black, new Coordinate(6, 7));
    bishopCreator(PieceColor.Black, new Coordinate(2, 7));
    bishopCreator(PieceColor.Black, new Coordinate(5, 7));
    kingCreator(PieceColor.Black, new Coordinate(4, 7));
    queenCreator(PieceColor.Black, new Coordinate(3, 7));
}
function initGame() {
    connectToGame();
    emitGetLobbyId();
    setupBoardColors();
    setupDefaultBoardPieces();
    makePieceDraggable();
    makeCellsLandable();
    updateAllLegalMovesAndFindChecks();
    detectMultiplayerMove();
    drawPlayerName();
}
function updatePieceJustMoved(color) {
    for (var y = 0; y <= 7; y++) {
        for (var x = 0; x <= 7; x++) {
            var boardElement = Board[x][y];
            if (boardElement !== undefined && boardElement.Name === "Pawn" && boardElement.JustMadeFirstMove && boardElement.Color === color) {
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
        var color = self.Color;
        destroyPiece(self.CurrentPosition);
        queenCreator(color, coordinate);
        drawVisualCell(Board[coordinate.X][coordinate.Y]);
    }
    if (self.Color === PieceColor.White) {
        if (self.CurrentPosition.X - 1 >= 0) {
            if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1] !== undefined) {
                if (((_a = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y + 1]) === null || _a === void 0 ? void 0 : _a.Color) === PieceColor.Black) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
                }
            }
        }
        if (self.CurrentPosition.X + 1 <= 7) {
            if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1] !== undefined) {
                if (((_b = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y + 1]) === null || _b === void 0 ? void 0 : _b.Color) === PieceColor.Black) {
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
        if (self.CurrentPosition.X + 1 <= 7 &&
            Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y] !== undefined &&
            ((_c = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _c === void 0 ? void 0 : _c.Name) === "Pawn" &&
            ((_d = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _d === void 0 ? void 0 : _d.JustMadeFirstMove) &&
            ((_e = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _e === void 0 ? void 0 : _e.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y + 1));
        }
        if (self.CurrentPosition.X - 1 >= 0 &&
            Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y] !== undefined &&
            ((_f = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _f === void 0 ? void 0 : _f.Name) === "Pawn" &&
            ((_g = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _g === void 0 ? void 0 : _g.JustMadeFirstMove) &&
            ((_h = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _h === void 0 ? void 0 : _h.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y + 1));
        }
    }
    else if (self.Color === PieceColor.Black) {
        if (self.CurrentPosition.X - 1 >= 0) {
            if (Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1] !== undefined) {
                if (((_j = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y - 1]) === null || _j === void 0 ? void 0 : _j.Color) === PieceColor.White) {
                    self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y - 1));
                }
            }
        }
        if (self.CurrentPosition.X + 1 <= 7) {
            if (Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1] !== undefined) {
                if (((_k = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y - 1]) === null || _k === void 0 ? void 0 : _k.Color) === PieceColor.White) {
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
        if (self.CurrentPosition.X + 1 <= 7 &&
            Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y] !== undefined &&
            ((_l = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _l === void 0 ? void 0 : _l.Name) === "Pawn" &&
            ((_m = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _m === void 0 ? void 0 : _m.JustMadeFirstMove) &&
            ((_o = Board[self.CurrentPosition.X + 1][self.CurrentPosition.Y]) === null || _o === void 0 ? void 0 : _o.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + 1, self.CurrentPosition.Y - 1));
        }
        if (self.CurrentPosition.X - 1 >= 0 &&
            Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y] !== undefined &&
            ((_p = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _p === void 0 ? void 0 : _p.Name) === "Pawn" &&
            ((_q = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _q === void 0 ? void 0 : _q.JustMadeFirstMove) &&
            ((_r = Board[self.CurrentPosition.X - 1][self.CurrentPosition.Y]) === null || _r === void 0 ? void 0 : _r.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - 1, self.CurrentPosition.Y - 1));
        }
    }
}
function moveLikeRook(self) {
    var _a, _b, _c, _d;
    for (var i = self.CurrentPosition.X - 1; i >= 0; i--) {
        if (((_a = Board[i][self.CurrentPosition.Y]) === null || _a === void 0 ? void 0 : _a.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = self.CurrentPosition.X + 1; i <= 7; i++) {
        if (((_b = Board[i][self.CurrentPosition.Y]) === null || _b === void 0 ? void 0 : _b.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(i, self.CurrentPosition.Y));
            if (Board[i][self.CurrentPosition.Y] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = self.CurrentPosition.Y - 1; i >= 0; i--) {
        if (((_c = Board[self.CurrentPosition.X][i]) === null || _c === void 0 ? void 0 : _c.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X, i));
            if (Board[self.CurrentPosition.X][i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = self.CurrentPosition.Y + 1; i <= 7; i++) {
        if (((_d = Board[self.CurrentPosition.X][i]) === null || _d === void 0 ? void 0 : _d.Color) !== self.Color) {
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
    for (var i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y + i <= 7; i++) {
        if (((_a = Board[self.CurrentPosition.X + i][self.CurrentPosition.Y + i]) === null || _a === void 0 ? void 0 : _a.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y + i));
            if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y + i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y + i <= 7; i++) {
        if (((_b = Board[self.CurrentPosition.X - i][self.CurrentPosition.Y + i]) === null || _b === void 0 ? void 0 : _b.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X - i, self.CurrentPosition.Y + i));
            if (Board[self.CurrentPosition.X - i][self.CurrentPosition.Y + i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = 1; self.CurrentPosition.X + i <= 7 && self.CurrentPosition.Y - i >= 0; i++) {
        if (((_c = Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i]) === null || _c === void 0 ? void 0 : _c.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(self.CurrentPosition.X + i, self.CurrentPosition.Y - i));
            if (Board[self.CurrentPosition.X + i][self.CurrentPosition.Y - i] !== undefined) {
                break;
            }
        }
        else {
            break;
        }
    }
    for (var i = 1; self.CurrentPosition.X - i >= 0 && self.CurrentPosition.Y - i >= 0; i++) {
        if (((_d = Board[self.CurrentPosition.X - i][self.CurrentPosition.Y - i]) === null || _d === void 0 ? void 0 : _d.Color) !== self.Color) {
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
    var y = self.CurrentPosition.Y;
    var x = self.CurrentPosition.X;
    if (y + 2 <= 7) {
        if (x + 1 <= 7 && ((_a = Board[x + 1][y + 2]) === null || _a === void 0 ? void 0 : _a.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x + 1, y + 2));
        }
        if (x - 1 >= 0 && ((_b = Board[x - 1][y + 2]) === null || _b === void 0 ? void 0 : _b.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x - 1, y + 2));
        }
    }
    if (y - 2 >= 0) {
        if (x + 1 <= 7 && ((_c = Board[x + 1][y - 2]) === null || _c === void 0 ? void 0 : _c.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x + 1, y - 2));
        }
        if (x - 1 >= 0 && ((_d = Board[x - 1][y - 2]) === null || _d === void 0 ? void 0 : _d.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x - 1, y - 2));
        }
    }
    if (x + 2 <= 7) {
        if (y + 1 <= 7 && ((_e = Board[x + 2][y + 1]) === null || _e === void 0 ? void 0 : _e.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x + 2, y + 1));
        }
        if (y - 1 >= 0 && ((_f = Board[x + 2][y - 1]) === null || _f === void 0 ? void 0 : _f.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x + 2, y - 1));
        }
    }
    if (x - 2 >= 0) {
        if (y + 1 <= 7 && ((_g = Board[x - 2][y + 1]) === null || _g === void 0 ? void 0 : _g.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x - 2, y + 1));
        }
        if (y - 1 >= 0 && ((_h = Board[x - 2][y - 1]) === null || _h === void 0 ? void 0 : _h.Color) !== self.Color) {
            self.LegalMoves.push(new Coordinate(x - 2, y - 1));
        }
    }
}
function moveLikeKing(self) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var x = self.CurrentPosition.X;
    var y = self.CurrentPosition.Y;
    if (x + 1 <= 7 && ((_a = Board[x + 1][y]) === null || _a === void 0 ? void 0 : _a.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x + 1, y));
    }
    if (x + 1 <= 7 && y + 1 <= 7 && ((_b = Board[x + 1][y + 1]) === null || _b === void 0 ? void 0 : _b.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x + 1, y + 1));
    }
    if (x + 1 <= 7 && y - 1 >= 0 && ((_c = Board[x + 1][y - 1]) === null || _c === void 0 ? void 0 : _c.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x + 1, y - 1));
    }
    if (x - 1 >= 0 && ((_d = Board[x - 1][y]) === null || _d === void 0 ? void 0 : _d.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x - 1, y));
    }
    if (x - 1 >= 0 && y + 1 <= 7 && ((_e = Board[x - 1][y + 1]) === null || _e === void 0 ? void 0 : _e.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x - 1, y + 1));
    }
    if (x - 1 >= 0 && y - 1 >= 0 && ((_f = Board[x - 1][y - 1]) === null || _f === void 0 ? void 0 : _f.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x - 1, y - 1));
    }
    if (y + 1 <= 7 && ((_g = Board[x][y + 1]) === null || _g === void 0 ? void 0 : _g.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x, y + 1));
    }
    if (y - 1 >= 0 && ((_h = Board[x][y - 1]) === null || _h === void 0 ? void 0 : _h.Color) !== self.Color) {
        self.LegalMoves.push(new Coordinate(x, y - 1));
    }
    // castling...
    var ownKingIsChecked = self.Color === PieceColor.White ? whiteKingIsChecked : blackKingIsChecked;
    if (!self.HasBeenMoved && !ownKingIsChecked) {
        if (Board[5][self.CurrentPosition.Y] === undefined && Board[6][self.CurrentPosition.Y] === undefined && Board[7][self.CurrentPosition.Y] !== undefined && ((_j = Board[7][self.CurrentPosition.Y]) === null || _j === void 0 ? void 0 : _j.HasBeenMoved) === false) {
            self.LegalMoves.push(new Coordinate(6, self.CurrentPosition.Y));
            self.LegalMoves.push(new Coordinate(7, self.CurrentPosition.Y));
        }
        if (Board[3][self.CurrentPosition.Y] === undefined && Board[2][self.CurrentPosition.Y] === undefined && Board[0][self.CurrentPosition.Y] !== undefined && ((_k = Board[0][self.CurrentPosition.Y]) === null || _k === void 0 ? void 0 : _k.HasBeenMoved) === false) {
            self.LegalMoves.push(new Coordinate(2, self.CurrentPosition.Y));
            self.LegalMoves.push(new Coordinate(0, self.CurrentPosition.Y));
        }
    }
}
function pawnCreator(color, currentPosition) {
    var piece = new Piece(color, currentPosition, "Pawn");
    piece.Moves.push(moveLikePawn);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function rookCreator(color, currentPosition) {
    var piece = new Piece(color, currentPosition, "Rook");
    piece.Moves.push(moveLikeRook);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function bishopCreator(color, currentPosition) {
    var piece = new Piece(color, currentPosition, "Bishop");
    piece.Moves.push(moveLikeBishop);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function knightCreator(color, currentPosition) {
    var piece = new Piece(color, currentPosition, "Knight");
    piece.Moves.push(moveLikeKnight);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function kingCreator(color, currentPosition) {
    var piece = new Piece(color, currentPosition, "King");
    piece.Moves.push(moveLikeKing);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
    if (color === PieceColor.White) {
        whiteKing = piece;
    }
    else if (color === PieceColor.Black) {
        blackKing = piece;
    }
}
function queenCreator(color, currentPosition) {
    var piece = new Piece(color, currentPosition, "Queen");
    piece.Moves.push(moveLikeBishop);
    piece.Moves.push(moveLikeRook);
    Board[piece.CurrentPosition.X][piece.CurrentPosition.Y] = piece;
}
function drawBoard() {
    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            var logicalCell = Board[col][row];
            if (logicalCell !== undefined) {
                var visualCell = getVisualCell(new Coordinate(col, row));
                if ((visualCell === null || visualCell === void 0 ? void 0 : visualCell.children.length) === 0) {
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
    var rowElement = document.getElementById("row-".concat(coordinate.Y + 1));
    if (rowElement != null) {
        for (var i = 0; i < rowElement.children.length; i++) {
            if (parseInt(rowElement.children[i].id[4]) === coordinate.X + 1) {
                return rowElement.children[i];
            }
        }
    }
    // HERE IS THE BUG, dont use [], find the child with id:col-$
    else
        throw Error;
}
function removeVisualCell(cellCoordinate) {
    var visualCell = getVisualCell(cellCoordinate);
    if ((visualCell === null || visualCell === void 0 ? void 0 : visualCell.firstElementChild) != null) {
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
    while ((visualCell === null || visualCell === void 0 ? void 0 : visualCell.firstElementChild) != null)
        visualCell.removeChild(visualCell.firstElementChild);
    var visualCellImgBackground = document.createElement("div");
    var color = "";
    if (piece.Color === PieceColor.White)
        color = "light";
    if (piece.Color === PieceColor.Black)
        color = "dark";
    visualCellImgBackground.setAttribute("style", "background-image: url(\"./pieces/".concat(color, "-").concat(logicalCell.Name.toLowerCase(), ".svg\")"));
    visualCellImgBackground.setAttribute("class", " piece-background");
    visualCellImgBackground.setAttribute("draggable", "true");
    visualCell === null || visualCell === void 0 ? void 0 : visualCell.appendChild(visualCellImgBackground);
}
function movePieceByText(textInput) {
    var firstCoordinate = translateTextToCoordinate(textInput.substring(0, 2));
    var secondCoordinate = translateTextToCoordinate(textInput.substring(2, 4));
    var piece = Board[firstCoordinate.X][firstCoordinate.Y];
    if (piece !== undefined) {
        updatePieceJustMoved(turn);
        if (piece.Name === "Pawn" && piece.HasBeenMoved === false) {
            piece.JustMadeFirstMove = true;
        }
        var formerCoordinates = piece.CurrentPosition;
        removeVisualCell(formerCoordinates);
        destroyPiece(secondCoordinate);
        updatePiecePosition(piece, secondCoordinate);
        drawVisualCell(piece);
        Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
        updateAllLegalMovesAndFindChecks();
        changeTurn();
        piece.HasBeenMoved = true;
        if (blackKingIsChecked || whiteKingIsChecked) {
            checkAudio.play();
        }
        else {
            moveAudio.play();
        }
    }
}
function movePiece(piece, destination, shouldChangeTurn) {
    var _a, _b;
    // Castling
    updatePieceJustMoved(turn);
    if (piece.Name === "King") {
        var xDifference = piece.CurrentPosition.X - destination.X;
        if (Math.abs(xDifference) > 1) {
            // Castle LEFT
            if (xDifference > 0) {
                for (var i = 3; i >= 2; i--) {
                    if (moveIsIllegal(piece, new Coordinate(i, piece.CurrentPosition.Y))) {
                        return;
                    }
                }
                destination.X = 2;
                movePiece(Board[0][piece.CurrentPosition.Y], new Coordinate(3, piece.CurrentPosition.Y), false);
            }
            else { // Castle RIGHT
                for (var i = 5; i <= 6; i++) {
                    if (moveIsIllegal(piece, new Coordinate(i, piece.CurrentPosition.Y))) {
                        return;
                    }
                }
                destination.X = 6;
                movePiece(Board[7][piece.CurrentPosition.Y], new Coordinate(5, piece.CurrentPosition.Y), false);
            }
        }
    }
    // destroy piece enpassant
    if (piece.Name === "Pawn") {
        if (piece.HasBeenMoved === false) {
            piece.JustMadeFirstMove = true;
        }
        if (Board[destination.X][destination.Y] === undefined) {
            var behindDestination = piece.Color === PieceColor.White ? destination.Y - 1 : destination.Y + 1;
            if (Board[destination.X][behindDestination] !== undefined &&
                ((_a = Board[destination.X][behindDestination]) === null || _a === void 0 ? void 0 : _a.Name) === "Pawn" &&
                ((_b = Board[destination.X][behindDestination]) === null || _b === void 0 ? void 0 : _b.Color) !== piece.Color) {
                destroyPiece(new Coordinate(destination.X, behindDestination));
            }
        }
    }
    var formerCoordinates = piece.CurrentPosition;
    removeVisualCell(formerCoordinates);
    destroyPiece(destination);
    updatePiecePosition(piece, destination);
    drawVisualCell(piece);
    Board[formerCoordinates.X][formerCoordinates.Y] = undefined;
    updateAllLegalMovesAndFindChecks();
    if (shouldChangeTurn)
        changeTurn();
    piece.HasBeenMoved = true;
    if (blackKingIsChecked || whiteKingIsChecked) {
        checkAudio.play();
    }
    else {
        moveAudio.play();
    }
    var data = {};
    data.coordinate = translateCoordinateToText(formerCoordinates, destination);
    data.turn = turn;
    data.lobbyId = lobbyId;
    socket.emit('move', data);
}
function translateTextToCoordinate(textCoordinate) {
    var x = -1;
    var y = parseInt(textCoordinate[1]) - 1;
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
function translateCoordinateToText(start, end) {
    var text = "";
    text += (start.X + 10).toString(36);
    text += start.Y + 1;
    text += (end.X + 10).toString(36);
    text += end.Y + 1;
    return text;
}
function changeTurn() {
    if (turn === PieceColor.White) {
        turn = PieceColor.Black;
    }
    else if (turn === PieceColor.Black) {
        turn = PieceColor.White;
    }
}
function moveIsIllegal(piece, destination) {
    var formerCoordinates = piece.CurrentPosition;
    var destinationPiece = Board[destination.X][destination.Y];
    unhighlightLegalMoves(piece);
    updatePiecePosition(piece, destination);
    updateAllLegalMovesAndFindChecks();
    var kingGetsChecked = false;
    if (piece.Color === PieceColor.White && whiteKingIsChecked)
        kingGetsChecked = true;
    if (piece.Color === PieceColor.Black && blackKingIsChecked)
        kingGetsChecked = true;
    // Revert board to former state
    updatePiecePosition(piece, formerCoordinates);
    updateLegalMoves(piece);
    if (destinationPiece !== undefined)
        updatePiecePosition(destinationPiece, destinationPiece.CurrentPosition);
    if (kingGetsChecked) {
        errorAudio.play();
    }
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
            var opponentKing = Board[x][y].Color === PieceColor.White ? blackKing : whiteKing;
            Board[x][y].LegalMoves.forEach(function (legalMove) {
                var _a;
                if (legalMove.X === opponentKing.CurrentPosition.X && legalMove.Y === opponentKing.CurrentPosition.Y) {
                    if (((_a = Board[x][y]) === null || _a === void 0 ? void 0 : _a.Color) === PieceColor.White)
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
        if (isPlayer === false)
            return;
        var colIndex = parseInt(e.path[1].id.replace("col-", "")) - 1;
        var rowIndex = parseInt(e.path[1].getAttribute("row")) - 1;
        var piece = Board[colIndex][rowIndex];
        if (piece == undefined)
            return;
        if (piece.Color === turn) {
            if (playerColor === piece.Color) {
                updateLegalMoves(piece);
                highlightLegalMoves(piece);
                lastTouchedPiece = piece;
            }
        }
    });
    //     // document.addEventListener("drag", (e) => {
    //     //     console.log("drag middle!");
    //     // });
    document.addEventListener("dragend", function (e) {
        if (!isPlayer)
            return;
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
                movePiece(lastTouchedPiece, dropCoordinate, true);
                drawBoard();
            }
            unhighlightLegalMoves(lastTouchedPiece);
        }
    });
}
function eraseChessHTMLElements() {
    for (var x = 0; x <= 7; x++) {
        for (var y = 0; y <= 7; y++) {
            if (Board[x][y] !== undefined) {
                removeVisualCell(Board[x][y].CurrentPosition);
            }
        }
    }
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
    return new Coordinate(colIndex, rowIndex);
}
function destroyPiece(coordinate) {
    if (Board[coordinate.X][coordinate.Y] !== undefined) {
        removeVisualCell(coordinate);
        Board[coordinate.X][coordinate.Y] = undefined;
    }
}
