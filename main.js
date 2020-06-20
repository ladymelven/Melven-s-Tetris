document.addEventListener('DOMContentLoaded', () => {
// Setting up the field
	const grid = document.querySelector('.grid');
	let cells = Array.from(document.querySelectorAll('.grid div'));
	const startButton = document.getElementById('start-button');
	const newGameButton = document.getElementById('new-game-button');
	const scoreDisplay = document.getElementById('score');
	const displayLevel = document.querySelector('#level');
	const width = 20;
	const colors = ['rgb(218,140,240)',
		'rgb(206,251,143)',
		'rgb(255,240,145)',
		'rgb(248,183,212)',
		'rgb(146,181,240)'
	];

	let score = 0;
	let timer;
	let currentLevel = 1;
// Setting the Next-up field

	const smallWidth = 4;
	const smallCells = Array.from(document.querySelectorAll('.next-up div'));
	let nextUpIndex = 0;
	let nextRandomTetromino = 0;

// Set Tetrominoes

	const iTetromino = [
		[1, width + 1, 2 * width + 1, 3 * width + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, 2 * width + 1, 3 * width + 1],
		[width, width + 1, width + 2, width + 3]
	];

	const oTetromino = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1]
	];

	const lTetromino = [
		[0, width, 2 * width, 2 * width + 1],
		[width, width + 1, 2, width + 2],
		[0, 1, width + 1, 2 * width + 1],
		[0, width, 1, 2]
	];

	const zTetromino = [
		[0, width, width + 1, 2 * width + 1],
		[width, 1, width + 1, 2],
		[0, width, width + 1, 2 * width + 1],
		[width, 1, width + 1, 2]
	];

	const tTetromino = [
		[0, 1, width + 1, 2],
		[0, width, 2 * width, width + 1],
		[width, 1, width + 1, width + 2],
		[width, 1, width + 1, 2 * width + 1]
	];

	const theTetrominoes = [iTetromino, oTetromino, lTetromino, zTetromino, tTetromino];

	// generate a previewed Tetromino, randomly generate its first position and rotation

	let randomTetromino = 0;
	let currentRotation = Math.floor(Math.random() *
	theTetrominoes[randomTetromino].length);
	let current = theTetrominoes[randomTetromino][currentRotation];
	let currentPosition = Math.floor(Math.random() * (width - 4));

	function drawTetromino () {
		current.forEach(index => {
			cells[index + currentPosition].classList.add('tetromino');
			cells[index + currentPosition].style.backgroundColor = colors[randomTetromino];
		});
	};

	function undrawTetromino () {
		current.forEach(index => {
			cells[index + currentPosition].classList.remove('tetromino');
			cells[index + currentPosition].style.backgroundColor = '';
		});
	};

	// Making Tetrominoes move down

	// freeze timer function
	function freeze () {
		if (current.some(
			index => cells[index + currentPosition + width].classList.contains('taken'))) {
			current.forEach(index => cells[index + currentPosition].classList.add('taken'));
			// make a new one
			randomTetromino = nextRandomTetromino;
			nextRandomTetromino = Math.floor(Math.random() * theTetrominoes.length);
			currentRotation = Math.floor(Math.random() * theTetrominoes[0].length);
			current = theTetrominoes[randomTetromino][currentRotation];
			currentPosition = Math.floor(Math.random() * (width - 4));
			drawTetromino();
			displayNextUp();
			addScore();
			// levelUp();
			gameOver();
		}
	};

	function moveDown () {
		undrawTetromino();
		currentPosition += width;
		drawTetromino();
		freeze();
	};

	// Moving Tetrominoes

// move left, unless at the edge or next to a blockage
	function moveLeft () {
		undrawTetromino();
		const isAtLeft = current.some(index => Number.isInteger((index + currentPosition) / width));
		if (!isAtLeft) { currentPosition -= 1; };
		if (current.some(index => cells[index + currentPosition].classList.contains('taken'))) {
			currentPosition += 1;
		};
		drawTetromino();
	};

