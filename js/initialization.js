$(document).ready(function() {
	initialize();
});
function initialize(a) {
	window.rush = 1;
	window.lastTime = Date.now();
	window.iframHasLoaded = false;
	window.colors = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71"];
	window.hexColorsToTintedColors = {
		"#e74c3c": "rgb(241,163,155)",
		"#f1c40f": "rgb(246,223,133)",
		"#3498db": "rgb(151,201,235)",
		"#2ecc71": "rgb(150,227,183)"
	};

	window.rgbToHex = {
		"rgb(231,76,60)": "#e74c3c",
		"rgb(241,196,15)": "#f1c40f",
		"rgb(52,152,219)": "#3498db",
		"rgb(46,204,113)": "#2ecc71"
	};

	window.rgbColorsToTintedColors = {
		"rgb(231,76,60)": "rgb(241,163,155)",
		"rgb(241,196,15)": "rgb(246,223,133)",
		"rgb(52,152,219)": "rgb(151,201,235)",
		"rgb(46,204,113)": "rgb(150,227,183)"
	};

	window.hexagonBackgroundColor = 'rgb(236, 240, 241)';
	window.hexagonBackgroundColorClear = 'rgba(236, 240, 241, 0.5)';
	window.centerBlue = 'rgb(44,62,80)';
	window.angularVelocityConst = 4;
	window.scoreOpacity = 0;
	window.textOpacity = 0;
	window.prevGameState = undefined;
	window.op = 0;
	window.saveState = localStorage.getItem("saveState") || "{}";
	if (saveState !== "{}") {
		op = 1;
	}

	window.textShown = false;
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / framerate);
		};
	})();
	$('#clickToExit').bind('click', toggleDevTools);
	window.settings;
	if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        $('.rrssb-email').remove();
		settings = {
			os: "other",
			platform: "mobile",
			startDist: 227,
			creationDt: 60,
			baseScale: 1.4,
			scale: 1,
			prevScale: 1,
			baseHexWidth: 87,
			hexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 20,
			rows: 7,
			speedModifier: 0.73,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.73,
			comboTime: 310
		};
	} else {
		settings = {
			os: "other",
			platform: "nonmobile",
			baseScale: 1,
			startDist: 340,
			creationDt: 9,
			scale: 1,
			prevScale: 1,
			hexWidth: 65,
			baseHexWidth: 87,
			baseBlockHeight: 20,
			blockHeight: 15,
			rows: 8,
			speedModifier: 0.65,
			speedUpKeyHeld: false,
			creationSpeedModifier: 0.65,
			comboTime: 310
		};

	}
	if(/Android/i.test(navigator.userAgent)) {
		settings.os = "android";
	}

	if(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)){
		settings.os="ios";
	}

	window.canvas = document.getElementById('canvas');
	window.ctx = canvas.getContext('2d');
	window.trueCanvas = {
		width: canvas.width,
		height: canvas.height
	};
	scaleCanvas();

	window.framerate = 60;
	window.history = {};
	window.score = 0;
	window.scoreAdditionCoeff = 1;
	window.prevScore = 0;
	window.numHighScores = 3;

	highscores = [];
	if (localStorage.getItem('highscores')) {
		try {
			highscores = JSON.parse(localStorage.getItem('highscores'));
		} catch (e) {
			highscores = [];
		}
	}
	// level progress saved in localStorage, default only level 1 unlocked
	window.currentLevel = 1;
	window.maxUnlockedLevel = parseInt(localStorage.getItem('maxUnlockedLevel')) || 1;
	window.blocks = [];
	// progress for bar (stays full green after 200 until '1' pressed; resets every 200)
	window.progressCounter = 0;
	window.barFull = false;
	window.MainHex;
	window.gdx = 0;
	window.gdy = 0;
	window.devMode = 0;
	window.lastGen = undefined;
	window.prevTimeScored = undefined;
	window.nextGen = undefined;
	window.spawnLane = 0;
	window.importing = 0;
	window.importedHistory = undefined;
	window.startTime = undefined;
	window.gameState;
	showWelcome();
	if (a != 1) {
		window.canRestart = 1;
		window.onblur = function(e) {
			if (gameState == 1) {
				pause();
			}
		};
		$('#startBtn').off().hide();
		if (settings.platform == 'mobile') {
			$('#startBtn').on('touchstart', startBtnHandler);
		} else {
			$('#startBtn').on('mousedown', startBtnHandler);
		}

		document.addEventListener('touchmove', function(e) {
			e.preventDefault();
		}, false);
		$(window).resize(scaleCanvas);
		$(window).unload(function() {

			if (gameState == 1 || gameState == -1 || gameState === 0) localStorage.setItem("saveState", exportSaveState());
			else localStorage.setItem("saveState", "{}");
		});

		addKeyListeners();
		(function(i, s, o, g, r, a, m) {
			i['GoogleAnalyticsObject'] = r;
			i[r] = i[r] || function() {
				(i[r].q = i[r].q || []).push(arguments)
			}, i[r].l = 1 * new Date();
			a = s.createElement(o), m = s.getElementsByTagName(o)[0];
			a.async = 1;
			a.src = g;
			m.parentNode.insertBefore(a, m)
		})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
		ga('create', 'UA-51272720-1', 'teamsnowman.github.io');
		ga('send', 'pageview');

		document.addEventListener("pause", handlePause, false);
		document.addEventListener("backbutton", handlePause, false);
		document.addEventListener("menubutton", handlePause, false); //menu button on android

		$('#welcomeStartBtn').off().on('click', function() {
			showLevels();
		});
		$('#backToWelcomeBtn').off().on('click', function() {
			showWelcome();
		});
		// complete screen buttons
		$('#nextLevelBtn').off().on('click', nextLevel);
		$('#replayLevelBtn').off().on('click', replayLevel);

		setTimeout(function() {
			if (settings.platform == "mobile") {
				try {
					document.body.removeEventListener('touchstart', handleTapBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('touchstart', handleTap, false);
				} catch (e) {

				}

				document.body.addEventListener('touchstart', handleTapBefore, false);
			} else {
				try {
					document.body.removeEventListener('mousedown', handleClickBefore, false);
				} catch (e) {

				}

				try {
					document.body.removeEventListener('mousedown', handleClick, false);
				} catch (e) {

				}

				document.body.addEventListener('mousedown', handleClickBefore, false);
			}
		}, 1);
	}
}

