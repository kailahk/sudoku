/*----- constants -----*/
const cols = [
    [0, 9, 18, 27, 36, 45, 54, 63, 72],
    [1, 10, 19, 28, 37, 46, 55, 64, 73],
    [2, 11, 20, 29, 38, 47, 56, 65, 74],
    [3, 12, 21, 30, 39, 48, 57, 66, 75],
    [4, 13, 22, 31, 40, 49, 58, 67, 76],
    [5, 14, 23, 32, 41, 50, 59, 68, 77],
    [6, 15, 24, 33, 42, 51, 60, 69, 78],
    [7, 16, 25, 34, 43, 52, 61, 70, 79],
    [8, 17, 26, 35, 44, 53, 62, 71, 80]
]

const boxes = [
    [0, 1, 2, 9, 10, 11, 18, 19, 20],
    [3, 4, 5, 12, 13, 14, 21, 22, 23],
    [6, 7, 8, 15, 16, 17, 24, 25, 26],
    [27, 28, 29, 36, 37, 38, 45, 46, 47],
    [30, 31, 32, 39, 40, 41, 48, 49, 50],
    [33, 34, 35, 42, 43, 44, 51, 52, 53],
    [54, 55, 56, 63, 64, 65, 72, 73, 74],
    [57, 58, 59, 66, 67, 68, 75, 76, 77],
    [60, 61, 62, 69, 70, 71, 78, 79, 80]
]


/*----- state variables -----*/
let timer;
let winner;
let keyboardType; // false = normal, true = candidate
let highlightedCell;
let answer = [];
let numsToShow = [];
let boxVals = [];
let columnVals = [];
const board = {};

// code for Sudoku class sourced from: https://www.geeksforgeeks.org/program-sudoku-generator/
class Sudoku {