// move Right, unless at the edge or next to a blockage
	function moveRight () {
		undrawTetromino();
		const isAtRight = current.some(index => (Number.isInteger((index + currentPosition + 1) / width)));
		if (!isAtRight) { currentPosition += 1; };
		if (current.some(index => cells[index + currentPosition].classList.contains('taken'))) {
			currentPosition -= 1;
		};
		drawTetromino();
	};

	function rotate () {
		undrawTetromino();
		currentRotation++;
		if (currentRotation === current.length) {
			currentRotation = 0;
		};
		current = theTetrominoes[randomTetromino][currentRotation];
		// fix rotation at the edges
		while (current.some(
			index => Number.isInteger((index + currentPosition) / width)) &&
			current.some(
				index => Number.isInteger((index + currentPosition + 1) / width))) {
			if (randomTetromino === 0) { // iTetromino can get split at both edges
				if (current.some(
					index => Number.isInteger((index + currentPosition + 2) / width))) {
					currentPosition -= 1;
				} else {
					currentPosition += 1;
				}
			} else {
				currentPosition -= 1;
			}
		}
		drawTetromino();
	};

	// Assign functions to keyCodes

	function control (ev) {
		if (ev.keyCode === 37) {
			moveLeft();
		} else if (ev.keyCode === 39) {
			moveRight();
		} else if (ev.keyCode === 40) {
			moveDown();
		} else if (ev.keyCode === 38) {
			rotate();
		}
	};

	document.addEventListener('keydown', control);

	// Display of next-up Tetromino

	const nextUp = [
		[1, smallWidth + 1, 2 * smallWidth + 1, 3 * smallWidth + 1], // iTetromino
		[1, 2, smallWidth + 1, smallWidth + 2], // oTetromino
		[1, smallWidth + 1, 2 * smallWidth + 1, 2 * smallWidth + 2], // lTetromino
		[1, smallWidth + 1, smallWidth + 2, 2 * smallWidth + 2], // zTetromino
		[smallWidth, 1, smallWidth + 1, smallWidth + 2] // tTetromino
	];

	function displayNextUp () {
		// clear up the field
		smallCells.forEach(cell => {
			cell.classList.remove('tetromino');
			cell.style.backgroundColor = '';
		});
		// displaying the next Tetromino and lnking it to the main field
		nextUp[nextRandomTetromino].forEach(index => {
			smallCells[index + nextUpIndex].classList.add('tetromino');
			smallCells[index + nextUpIndex].style.backgroundColor =
			colors[nextRandomTetromino];
		});
	}

// activate Start/Pause button

	let speed = 500;

	startButton.addEventListener('click', () => {
		if (timer) {
			clearInterval(timer);
			timer = null;
		} else {
			drawTetromino();
			timer = setInterval(moveDown, speed);
			nextRandomTetromino = Math.floor(Math.random() * theTetrominoes.length);
			displayNextUp();
		}
		console.log(`speed ${speed}, timer ${timer}`);
	});

// Add score and remove stacked rows

	function addScore () {
		for (let i = 0; i < (cells.length - 20); i += width) {
			const row =
				[i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9, i + 10,
					i + 11, i + 12, i + 13, i + 14, i + 15, i + 16, i + 17, i + 18, i + 19];
			if (row.every(index => cells[index].classList.contains('taken'))) {
				score += width;
				if (score && Number.isInteger(score / 60)) {
					levelUp();
				}
				scoreDisplay.innerHTML = score;
				row.forEach(index => {
					cells[index].classList.remove('taken');
					cells[index].classList.remove('tetromino');
					cells[index].style.backgroundColor = '';
				});
				const removeCells = cells.splice(i, width);
				cells = removeCells.concat(cells);
				cells.forEach(cell => grid.appendChild(cell));
			};
		};
	};

// Game over

	function gameOver () {
		if (current.some(index => cells[index + currentPosition].classList.contains('taken'))) {
			clearInterval(timer);
			scoreDisplay.innerHTML = 'Game Over';
			document.removeEventListener('keydown', control);
			startButton.disabled = 'true';
		}
	};

	// New Game

	newGameButton.addEventListener('click', () => {
		clearInterval(timer);
		timer = null;
		cells.slice(0, 600).forEach(cell => {
			cell.classList.remove('tetromino');
			cell.classList.remove('taken');
			cell.style.background = '';
			smallCells.forEach(cell => {
				cell.classList.remove('tetromino');
				cell.style.backgroundColor = '';
			});
		}
	);
		currentLevel = 1;
		score = 0;
		speed = 500;
		displayLevel.innerHTML = currentLevel;
		scoreDisplay.innerHTML = score;
		document.removeEventListener('keydown', control);
		document.addEventListener('keydown', control);
		startButton.disabled = false;
	});

// Level up

	function levelUp () {
		currentLevel++;
		displayLevel.innerHTML = currentLevel;
		// score = 0;
		// scoreDisplay.innerHTML = score;
		speed /= 1.5;
		startButton.click();
		startButton.click();
	}
});
