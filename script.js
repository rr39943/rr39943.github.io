/* Constants */
const START_TIMER = 45;
const NB_CALCULATIONS = 20;
const PENALTY_SEC = 5;
const BONUS_SEC = 5;
const A_LOWEST = 2;
const A_HIGHEST = 12;
const B_LOWEST = 2;
const B_HIGHEST = 12;
const OP_POSSIBLE = ['x'];

var calculations
var timer
var timerStopped
var penalty



function validateCalculation(calculation){
	// if ((0 < calculation['a'] - calculation['b']) && (calculation['a'] - calculation['b'] < 10)) {
	if ([2, 3, 4, 5, 6, 10].includes(calculation['b'])){
		return true;}
}

function generateCalculation(){
	var a = getRandomNumber(A_LOWEST, A_HIGHEST);
	var b = getRandomNumber(B_LOWEST, B_HIGHEST);
	var op = OP_POSSIBLE[getRandomNumber(0, OP_POSSIBLE.length - 1)];
	if (op === '+') {
		var result = a + b;
	} else if (op === '-') {
		var result = a - b;
	} else if (op == 'x') {
		var result = a * b;
	}
	let calculation = {a: a,
						b: b,
						op: op,
						result};
	return calculation;
}

function generateValidCalculation(){
	var calculation = generateCalculation();
	while (!validateCalculation(calculation)){
		var calculation = generateCalculation();
	}
	return calculation;
}

function getRandomNumber(lowest, highest){
	return lowest + Math.floor(Math.random() * (highest-lowest + 1));
}

function waitingKeypress() {
  return new Promise((resolve) => {
    $(document).on('keyup', onKeyHandler);
    function onKeyHandler(e) {
       $(document).off('keyup', onKeyHandler);
       resolve();
      
    }
  });
}

function startGame(){
	timer = START_TIMER;
	timerStopped = false;
	penalty = 0;
	calculations = [];
	displayTimer();
	$('#pressKeyMsg').show()
	waitingKeypress().then(() => {
		$('#message').empty()
		$('#pressKeyMsg').hide()
		updateProgressBar();
		startTimer();
		manageGame();
		});
	
}

function manageGame(){
	if (timer === 0) {
		loseGame();
	}
	else if (calculations.length < NB_CALCULATIONS) {
		var calculation = generateValidCalculation();
		calculations.push(calculation)
		createForm(calculation);
	} else {
		winGame();
	}
}

function winGame(){
	$('#message').addClass('success').removeClass('failed').html('Gagné&nbsp;!');
	endGame()
}

function loseGame(){
	$('#message').addClass('failed').removeClass('success').html('Perdu&nbsp;!');
	endGame()

}

function endGame(){
	timerStopped = true;
	$('#calc').prop('disabled', true);
	setTimeout(() => (startGame()), 2000);
}


function createForm(calculation){
	var calc_text = `<form onsubmit="return checkResult(${calculation['result']})" action="javascript:void(0);"><label for="calc">${calculation['a']} ${calculation['op']} ${calculation['b']}&nbsp;=&nbsp;</label><input type="text" id="calc" maxlength="3"></form>`
	$('#calculation').html(calc_text);
	$('#calc').focus()
	$('#calc').select()
	$('#calc').val('')
}

function checkResult(result){
	if (timerStopped){
		return
	}
	var response = $('#calc').val();
	if (response === result.toString()) {
		$('#feedback').text(' ✓').addClass('success').removeClass('failed').show();
		setTimeout(() => {$('#feedback').fadeOut("slow")}, 1000);
		if (penalty < 0) {
			penalty = 0;
		}
		penalty -= BONUS_SEC;
		if (penalty < -BONUS_SEC) {
			penalty = -BONUS_SEC
		}
		updateProgressBar();
		manageGame();
	} else {
		penalty += PENALTY_SEC;
		$('#feedback').text(' X').addClass('failed').removeClass('success').show();
		setTimeout(() => {$('#feedback').fadeOut("slow")}, 1000);
		
	}
}

function updateProgressBar() {
	let newWidth = 400 / NB_CALCULATIONS * calculations.length;
	$('#nbSolvedCalcs').css('width', newWidth);
}

function startTimer(t = 1000){
	displayTimer();
	setTimeout(manageTimer, t);
}

function displayTimer(){
	let seconds = (timer % 60).toString();
	if (seconds.length === 1) {
		seconds = '0' + seconds;
	}
	let minutes = Math.trunc(timer / 60);
	let txtTimer = `${minutes}:${seconds}`;
	$('#timer').html(txtTimer);
	if (penalty < 0) {
		$('#timer').css('color', 'green');
	}
	else if ((penalty > 0) | (timer < 10)) {
		$('#timer').css('color', 'red');
	} else {
		$('#timer').css('color', 'white');
	}
	$('#timer')
}

function manageTimer(){
	if (timerStopped){
		return;
	}
	if (penalty >= 0) {
		timer--;
	} else {
		penalty++;
	}
	if (timer < 0) {
		timer = 0;
	}
	if (penalty > 0){
		var t = 200;
		penalty--;
	} else {
		var t = 1000;
	}
	displayTimer()

	if (timer > 0){
		startTimer(t);
	} else {
		manageGame();
	}
}