    constructor(N, K) {
        this.N = N;
        this.K = K;
        const SRNd = Math.sqrt(N);
        this.SRN = Math.floor(SRNd);
        this.mat = Array.from({
            length: N
        }, () => Array.from({
            length: N
        }, () => 0));
    }
    fillValues() {
        this.fillDiagonal();
        this.fillRemaining(0, this.SRN);
    }
    fillDiagonal() {
        for (let i = 0; i < this.N; i += this.SRN) {
            this.fillBox(i, i);
        }
    }
    unUsedInBox(rowStart, colStart, num) {
        for (let i = 0; i < this.SRN; i++) {
            for (let j = 0; j < this.SRN; j++) {
                if (this.mat[rowStart + i][colStart + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }
    fillBox(row, col) {
        let num = 0;
        for (let i = 0; i < this.SRN; i++) {
            for (let j = 0; j < this.SRN; j++) {
                while (true) {
                    num = this.randomGenerator(this.N);
                    if (this.unUsedInBox(row, col, num)) {
                        break;
                    }
                }
                this.mat[row + i][col + j] = num;
            }
        }
    }
    randomGenerator(num) {
        return Math.floor(Math.random() * num + 1);
    }
    checkIfSafe(i, j, num) {
        return (
            this.unUsedInRow(i, num) &&
            this.unUsedInCol(j, num) &&
            this.unUsedInBox(i - (i % this.SRN), j - (j % this.SRN), num)
        );
    }
    unUsedInRow(i, num) {
        for (let j = 0; j < this.N; j++) {
            if (this.mat[i][j] === num) {
                return false;
            }
        }
        return true;
    }
    unUsedInCol(j, num) {
        for (let i = 0; i < this.N; i++) {
            if (this.mat[i][j] === num) {
                return false;
            }
        }
        return true;
    }
    fillRemaining(i, j) {
        if (i === this.N - 1 && j === this.N) {
            return true;
        }
        if (j === this.N) {
            i += 1;
            j = 0;
        }
        if (this.mat[i][j] !== 0) {
            return this.fillRemaining(i, j + 1);
        }
        for (let num = 1; num <= this.N; num++) {
            if (this.checkIfSafe(i, j, num)) {
                this.mat[i][j] = num;
                if (this.fillRemaining(i, j + 1)) {
                    return true;
                }
                this.mat[i][j] = 0;
            }
        }
        return false;
    }

    generateBoard() {
        for (let i = 0; i < this.N; i++) {
            answer.push([...this.mat[i]])
        }
    }

    removeKDigits() {
        let count = this.K;
        while (count !== 0) {
            let i = Math.floor(Math.random() * this.N);
            let j = Math.floor(Math.random() * this.N);
            if (this.mat[i][j] !== 0) {
                count--;
                this.mat[i][j] = 0;
            }
        }
        numsToShow = this.mat
        return;
    }

    initCellObjects() {

    }
}


/*----- cached elements  -----*/
const allCells = document.getElementById('board')
const timerEl = document.getElementById('timer')
const candidateBtnEl = document.getElementById('candidate')
const normalBtnEl = document.getElementById('normal')
const keyboardEls = document.getElementById('keyboard').children
const winningMessage = document.createElement('div')

/*----- event listeners -----*/
allCells.addEventListener('click', handleHighlightCell)
normalBtnEl.addEventListener('click', handleKeyboardSwitch)
candidateBtnEl.addEventListener('click', handleKeyboardSwitch)
for (let i = 0; i < keyboardEls.length; i++) {
    keyboardEls[i].addEventListener('click', handleNumberClick)
}

/*----- functions -----*/
init();

function init() {
    function initBoard() {
        let N = 9
        let K = 40
        let sudoku = new Sudoku(N, K)
        sudoku.fillValues()
        sudoku.generateBoard()
        sudoku.removeKDigits()
        initCellObjects()
    }

    function initCellObjects() {
        let i = 0;
        answer.forEach(function (row, rowIdx) {
            row.forEach(function (boardCell, boardCellIdx) {
                board[`R${rowIdx}C${boardCellIdx}`] = {
                    'value': boardCell,
                    'numToShow': numsToShow[rowIdx][boardCellIdx] === 0 ? 0 : boardCell,
                    'revealed': numsToShow[rowIdx][boardCellIdx] ? true : false,
                    'candidates': [
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false,
                        false
                    ],
                    'row': rowIdx,
                    'conflict': false
                }
                checkColandBox(rowIdx, boardCellIdx, i);
                linkCellToDOM(rowIdx, boardCellIdx)
                i++
            })
        })
    }

    function linkCellToDOM(rowIdx, boardCellIdx) {
        let currCell = document.createElement('div');
        currCell.setAttribute('id', `R${rowIdx}C${boardCellIdx}`);
        currCell.setAttribute('class', 'cell')
        allCells.appendChild(currCell);
        currCell.style.fontSize = '3.5vmin'
        if (rowIdx === 2 || rowIdx === 5) {
            currCell.style.borderBottom = '.5vmin solid grey'
        }
        if (cols[2].includes(boardCellIdx) || cols[5].includes(boardCellIdx)) {
            currCell.style.borderRight = '.5vmin solid grey'
            currCell.style.paddingRight = '.5vmin'
        }
        createCandidateChildren(currCell)
    }

    function createCandidateChildren(currCell) {
        for (let i = 0; i < 9; i++) {
            currCell.appendChild(document.createElement('div'))
        }
        currCell.style.display = 'grid'
        currCell.style.gridTemplateColumns = 'repeat(3, 2vmin)'
        currCell.style.gridTemplateRows = 'repeat(3, 2vmin)'
    }

    function checkColandBox(rowNum, cellNum, id) {
        let currCell = board[`R${rowNum}C${cellNum}`]
        cols.forEach(function (column, colIdx) {
            if (column.includes(id)) {
                currCell['col'] = colIdx;
            }
        });
        boxes.forEach(function (box, boxIdx) {
            if (box.includes(id)) {
                currCell['box'] = boxIdx
            }
        });
    }

    function initTimer() {
        timer = 0;
        timerEl.innerHTML = '00:00'
        timerEl.style.fontSize = '2.5vmin'
        if (timer === 0) {
            resetTimer();
        };
    }

    function initHighlightedCell() {
        for (let j = 0; j < 81; j++) {
            if (board[Object.keys(board)[j]].numToShow === 0) {
                return highlightedCell = Object.keys(board)[j];
            }
        }
    }
    winner = false;
    keyboardType = false;
    initTimer();
    initBoard();
    highlightedCell = initHighlightedCell();
    render();
}

function handleHighlightCell(event) {
    if (event.target.id.length && !board[event.target.id].revealed) {
        highlightedCell = event.target.id;
    }
    if (!event.target.id.length) {
        if (!board[event.target.parentElement.id].revealed) {
            highlightedCell = event.target.parentElement.id;
        }
    }
    render();
}

function handleKeyboardSwitch(event) {
    if (event.target.id === 'normal') {
        keyboardType = false
    }
    if (event.target.id === 'candidate') {
        keyboardType = true
    }
    render();
}

function checkForWinner() {
    winner = true;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (numsToShow[i][j] !== answer[i][j]) {
                winner = false
            }
        }
    }
}

function handleNumberClick(event) {
    let currRow = board[highlightedCell].row
    let currCol = board[highlightedCell].col
    let currCell = board[highlightedCell]
    if (currCell.conflict) {
        currCell.conflict = false
        removeAllConflicts(currRow, currCol)
    }
    boxVals = []
    columnVals = []
    if (event.target.innerHTML === 'X') {
        if (currCell.numToShow === 0) {
            currCell.candidates = [false, false, false, false, false, false, false, false, false]
        } else {
            currCell.numToShow = 0
            numsToShow[currRow][currCol] = 0
        }
    } else {
        if (!keyboardType) {
            currCell.numToShow = parseInt(event.target.innerHTML) ? parseInt(event.target.innerHTML) : 0
            numsToShow[currRow][currCol] = parseInt(event.target.innerHTML) ? parseInt(event.target.innerHTML) : 0
        } else {
            if (currCell.candidates[event.target.innerHTML - 1]) {
                if (currCell.numToShow === 0) {
                    currCell.candidates[event.target.innerHTML - 1] = false
                } else {
                    currCell.numToShow = 0
                    numsToShow[currRow][currCol] = 0
                }
            } else {
                currCell.candidates[event.target.innerHTML - 1] = true;
                currCell.numToShow = 0
                numsToShow[currRow][currCol] = 0
            }
        }
    }
    numsToShow.forEach((row, idx1) => {
        row.forEach((num, idx2) => {
            if (columnVals[idx2]) {
                columnVals[idx2].push(num)
            } else {
                columnVals[idx2] = [num]
            }
            if (idx1 < 3) {
                if (idx2 < 3) {
                    boxVals[0] ? boxVals[0].push(num) : boxVals[0] = [num]
                } else if (idx2 < 6) {
                    boxVals[1] ? boxVals[1].push(num) : boxVals[1] = [num]
                } else if (idx2 < 9) {
                    boxVals[2] ? boxVals[2].push(num) : boxVals[2] = [num]
                }
            } else if (idx1 < 6) {
                if (idx2 < 3) {
                    boxVals[3] ? boxVals[3].push(num) : boxVals[3] = [num]
                } else if (idx2 < 6) {
                    boxVals[4] ? boxVals[4].push(num) : boxVals[4] = [num]
                } else if (idx2 < 9) {
                    boxVals[5] ? boxVals[5].push(num) : boxVals[5] = [num]
                }
            } else if (idx1 < 9) {
                if (idx2 < 3) {
                    boxVals[6] ? boxVals[6].push(num) : boxVals[6] = [num]
                } else if (idx2 < 6) {
                    boxVals[7] ? boxVals[7].push(num) : boxVals[7] = [num]
                } else if (idx2 < 9) {
                    boxVals[8] ? boxVals[8].push(num) : boxVals[8] = [num]
                }
            }
        })
    })
    markConflicts()

    function markConflicts() {
        numsToShow.forEach((row, idx1) => {
            let countOfEachNum = {}
            row.forEach((num, idx2) => {
                countOfEachNum[num] ? countOfEachNum[num]++ : countOfEachNum[num] = 1
            })
            for (let i = 1; i < Object.entries(countOfEachNum).length; i++) {
                if (Object.entries(countOfEachNum)[i][1] > 1) {
                    row.forEach((num, idx3) => {
                        let currCell = board[`R${idx1}C${idx3}`]
                        if (num === parseInt(Object.entries(countOfEachNum)[i][0])) {
                            currCell.conflict = true
                        }
                    })
                }
            }
        })
        columnVals.forEach((column, idx4) => {
            let countOfEachNum = {}
            column.forEach((num, idx5) => {
                countOfEachNum[num] ? countOfEachNum[num]++ : countOfEachNum[num] = 1
            })
            for (let i = 1; i < Object.entries(countOfEachNum).length; i++) {
                if (Object.entries(countOfEachNum)[i][1] > 1) {
                    column.forEach((num, idx6) => {
                        currCell = board[`R${idx6}C${idx4}`]
                        if (num === parseInt(Object.entries(countOfEachNum)[i][0])) {
                            currCell.conflict = true
                        }
                    })
                }
            }
        })
        boxVals.forEach((box, idx7) => {
            let countOfEachNum = {}
            box.forEach((num, idx8) => {
                countOfEachNum[num] ? countOfEachNum[num]++ : countOfEachNum[num] = 1
            })
            for (let i = 1; i < Object.entries(countOfEachNum).length; i++) {
                if (Object.entries(countOfEachNum)[i][1] > 1) {
                    box.forEach((num, idx9) => {
                        let column;
                        let row;
                        if (idx7 < 3) {
                            row = Math.floor(idx9 / 3)
                        } else if (idx7 < 6) {
                            row = Math.floor(idx9 / 3) + 3
                        } else if (idx7 < 9) {
                            row = Math.floor(idx9 / 3) + 6
                        }
                        if (idx9 === 0 || idx9 === 3 || idx9 === 6) {
                            if (idx7 === 0 || idx7 === 3 || idx7 === 6) {
                                column = 0
                            }
                            if (idx7 === 1 || idx7 === 4 || idx7 === 7) {
                                column = 3
                            }
                            if (idx7 === 2 || idx7 === 5 || idx7 === 8) {
                                column = 6
                            }
                        }
                        if (idx9 === 1 || idx9 === 4 || idx9 === 7) {
                            if (idx7 === 0 || idx7 === 3 || idx7 === 6) {
                                column = 1
                            }
                            if (idx7 === 1 || idx7 === 4 || idx7 === 7) {
                                column = 4
                            }
                            if (idx7 === 2 || idx7 === 5 || idx7 === 8) {
                                column = 7
                            }
                        }
                        if (idx9 === 2 || idx9 === 5 || idx9 === 8) {
                            if (idx7 === 0 || idx7 === 3 || idx7 === 6) {
                                column = 2
                            }
                            if (idx7 === 1 || idx7 === 4 || idx7 === 7) {
                                column = 5
                            }
                            if (idx7 === 2 || idx7 === 5 || idx7 === 8) {
                                column = 8
                            }
                        }
                        currCell = board[`R${row}C${column}`]
                        if (num === parseInt(Object.entries(countOfEachNum)[i][0])) {
                            currCell.conflict = true
                        }
                    })
                }
            }
        })
    }

    function removeAllConflicts(currRow, currCol) {
        numsToShow[currRow].forEach((num, idx) => {
            if (num === board[highlightedCell].numToShow) {
                board[`R${currRow}C${idx}`].conflict = false
            }
        })
        columnVals[currCol].forEach((num, idx) => {
            if (num === board[highlightedCell].numToShow) {
                board[`R${idx}C${currCol}`].conflict = false
            }
        })
        let box = board[highlightedCell].box
        boxVals[box].forEach((num, idx) => {
            if (num === board[highlightedCell].numToShow) {
                let column;
                let row;
                if (box < 3) {
                    row = Math.floor(idx / 3)
                } else if (box < 6) {
                    row = Math.floor(idx / 3) + 3
                } else if (box < 9) {
                    row = Math.floor(idx / 3) + 6
                }
                if (idx === 0 || idx === 3 || idx === 6) {
                    if (box === 0 || box === 3 || box === 6) {
                        column = 0
                    }
                    if (box === 1 || box === 4 || box === 7) {
                        column = 3
                    }
                    if (box === 2 || box === 5 || box === 8) {
                        column = 6
                    }
                }
                if (idx === 1 || idx === 4 || idx === 7) {
                    if (box === 0 || box === 3 || box === 6) {
                        column = 1
                    }
                    if (box === 1 || box === 4 || box === 7) {
                        column = 4
                    }
                    if (box === 2 || box === 5 || box === 8) {
                        column = 7
                    }
                }
                if (idx === 2 || idx === 5 || idx === 8) {
                    if (box === 0 || box === 3 || box === 6) {
                        column = 2
                    }
                    if (box === 1 || box === 4 || box === 7) {
                        column = 5
                    }
                    if (box === 2 || box === 5 || box === 8) {
                        column = 8
                    }
                }
                let currCell = board[`R${row}C${column}`]
                currCell.conflict = false
            }
        })
    }
    checkForWinner();
    render();
}

function resetTimer() {
    function updateTime() {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        timer++;
        if (minutes.toString().length < 2) {
            minutes = `0${minutes}`
        }
        if (seconds.toString().length < 2) {
            seconds = `0${seconds}`
        }
        timerEl.innerHTML = `${minutes}:${seconds}`;
        timerEl.style.fontSize = `2.5vmin`;
        if (winner) {
            clearInterval(clock);
            renderWinner();
        }
    }
    let clock = setInterval(updateTime, 1000);
}

function render() {
    renderBoard();
    renderKeyboard();

    function renderBoard() {
        for (let i = 0; i < 81; i++) {
            let currCellName = Object.keys(board)[i]
            let currCellObj = board[currCellName]
            let currCell = document.getElementById(currCellName)
            if (currCellObj.numToShow !== 0) {
                currCell.children[4].innerHTML = currCellObj.numToShow;
                currCell.children[0].style.visibility = 'hidden'
                currCell.children[1].style.visibility = 'hidden'
                currCell.children[2].style.visibility = 'hidden'
                currCell.children[3].style.visibility = 'hidden'
                currCell.children[5].style.visibility = 'hidden'
                currCell.children[6].style.visibility = 'hidden'
                currCell.children[7].style.visibility = 'hidden'
                currCell.children[8].style.visibility = 'hidden'
                if (currCellObj.revealed) {
                    currCell.style.backgroundColor = 'rgb(232,232,232)';
                } else {
                    currCell.style.fontSize = '3.5vmin'
                }
            }
            if (currCellObj.numToShow === 0) {
                renderCandidates(currCellObj, currCell)
            }
            if (!currCellObj.revealed) {
                currCell.style.backgroundColor = 'white'
            }
            if (currCellObj.conflict) {
                currCell.children[8].style.backgroundColor = 'red'
                currCell.children[8].style.height = '1vmin'
                currCell.children[8].style.width = '1vmin'
                currCell.children[8].style.borderRadius = '50%'
                currCell.children[8].style.border = 'none'
                currCell.children[8].style.marginLeft = '.5vmin'
                currCell.children[8].style.visibility = 'visible'
                currCell.children[8].innerHTML = ' '
            } else {
                currCell.children[8].style.backgroundColor = 'inherit'
                currCell.children[8].style.marginLeft = '0'
                currCell.children[8].style.borderRight = '.1vmin solid grey'
                currCell.children[8].style.borderRadius = ' '
            }
            document.getElementById(highlightedCell).style.backgroundColor = 'gold'
        }
    }

    function renderCandidates(currCellObj, currCell) {
        currCellObj.candidates.forEach((candidate, idx) => {
            if (candidate) {
                currCell.children[idx].innerHTML = idx + 1
                currCell.children[idx].style.visibility = 'visible'
            } else {
                currCell.children[idx].innerHTML = ' '
            }
            currCell.style.fontSize = '1vmin'
        })
    }


    function renderKeyboard() {
        if (keyboardType) {
            candidateBtnEl.style.backgroundColor = 'black';
            candidateBtnEl.style.color = 'white';
            candidateBtnEl.style.borderColor = 'black'
            normalBtnEl.style.backgroundColor = 'white';
            normalBtnEl.style.color = 'lightgrey';
            normalBtnEl.style.borderColor = 'lightgrey';
            for (let i = 0; i < keyboardEls.length - 1; i++) {
                keyboardEls[i].style.fontSize = '1.3vmin';
                keyboardEls[i].style.height = '5vmin';
            }
        } else {
            candidateBtnEl.style.backgroundColor = 'white';
            candidateBtnEl.style.color = 'lightgrey';
            candidateBtnEl.style.borderColor = 'lightgrey'
            normalBtnEl.style.backgroundColor = 'black';
            normalBtnEl.style.color = 'white';
            normalBtnEl.style.borderColor = 'black'
            for (let i = 0; i < keyboardEls.length; i++) {
                keyboardEls[i].style.fontSize = '2vmin';
            }
        }
    }
}

function renderWinner() {
    allCells.removeEventListener('click', handleHighlightCell)
    candidateBtnEl.removeEventListener('click', handleKeyboardSwitch)
    normalBtnEl.removeEventListener('click', handleKeyboardSwitch)
    let collectionOfBtns = [...document.getElementsByClassName('rounded')]
    collectionOfBtns.forEach((button) => {
        button.setAttribute('disabled', true)
    })
    winningMessage.innerHTML = `<h2>Congratulations!</h2><p>You won Sudoku in ${timerEl.innerHTML}</p><button id="button">PLAY AGAIN</button>`
    winningMessage.style.backgroundColor = 'white'
    winningMessage.style.height = '25vmin'
    winningMessage.style.width = '40vmin'
    winningMessage.style.padding = '5vmin'
    winningMessage.style.border = '.5vmin solid grey'
    winningMessage.style.display = 'flex'
    winningMessage.style.flexDirection = 'column'
    winningMessage.style.justifyContent = 'center'
    winningMessage.style.alignItems = 'center'
    winningMessage.style.position = 'absolute'
    winningMessage.style.margin = '10vmin 0 0 1.6vmin'
    allCells.appendChild(winningMessage)
    let buttonEl = document.getElementById('button')
    buttonEl.style.backgroundColor = 'black'
    buttonEl.style.borderRadius = '5vmin'
    buttonEl.style.border = 'none'
    buttonEl.style.padding = '1vmin 2vmin'
    buttonEl.style.color = 'white'
    buttonEl.style.fontSize = '2.5vmin'
    buttonEl.style.marginBottom = '2.5vmin'
}