function startBtnHandler() {
	setTimeout(function() {
		if (settings.platform == "mobile") {
			try {
				document.body.removeEventListener('touchstart', handleTapBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('touchstart', handleTap, false);
			} catch (e) {

			}

			document.body.addEventListener('touchstart', handleTap, false);
		} else {
			try {
				document.body.removeEventListener('mousedown', handleClickBefore, false);
			} catch (e) {

			}

			try {
				document.body.removeEventListener('mousedown', handleClick, false);
			} catch (e) {

			}

			document.body.addEventListener('mousedown', handleClick, false);
		}
	}, 5);

	if (!canRestart) return false;

	if ($('#openSideBar').is(':visible')) {
		$('#openSideBar').fadeOut(150, "linear");
	}

	if (importing == 1) {
		init(1);
		checkVisualElements(0);
	} else {
		resumeGame();
	}
}

function handlePause() {
	if (gameState == 1 || gameState == 2) {
		pause();
	}
}

function handleTap(e) {
	handleClickTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}

function handleClick(e) {
	handleClickTap(e.clientX, e.clientY);
}

function handleTapBefore(e) {
	var x = e.changedTouches[0].clientX;
	var y = e.changedTouches[0].clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}

function handleClickBefore(e) {
	var x = e.clientX;
	var y = e.clientY;

	if (x < 120 && y < 83 && $('.helpText').is(':visible')) {
		showHelp();
		return;
	}
}

function getLevelTarget(level) {
	return 250 * (level + 1);
}

function saveLevelProgress() {
	localStorage.setItem('maxUnlockedLevel', maxUnlockedLevel);
}

function renderLevelsList() {
	var list = $('#levelsList');
	list.empty();
	for(var i = 1; i <= 100; i++) {
		var item = $('<div class="level-item">' + i + '</div>');
		if (i > maxUnlockedLevel) {
			item.addClass('locked');
		} else {
			item.on('click', (function(lvl) {
				return function() {
					startLevel(lvl);
				};
			})(i));
		}
		list.append(item);
	}
	list.scrollTop(0);
}

function showWelcome() {
	hideAllScreens();
	$('#welcomeScreen').fadeIn(150, "linear");
	$('#startBtn').hide();
	init();
	gameState = 0;
	requestAnimFrame(animLoop);
}

function showLevels() {
	hideAllScreens();
	$('#levelsScreen').fadeIn(150, "linear");
	renderLevelsList();
	gameState = 0;
	requestAnimFrame(animLoop);
}

function hideAllScreens() {
	$('#welcomeScreen').fadeOut(150);
	$('#levelsScreen').fadeOut(150);
	$('#helpScreen').fadeOut(150);
	$('#gameoverscreen').fadeOut(150);
	$('#levelCompleteScreen').fadeOut(150);
	$('#overlay').fadeOut(150);
	$('#buttonCont').fadeOut(150);
	$('.helpText').fadeOut(150);
	updateLevelDisplay(false);
}

function startLevel(level) {
	currentLevel = level;
	hideAllScreens();
	setTimeout(function() {
		if (settings.platform == "mobile") {
			try {
				document.body.removeEventListener('touchstart', handleTapBefore, false);
			} catch (e) {}
			try {
				document.body.removeEventListener('touchstart', handleTap, false);
			} catch (e) {}
			document.body.addEventListener('touchstart', handleTap, false);
		} else {
			try {
				document.body.removeEventListener('mousedown', handleClickBefore, false);
			} catch (e) {}
			try {
				document.body.removeEventListener('mousedown', handleClick, false);
			} catch (e) {}
			document.body.addEventListener('mousedown', handleClick, false);
		}
	}, 5);
	if (!canRestart) return false;
	// always full init for fresh level start (after complete or menu)
	init(1);
	checkVisualElements(0);
	updateLevelDisplay(true);
}

function completeLevelIfQualified() {
	var target = getLevelTarget(currentLevel);
	if (score >= target) {
		if (currentLevel + 1 > maxUnlockedLevel) {
			maxUnlockedLevel = currentLevel + 1;
			saveLevelProgress();
		}
		showLevelComplete();
	}
}

function showLevelComplete() {
	// stop game, clear save, dim canvas, show complete banner
	gameState = 0;
	clearSaveState();
	importing = 0;
	hideAllScreens();
	var c = document.getElementById("canvas");
	c.className = "blur";
	$('#pauseBtn').hide();
	$('#restartBtn').hide();
	$('#levelCompleteScreen').fadeIn(150, "linear");
	$('#completeLevelNum').text('LEVEL ' + currentLevel);
	$('#completeScore').text('SCORE: ' + score);
	// handlers set once in init
}

function updateLevelDisplay(show) {
	if (show) {
		$('#currentLevelNum').text(currentLevel);
		$('#levelDisplay').show();
		$('#progressContainer').show();
		window.barFull = false;
		window.progressCounter = 0;
		window.currentProgress = 0;
		updateProgressBar();
	} else {
		$('#levelDisplay').hide();
		$('#progressContainer').hide();
	}
}

function nextLevel() {
	var next = currentLevel + 1;
	if (next > 100) next = 100;
	startLevel(next);
}

function replayLevel() {
	startLevel(currentLevel);
}

function updateProgressBar() {
	// progress fills/stays green after 200 until '1'; resets after clear
	var mod = window.progressCounter % 200;
	if (mod === 0 && window.progressCounter > 0) {
		window.barFull = true;
	} else if (!window.barFull) {
		window.currentProgress = mod; // temp for calc
	}
	if (window.barFull) {
		window.currentProgress = 200; // force stay full
	} else {
		window.currentProgress = mod;
	}
	// if full, stay 100% until cleared
	var percent = (window.currentProgress / 200) * 100;
	$('#progressBar').css('width', percent + '%');
}

function clearBlocksForSpace() {
	// clear all falling/settled blocks to make space (called on '1' when bar full)
	blocks = [];
	for (var i = 0; i < MainHex.blocks.length; i++) {
		MainHex.blocks[i] = [];
	}
	// bomb effect: boom text at center
	if (MainHex) {
		MainHex.texts.push(new Text(trueCanvas.width / 2, trueCanvas.height / 2 - 50, "💣 BOOM!", "bold 40px", "#e74c3c", fadeUpAndOut));
	}
	window.barFull = false;
	window.progressCounter = 0;
	window.currentProgress = 0;
	updateProgressBar();
	// slight delay for visual
	setTimeout(function() {
		if (gameState == 1) updateProgressBar();
	}, 100);
}
