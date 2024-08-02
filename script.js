/* Constants */
const START_TIMER = 150;
const NB_CALCULATIONS = 25;
const PENALTY_SEC = 10;
const BONUS_SEC = 2;
const A_LOWEST = 5;
const A_HIGHEST = 10;
const B_LOWEST = 5;
const B_HIGHEST = 10;
const OP_POSSIBLE = ['-', '+'];

var calculations
var timer
var timerStopped
var penalty



function validateCalculation(calculation){
	if ((0 < calculation['a'] - calculation['b']) && (calculation['a'] - calculation['b'] < 10)) {
		return true;
	}
	else{
		return false
	}
}

function generateCalculation(){
	var a = getRandomNumber(A_LOWEST, A_HIGHEST);
	var b = getRandomNumber(B_LOWEST, B_HIGHEST);
	var op = OP_POSSIBLE[getRandomNumber(0, OP_POSSIBLE.length - 1)];
	if (op === '+') {
		var result = a + b;
	} else if (op === '-') {
		var result = a - b;
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
		setTimeout(()0 => {$('#feedback').fadeOut("slow")}, 1000);
		timer += BONUS_SEC
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
}

function manageTimer(){
	if (timerStopped){
		return;
	}
	timer--
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