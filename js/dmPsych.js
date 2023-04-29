const dmPsych = (function() {
  'use strict';

  const keys = {};

 /*
  *
  *  Set-up for Prolific and Data Pipe
  *
  */

  // initialize jsPsych
  window.jsPsych = initJsPsych({
    on_finish: () => {
      const totalWins = jsPsych.data.get().filter({jackpot: true, block: 'tileGame'}).count();
      const bonus = jsPsych.data.get().select('val').values[0]
      const basePay = jsPsych.data.get().select('basePay').values[0]
      const bonusEarnings = (totalWins * bonus) / 100
      let boot = jsPsych.data.get().last(1).select('boot').values[0];
      if(!boot) {
        document.body.innerHTML = 
        `<div align='center' style="margin: 10%">
            <p>Thank you for participating!
            <br>You earned a total of <strong>$${bonusEarnings}</strong> in bonus money.
            <br>You will receive your bonus, in addition to <strong>$${basePay}</strong> for your participation, within 48 hours.<p>
            <b>You will be automatically re-directed to Prolific in a few moments.</b>
        </div>`;
        setTimeout(() => { location.href = `https://app.prolific.co/submissions/complete?cc=${completionCode}` }, 5000);
      }
    },
  });

  // set and save subject ID
  let subject_id = jsPsych.data.getURLVariable("PROLIFIC_PID");
  if (!subject_id) subject_id = jsPsych.randomization.randomID(10);
  jsPsych.data.addProperties({ subject: subject_id, boot: false });

  // define file name
  keys.filename = `${subject_id}.csv`;

  // define completion code for Prolific
  const completionCode = "CB1K8YPV";

 /*
  *
  *  David's task functions
  *
  */

  // save survey data in wide format
  keys.saveSurveyData = (data) => {
    const names = Object.keys(data.response);
    const values = Object.values(data.response);
    for(let i = 0; i < names.length; i++) {
        data[names[i]] = values[i];
    };      
  };

  // compute total number of errors on questionnaires
  keys.getTotalErrors = (data, correctAnswers) => {
    const answers = Object.values(data.response);
    const errors = answers.map((val, index) => val === correctAnswers[index] ? 0 : 1)
    const totalErrors = errors.reduce((partialSum, a) => partialSum + a, 0);
    return totalErrors;
  };
                  
  // create tile game
  keys.MakeTileGame = function({val, plural, hex, tileHit, tileMiss, roundLength}, gameType, nTrials, pM, showBonus, blockName) {

    let losses = 0, streak = 0, trialNumber = 0, tooSlow = null, tooFast = null;

    const latency = dmPsych.makeRT(nTrials, pM);

    const intro = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'intro', block: blockName},
      stimulus: function() {
        if (gameType == 'invStrk') {
            return `<div style='font-size:35px'><p>Get ready for the first round!</p></div>`;
        } else {
            return `<div style='font-size:35px'><p>Get ready for the first tile!</p></div>`;
        };
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
    };

    const iti = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'iti', block: blockName},
      stimulus: "",
      choices: [" "],
      trial_duration: () => {
        return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0];
      },
      on_finish: (data) => {
        data.response == " " ? tooFast = 1 : tooFast = 0;
        data.tooFast = tooFast;
      },
    };

    const warning = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'warning', block: blockName},
      choices: "NO_KEYS",
      stimulus: () => {
        const message = `<div style='font-size: 20px'><p>Too Fast!</p><p>Please wait for the tile to appear before pressing your SPACEBAR</p></div>`;
        return (tooFast) ? message : '';
      },
      trial_duration: () => {
        return (tooFast) ? 2500 : 0;
      },
      post_trial_gap: () => {
        return (tooFast) ? 1000 : 0;
      },
    };

    const delayLoop = {
      timeline:[iti, warning],
      loop_function: (data) => {
        return (tooFast) ? true : false;
      },
    };

    const probe = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: 'probe', block: blockName},
      stimulus: '<div class="box" style="background-color:gray"></div>',
      choices: [" "],
      trial_duration: () => { 
        return latency[trialNumber] 
      },
      on_finish: (data) => {
        data.response ? tooSlow = 0 : tooSlow = 1;
        data.tooSlow = tooSlow;
      },
    };

    const outcome = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: `activation`, block: blockName},
      stimulus: () => {
        if (!tooSlow) {
          return tileHit
        } else {
          return tileMiss
        }
      },
      choices: [" "],
      response_ends_trial: false,
      trial_duration: 1000,
    };

    const feedback = {
      type: jsPsychHtmlKeyboardResponse,
      data: {trial_type: `feedback`, block: blockName},
      stimulus: function() { 
        if (gameType == 'bern') {
          if (tooSlow) {
            let reward = showBonus ? `<p>+0 cents</p>` : ``;
            return `<div style='font-size:35px'><p>You missed</p>${reward}<p><br></p><p>(Get ready for the next tile!)</p></div>`;
          } else {
            let reward = showBonus ? `<p>+${val} cent${plural}</p>` : ``;
            return `<div style='font-size:35px'><p>You activated it!</p>${reward}<p><br></p><p>(Get ready for the next tile!)</p></div>`;
          };
        }; 
        if (gameType == 'invStrk') {
          if (tooSlow && losses < 4) {
            losses++;
            let triesLeft = roundLength - losses;
            let tryText = triesLeft == 1 ? "Chance" : "Chances";
            return `<div style='font-size:35px'><p>Attempts this round:</p><p><span style='color:${hex}; font-size:60px'>${losses}</span></p></div>`;
          } else if (tooSlow && losses == 4) {
            losses = 0;
            return `<div style='font-size:35px'><p>You lost the round</p><p><span style='color:${hex}; font-size:60px'>+0 cents</span></p><p><br></p><p>(Get ready for the next round!)</p></div>`;
          } else {
            let winIdx = ['1st', '2nd', '3rd', '4th', '5th'][losses];
            let earnings = ['4', '3', '2', '1', '.5'][losses];
            losses = 0;
            let reward = showBonus ? `<p><span style='color:${hex}; font-size:60px'>+${earnings} cent${plural}</span></p>` : ``;
            return `<div style='font-size:35px'><p>You won on your <strong>${winIdx}</strong> attempt!</p>${reward}<p><br></p><p>(Get ready for the next round!)</p></div>`;
          };
        };
        if (gameType == 'strk') {
          if (tooSlow && streak > 0) {
            let finalStreak = streak;
            streak = 0;
            let reward = showBonus ? `<p><span style='color:${hex}; font-size:60px'>+${finalStreak * val} cents</span></p>` : ``;
            return `<div style='font-size:35px'><p>Your streak was ${finalStreak}</p>${reward}</div>`;
          } else {
            if (!tooSlow) { streak++ };
            return `<div style='font-size:35px'><p>Current Streak:</p><p><span style='color:${hex}; font-size:60px'>${streak}</span></p></div>`;
          };
        };
      },
      choices: "NO_KEYS",
      trial_duration: 2000,
      on_finish: (data) => {
        trialNumber++;
        if (trialNumber == nTrials) { 
          trialNumber = 0;
          losses = 0;
          streak = 0 
        };
        !tooSlow ? data.jackpot = true : data.jackpot = false;      
      },
    };

    const task = {
      timeline: [delayLoop, probe, outcome, feedback],
      repetitions: nTrials,
    };

    this.timeline = [intro, task];

  };

  // make n-dimensional array of RTs given p(hit) = p
  keys.makeRT = function(n, p) {

    const nDraws = Math.floor(n * p);  // set number of draws from geometric distribution
    const maxWinStrk = Math.ceil((nDraws*1.5)/(n-nDraws));  // set length of longest win streak at the trial level
    const maxLossStrk = Math.ceil(((n-nDraws)*1.5)/nDraws);  // set length of longest losing streak at chunk level
    let geoms = [];  // random draws from geometric distribution
    let rt = [];  // array of RTs
    let nTrials = 0;  // count total numeber of trials
    let winStrkPass = true;  // flag for passing the max win streak condition
    let lossStrkPass = true;  // flag for passing the max loss streak condition
    let nLossTot = 0;  // count total numeber of losses

    /* 

    Create random vector of n trial outcomes with following conditions:
      - total number of trial-level losses = n - nDraws
      - total number of trials = n
      - first and last trials are losses
      - max win streak at the trial level is <= maxWinStrk
      - max loss streak at the chunk level is <= maxLossStrk

    */

    do {
      geoms = [];
      winStrkPass = true;
      lossStrkPass = true;

      // make n * p random draws from geometric distribution
      for (let i = 0; i < nDraws; i++) {
        let probDraw = (Math.random() * .998) + .001;
        let geomDraw = Math.floor(Math.log(1 - probDraw) / Math.log(1 - p));
        geoms.push(geomDraw);
      }

      // get longest losing streak at the chunk level
      let nLoss = geoms.map(x => Math.floor(x/5));  // number of chunk-level losses in a row per geom draw
      if (Math.max(...nLoss) > maxLossStrk) { lossStrkPass = false };

      // get longest winning streak at the trial level
      for (let i = maxWinStrk; i <= nDraws; i++) {
        let geomSlice = geoms.slice(i - maxWinStrk, i);
        if (geomSlice.every(x => x == 0)) { winStrkPass = false };
      };

      nTrials = geoms.reduce((x, y) => x + y, 0) + geoms.length;  // compute total number of trials
      nLossTot = geoms.reduce((x, y) => x + y, 0);  // get total number of losses

    } while (nTrials !== n || !winStrkPass || !lossStrkPass || nLossTot !== (n - nDraws) || geoms[0] == 0);

    for (let i = 0; i < geoms.length; i++) {
      rt.push(...Array(geoms[i]).fill(200));
      rt.push(750);
    }

    return rt;

  };

  // spinner task
  keys.spinner = function(canvas, spinnerData, score, sectors) {

    /* get context */
    const ctx = canvas.getContext("2d"); 

    /* get pointer */
    const pointer = document.querySelector("#spin");

    /* get score message */
    const scoreMsg = document.getElementById("score");

    /* get wheel properties */
    let wheelWidth = canvas.getBoundingClientRect()['width'];
    let wheelHeight = canvas.getBoundingClientRect()['height'];
    let wheelX = canvas.getBoundingClientRect()['x'] + wheelWidth / 2;
    let wheelY = canvas.getBoundingClientRect()['y'] + wheelHeight / 2;
    const tot = sectors.length; // total number of sectors
    const rad = wheelWidth / 2; // radius of wheel
    const PI = Math.PI;
    const arc = (2 * PI) / tot; // arc sizes in radians

    /* spin dynamics */
    const friction = 0.98;  // 0.995=soft, 0.99=mid, 0.98=hard
    const angVelMin = 5;    // Below that number will be treated as a stop
    let angVelMax = 0;      // Random ang.vel. to acceletare to 
    let angVel = 0;         // Current angular velocity

    /* state variables */
    let isGrabbed = false;       // true when wheel is grabbed, false otherwise
    let isDragging = false;      // true when wheel is being dragged, false otherwise
    let isSpinning = false;      // true when wheel is spinning, false otherwise
    let isAccelerating = false;  // true when wheel is accelerating, false otherwise
    let lastAngles = [0,0,0];    // store the last three angles
    let correctSpeed = [0]       // speed corrected for 360-degree limit
    let startAngle = null;       // angle of grab
    let oldAngle = 0;            // wheel angle prior to last perturbation
    let currentAngle = null;     // wheel angle after last perturbation
    let onWheel = false;         // true when cursor is on wheel, false otherwise

    /* define spinning functions */
    const onGrab = (x, y) => {
      if (!isSpinning) {
        canvas.style.cursor = "grabbing";
        isGrabbed = true;
        startAngle = calculateAngle(x, y);
      };
    };

    const calculateAngle =  (currentX, currentY) => {
      let xLength = currentX - wheelX;
      let yLength = currentY - wheelY;
      let angle = Math.atan2(xLength, yLength) * (180/Math.PI);
      return 360 - angle;
    };

    const onMove = (x, y) => {
      if(isGrabbed) {
        canvas.style.cursor = "grabbing";
        isDragging = true;
      };
      if(!isDragging)
        return
      lastAngles.shift();
      let deltaAngle = calculateAngle(x, y) - startAngle;
      currentAngle = deltaAngle + oldAngle;
      lastAngles.push(currentAngle);
      let speed = lastAngles[2] - lastAngles[0];
      if (Math.abs(speed) < 200) {
        correctSpeed.shift();
        correctSpeed.push(speed);
      };
      render(currentAngle);
    };

    const render = (deg) => {
      canvas.style.transform = `rotate(${deg}deg)`;
    };

    const onRelease = function() {
      isGrabbed = false;
      if(isDragging){
        isDragging = false;
        oldAngle = currentAngle;
        let speed = correctSpeed[0];
        if (Math.abs(speed) > angVelMin) {
          isAccelerating = true;
          isSpinning = true;
          angVelMax = rand(25, 50);
          giveMoment(speed)
        };
      };   
    };

    const giveMoment = function(speed) {

      // stop accelerating when max speed is reached
      if (Math.abs(speed) >= angVelMax) isAccelerating = false;

      // accelerate
      if (isAccelerating) {
        speed *= 1.06; // Accelerate
        const req = window.requestAnimationFrame(giveMoment.bind(this, speed));
        oldAngle += speed;
        lastAngles.shift();
        lastAngles.push(oldAngle);
        render(oldAngle);
      }
      
      // decelerate and stop
      else {
        isAccelerating = false;
        speed *= friction; // Decelerate by friction  
        const req = window.requestAnimationFrame(giveMoment.bind(this, speed));
        if (Math.abs(speed) > angVelMin * .1) {
          // decelerate
          oldAngle += speed;
          lastAngles.shift();
          lastAngles.push(oldAngle);
          render(oldAngle);       
        } else {
          // stop spinner
          speed = 0;
          currentAngle = oldAngle;
          let sector = sectors[getIndex()];
          spinnerData.outcomes.push(parseFloat(sector.label));
          drawSector(sectors, getIndex());
          updateScore(parseFloat(sector.label), sector.color);
          window.cancelAnimationFrame(req);
        };
      };
    };

    /* generate random float in range min-max */
    const rand = (m, M) => Math.random() * (M - m) + m;

    const updateScore = (points, color) => {
      score += points;
      spinnerData.score = score;
      scoreMsg.innerHTML = `<span style="color:${color}; font-weight: bolder">${score}</span>`;
      setTimeout(() => {
        scoreMsg.innerHTML = `${score}`
        isSpinning = false;
        drawSector(sectors, null);
        onWheel ? canvas.style.cursor = "grab" : canvas.style.cursor = "";
      }, 1000);
    };

    const getIndex = () => {
      let normAngle = 0;
      let modAngle = currentAngle % 360;
      if (modAngle > 270) {
        normAngle = 360 - modAngle + 270;
      } else if (modAngle < -90) { 
        normAngle =  -modAngle - 90;
      } else {
        normAngle = 270 - modAngle;
      }
      let sector = Math.floor(normAngle / (360 / tot));
      return sector;
    };

    /* Draw sectors and prizes texts to canvas */
    const drawSector = (sectors, sector) => {
      for (let i = 0; i < sectors.length; i++) {
        const ang = arc * i;
        ctx.save();
        // COLOR
        ctx.beginPath();
        ctx.fillStyle = sectors[i].color;
        ctx.moveTo(rad, rad);
        ctx.arc(rad, rad, rad, ang, ang + arc);
        ctx.lineTo(rad, rad);
        ctx.fill();
        // TEXT
        ctx.translate(rad, rad);
        ctx.rotate( (ang + arc / 2) + arc );
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        if (isSpinning && i == sector) {
          ctx.font = "bolder 50px sans-serif"
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 8;
          ctx.strokeText(sectors[i].label, 0, -140);
          ctx.fillText(sectors[i].label, 0, -140);
        } else {
          ctx.font = "bold 50px sans-serif"
          ctx.fillText(sectors[i].label, 0, -140);
        }
        // RESTORE
        ctx.restore();
      }
    };

    drawSector(sectors, null);

    /* add event listners */
    canvas.addEventListener('mousedown', function(e) {
        if (onWheel) { onGrab(e.clientX, e.clientY) };
    });

    canvas.addEventListener('mousemove', function(e) {
        let dist = Math.sqrt( (wheelX - e.clientX)**2 + (wheelY - e.clientY)**2 );
        dist < rad ? onWheel = true : onWheel = false;
        onWheel && !isGrabbed && !isSpinning ? canvas.style.cursor = "grab" : canvas.style.cursor = "";
        if(isGrabbed && onWheel) { onMove(e.clientX, e.clientY) };
    });

    window.addEventListener('mouseup', onRelease);

    window.addEventListener('resize', function(event) {
      wheelWidth = canvas.getBoundingClientRect()['width'];
      wheelHeight = canvas.getBoundingClientRect()['height'];
      wheelX = canvas.getBoundingClientRect()['x'] + wheelWidth / 2;
      wheelY = canvas.getBoundingClientRect()['y'] + wheelHeight / 2;
    }, true);
  };

  keys.holeInOne = (function () {

    var game = {};

    // import methods from matter.js and define physics engine
    var { Engine, Render, Vertices, Composite, World, Bodies, Events, Mouse, MouseConstraint } = Matter;
    var engine = Engine.create();

    // temporary data
    var ballXtrial = [0];   // ball's X coordinates on current trial
    var ballYtrial = [0];   // ball's Y coordinate on current trial
    var endTrial = false; // flag whether the current trial is complete
    var firing = false;   // flag whether the slingshot was fired
    var inTheHole = false;  // flag whether the ball went through the hold
    var intro = 0;        // use to determine which instructions to display during introduction

    // data to save
    game.data = {
      ballX: [],      // ball's X coordinates on all trials
      ballY: [],      // ball's Y coordinates on all trials
      totalTrials: 0,   // total number of trials
      totalScore: 0   // total times getting the ball through the hole
    };

    // run slingshot game
    game.run = function(c, trial) {
      let mouse, mouseConstraint;

      // import settings
      var set = {
        ball: {
          x: trial.ball_xPos*c.width, 
          y: trial.ball_yPos*c.height, 
          rad: trial.ball_size, 
          fric: trial.friction, 
          col: trial.ball_color
        },
        wall: {
          x: trial.wall_xPos*c.width,
          yTop: (1/6)*(c.height-trial.hole_size),
          yBottom: (5/6)*c.height + (1/6)*trial.hole_size,
          width: trial.wall_width,
          height: .5*(c.height-trial.hole_size),
          col: trial.wall_color
        },
        sling: {
          stiffness: trial.tension,
          x: trial.ball_xPos*c.width,
          y: trial.ball_yPos*c.height
        },
        canvas: {
          height: c.height,
          width: c.width
        }
      };

      // create renderer
      var render = Render.create({ 
        engine: engine, 
        canvas: c, 
        options: {
          height: set.canvas.height,
          width: set.canvas.width,
          wireframes: false,
          writeText: text
        }
      });

      // construct ball
      function Ball() {           
        this.body = Bodies.circle(set.ball.x, set.ball.y, set.ball.rad, { 
          frictionAir: set.ball.fric,
          render: {
            fillStyle: set.ball.col,
          }
        });
        World.add(engine.world, this.body);
      };

      // construct target
      function Wall(y, tri) {
        this.body = Bodies.fromVertices(set.wall.x, y, tri, {
          isStatic: true,
          render: {
            fillStyle: set.wall.col,
          }
        });
        World.add(engine.world, this.body);
      };

      // construct sling
      function Sling() {    
        this.body = Matter.Constraint.create({
          pointA: {x: set.sling.x, y: set.sling.y},
          bodyB: ball,
          stiffness: set.sling.stiffness,
        });
        World.add(engine.world, this.body);
      };

      // construct mouse
      function makeMouse() {    
        mouse = Mouse.create(render.canvas);
        mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
            render: {visible: false}
          }
        });
        World.add(engine.world, mouseConstraint);
        render.mouse = mouse;
      }

      // construct text
      function text(canvas, options, c) {

        if (intro <= 3) {
          c.font = "bold 20px Arial";
              c.fillStyle = 'red';
          c.fillText("Shoot the ball through the hole.", 75, 60);
          }

        if (game.data.totalTrials == 0 && intro <= 2) {
          c.font = "16px Arial";
              c.fillStyle = "white";
          c.fillText("Step 1: Click and hold the ball. Keeping your cursor in the play area,", 75, 100);
          c.fillText("pull the ball to the left to draw your sling.", 75, 120);
          }

          if (game.data.totalTrials == 0 && intro > 0 && intro <= 2) {
          c.font = "16px Arial";
              c.fillStyle = "white";
          c.fillText("Step 2: Aim at the hole,", 75, 160);
          c.fillText("then release the ball to launch.", 75, 180);
        }

          if (game.data.totalTrials == 1 && intro > 1 && intro <= 3) {
          c.font = "16px Arial";
              c.fillStyle = "white";
          c.fillText("Good job! Please spend the next few", 75, 100);
          c.fillText("minutes playing Hole in One. We'll let", 75, 120);
          c.fillText("you know when time is up.", 75, 140);
        }
        };

      // shoot sling
      function shootSling() { 
        Events.on(mouseConstraint, 'startdrag', function(e) {
          tracker.ball = ball;
          endTrial = false;
          intro++;
        });
        Events.on(mouseConstraint, 'enddrag', function(e) {
          if(e.body === ball) firing = true;
        });
        Events.on(engine, 'beforeUpdate', function() {
          var xDelta = Math.abs(ball.position.x-set.ball.x);
          var yDelta = Math.abs(ball.position.y-set.ball.y);
          if(firing && xDelta<set.ball.rad && yDelta<set.ball.rad) {
            sling.bodyB = null;
            sling.pointB.x = set.ball.x;
            sling.pointB.y = set.ball.y;
            firing = false;
            intro++;
          };
        });
      };

      // track location of ball
      function trackBall() {    
        Events.on(engine, "beforeUpdate", function() {
          var xLoc = tracker.ball.position.x;
          var yLoc = tracker.ball.position.y;
          var xLimR = set.canvas.width*1.5;
          var xLimL = set.ball.x;
          var yLim = set.canvas.height;
          if (xLoc>xLimL && xLoc<xLimR && yLoc<yLim) {
            ballXtrial.push(xLoc);
            ballYtrial.push(yLoc);
          }
          if (xLoc > set.wall.x && !endTrial) {
            inTheHole = true;
          }
        });
      }

      // record data
      function recordData() {
        Events.on(engine, "beforeUpdate", function () {
          var xLoc = tracker.ball.position.x
          var yLoc = tracker.ball.position.y
          var xLim = set.canvas.width;
          var yLim = set.canvas.height;
          if(!endTrial && yLoc>(yLim*2) || !endTrial && xLoc>(xLim*2)) {

            // save data
            game.data.ballX.push(ballXtrial);
            game.data.ballY.push(ballYtrial);
            game.data.totalTrials++;
            if (inTheHole) game.data.totalScore++;

            // reset variables
            ballXtrial = [0];
            ballYtrial = [0];
            endTrial = true;
            inTheHole = false;

            // replace ball
            ball = new Ball().body;
            sling.pointB.x = null;
            sling.pointB.y = null;
            sling.bodyB = ball;
          };
        })
      }

      // specify vertices for walls
      var topWallVert = Vertices.fromPath(`0 0 0 ${set.wall.height} ${set.wall.width} 0`)
      var bottomWallVert = Vertices.fromPath(`0 0 0 ${set.wall.height} ${set.wall.width} ${set.wall.height}`)

      // construct bodies and mouse
      var ball = new Ball().body;
      var tracker = { ball: ball };
      var triWallTop = new Wall(set.wall.yTop, topWallVert).body;
      var triWallBottom = new Wall(set.wall.yBottom, bottomWallVert).body;
      var sling = new Sling().body;
      makeMouse();

      // call functions
      shootSling();
      trackBall();
      recordData();

      // run engine
      Engine.run(engine);

      // run renderer
      Render.run(render);
    };

    return game;

  }());

 /*
  *
  *  David's text functions
  *
  */

  keys.consentForm = function({basePay}) {
    const html = `<div class='parent' style='height: 1000px; width: 1000px'>
        <p><b>Adult Consent for Participation in a Research Project<br>
        200 FR 2 (2017-1)</b><br>
        Study Title: Choices, decisions, and pursuits<br>
        Investigator: Paul Stillman<br>
        HSC #: 2000023892</p>

        <p><b>Purpose:</b><br>
        You are invited to participate in a research study designed to examine judgment and decision-making.</p>

        <p><b>Procedures:</b><br>
        If you agree to take part, your participation in this study will involve answering a series of questions as well as making choices between different options that will be presented to you as part of study activities. We anticipate that your involvement will require 12-15 minutes.</p>

        <p><b>Compensation:</b><br>
        You'll receive $${basePay} in exchange for your participation at the Yale SOM Lab.</p>

        <p><b>Risks and Benefits:</b><br>
        There are no known or anticipated risks associated with this study. Although this study will not benefit you personally, we hope that our results will add to the knowledge about judgment and decision-making.</p>

        <p><b>Confidentiality:</b><br>
        All of your responses will be anonymous.  Only the researchers involved in this study and those responsible for research oversight will have access to any information that could identify you/that you provide. The researcher will not know your name, and no identifying information will be connected to your survey answers in any way. The survey is therefore anonymous.</p>

        <p><b>Voluntary Participation:</b><br>
        Your participation in this study is voluntary. You are free to decline to participate, to end your participation at any time for any reason, or to refuse to answer any individual question without penalty.</p>

        <p><b>Questions:</b><br>
        If you have any questions about this study, you may contact the principal investigator, Paul Stillman, (paul.stillman@yale.edu). If you would like to talk with someone other than the researchers to discuss problems or concerns, to discuss situations in the event that a member of the research team is not available, or to discuss your rights as a research participant, you may contact the Yale University Human Subjects Committee, 203-785-4688, human.subjects@yale.edu. Additional information is available at http://your.yale.edu/research-support/human-research/research-participants</p>

        <p>Would you like to continue to the study? Press the "Next" button to indicate that you consent to participate in the study.</p>`
    return html;
  };

  keys.intro_tileGame = function({basePay}) {
      const html = [`<div class='parent'>
          <p>Thank you for playing Hole in One!</p>
          <p>Next, you'll play a different game called the Tile Game.</p>
          <p>When you are ready, please continue.</p></div>`,

          `<div class='parent'>
          <p>During the Tile Game, you'll have opportunities to earn money.</p>
          <p>All of the money you win during the Tile Game will be added to
          a "bonus fund,"<br>which you'll receive at the end of the study.</p>
          <p>Your total payment will be $${basePay} for your participation, plus all of the money in your bonus fund.</p>
          </div>`];
      return html;
  };

  keys.preTask_tileGame = function() {
      const html = [`<div class='parent'>
          <p>You are now ready to play the Tile Game.</p>
          <p>Once you proceed, the Tile Game will start, so get ready to press your SPACEBAR.</p>
          <p>Continue to begin.</p>
          </div>`];
      return html;
  };

  keys.prePractice_tileGame = function({gameType, val, span, color, hex}) {

      let html;

      if (gameType == 'invStrk') {
          html = [`<div class='parent'>
              <p>The Tile Game is played in multiple rounds.</p>
              </div>`,

              `<div class='parent'>
              <p>In each round, you'll have up to five attempts to activate the grey tile below.</br>
              Your goal is to activate the tile in as few attempts as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>The tile will appear on your screen, then disappear very quickly. To activate it, you must press your SPACEBAR 
              before it disappears; whenever you see the tile, you should press your SPACEBAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate the tile, it will turn <span class='${span}'>${color}</span>...</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>...then, you'll see how many attempts it took you to activate the tile.</br>
              For instance, if you activate the tile on your 1st attempt, you'll get the following message:</p>
              <div style='font-size:35px'><p>You won on your <strong>1st</strong> attempt!</p></div>
              </div>`,

              `<div class='parent'>
              <p>If you miss the tile, you'll see how many attempts you've made over the course of the current round.</br>
              For example, if you miss on your 1st attempt, you'll see the following message:</p>
              <div style='font-size:35px'><p>Attempts this round:</p><p><span style='color:${hex}; font-size:60px'>1</span></p></div>
              </div>`,

              `<div class='parent'>
              <p>To get a feel for the Tile Game, you'll complete a practice round.<br>
              Once you proceed, practice round will start, so get ready to press your SPACEBAR.</p>
              <p>Continue to begin practicing.</p>
              </div>`];        
      };

      if (gameType == 'strk') {
          html = [`<div class='parent'>
              <p>In the Tile Game, your goal is to build winning streaks.</br>
              A winning streak is a series of consecutive successes.</p>
              </div>`,

              `<div class='parent'>
              <p>To build winning streaks, you'll try to activate the gray tile below.</br>
              Activating the tile multiple times in a row creates a winning streak.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>The tile will appear on your screen, then disappear very quickly. To activate it, you must press your SPACEBAR 
              before it disappears; whenever you see the tile, you should press your SPACEBAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate the tile, it will turn <span class='${span}'>${color}</span>...</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>...then you'll see how many times you've activated the tile in a row.</br>
              For instance, if you activate the tile 3 times in a row, you'll get the following message:</p>
              <div style='font-size:35px'><p>Current Streak:</p><p><span style='color:${hex}; font-size:60px'>3</span></p></div>
              </div>`,

              `<div class='parent'>
              <p>If you miss the tile, your streak will end and you'll see how long it was.
              <div style='font-size:35px'><p>Your streak was 3</p></div>
              </div>`,

              `<div class='parent'>
              <p>To get a feel for the Tile Game, you'll complete a practice round.<br>
              Once you proceed, practice round will start, so get ready to press your SPACEBAR.</p>
              <p>Continue to begin practicing.</p>
              </div>`];
      };

      if (gameType == 'bern') {
          html = [`<div class='parent'>
              <p>To earn money in the Tile Game, you must achieve wins.<br>
              The more wins you achieve, the more money you'll earn.</p>
              </div>`,

              `<div class='parent'>
              <p>To achieve wins, you'll try to "activate" tiles like this one.<br>
              Activating a tile results in a win.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>Wins are worth money. The more tiles you activate, the more money you'll earn.<br>
              Specifically, ${val} cent${plural} will be added to your bonus fund for each tile you activate.</p>               
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>Tiles will appear on your screen, then disappear very quickly. To activate a tile, you must press your SPACE BAR 
              before it disappears; whenever you see a tile, you should press your SPACE BAR as fast as possible.</p>
              <div class='box' style='background-color:gray'></div>
              </div>`,

              `<div class='parent'>
              <p>In the Tile Game, tiles turn <span class='${span}'>${color}</span> 
              when activated.</p>
              <div class='box' style='background-color:${hex}'></div>
              </div>`,

              `<div class='parent'>
              <p>If you activate a tile, you'll see that ${val} cent${plural} ${wasWere} added to your bonus fund.<br>
              The next tile will appear immediately after.</p>
              <div style='font-size:35px'><p>You activated it!</p><p>+${val} cent${plural}</p><p><br></p><p>(Get ready for the next tile!)</p></div>
              </div>`,

              `<div class='parent'>
              <p>If you miss a tile, you'll see that no money was added to your bonus fund.<br>
              The next tile will appear immediately after.</p>
              <div style='font-size:35px'><p>You missed</p><p>+0 cents</p><p><br></p><p>(Get ready for the next tile!)</p></div>
              </div>`];
      }

      return html;
  };

  keys.practiceComplete_tileGame = function() {
      const html = [`<div class='parent'>
        <p>Practice is now complete.<br>
        Next, you'll complete the full version of the Tile Game.</p></div>`];
      return html;
  };

  keys.postPractice_tileGame = function({gameType, pM, val, plural}) {

      let html;

      let easierOrHarder = pM > .5 ? 'easier' : 'more difficult';

      if (gameType == 'invStrk') {
          html = [`<div class='parent'>
              <p>The full version of the Tile Game differs from the practice version in two ways.</p>
              </div>`,

              `<div class='parent'>
              <p>First, in the full version of the Tile Game you can earn bonus money<br>
              by activating the tile in as few attempts as possible. Specifically, you'll earn:</p>
              <ul style="text-align: left; margin-left: 150px">
                  <li><strong>4 cents</strong> if you activate the tile on your 1st attempt</li>
                  <li><strong>3 cents</strong> if you activate the tile on your 2nd attempt</li>
                  <li><strong>2 cents</strong> if you activate the tile on your 3rd attempt</li>
                  <li><strong>1 cent</strong> if you activate the tile on your 4th attempt</li>
                  <li><strong>.5 cents</strong> if you activate the tile on your 5th attempt</li>
                  <li><strong>0 cents</strong> if you fail to activate the tile before the round is complete.</li>
              </ul>
              </div>`,

              `<div class='parent'>
              <p>Second, the full version of the Tile Game will be ${easierOrHarder} than the practice version.<br>
              Specifically, most players succeed at activating the tile <strong>${pM*100}%</strong> of the time.</p>
              </div>`];
      };

      if (gameType == 'strk') {
          html = [`<div class='parent'>
              <p>The full version of the Tile Game differs from the practice version in two ways.</p>
              </div>`,

              `<div class='parent'>
              <p>First, in the full version of the Tile Game, winning streaks are worth money.</br>
              The longer the streak, the more money it's worth.</p>
              <p>Specifically, ${val} cent${plural} will be added to your bonus fund for each consecutive tile you activate.</p> 
              </div>`,

              `<div class='parent'>
              <p>Second, the full version of the Tile Game will be ${easierOrHarder} than the practice version.<br>
              Specifically, most players succeed at activating the tile <strong>${pM*100}%</strong> of the time.</p>
              </div>`];
      };

      return html;
  };

  return keys

}());