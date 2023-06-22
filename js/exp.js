var exp = (function() {

    let p = {};

    // randomly assign to conditions and save settings
    const settings = {
        pM: Array(.5, .13)[Math.floor(Math.random()*2)],
        pM_practice: .32,
        gameType: ['1inN', 'bern'][Math.floor(Math.random()*2)],
        val: 6,
        nTrials: 62,
        basePay: 2.50,
        roundLength: 5,
        hex: '#00aa00',
        span: 'a-span',
        color: "green",
    };

    settings.value = settings.val.toString();
    settings.plural = settings.val == 1 ? '' : 's'; 
    settings.wasWere = settings.val == 1 ? 'was' : 'were';
    settings.tileHit = `<div class="box" style="background-color:${settings.hex}"> </div>`;
    settings.tileMiss = `<div class="box" style="background-color:white"> </div>`;

    // save condition and URL data
    jsPsych.data.addProperties({
        pM: settings.pM,
        gameType: settings.gameType,
        val: settings.val,
        basePay: settings.basePay,
        startTime: String(new Date()),
    });

   /*
    *
    *   INSTRUCTIONS
    *
    */

    // constructor function for presenting post-practice tile game information and assessing comprehension
    function MakePostPractice_tileGame({gameType, pM, pM_practice, val, plural, nTrials, roundLength}) {

        const info = {
            type: jsPsychInstructions,
            pages: dmPsych.postPractice_tileGame({gameType, pM, pM_practice, val, plural, nTrials, roundLength}),
            show_clickable_nav: true,
        };

        let q2, q3, o2, a1, a2, a3, a4;

        if (gameType == 'invStrk') {
            // attention check #1
            a1 = 'Activate the tile in as few attempts as possible';
            // attention check #2
            q2 = 'The fewer attempts you take to activate the tile...';
            o2 = ['the more fireworks you will receive.', 'the sooner the game will end.', 'the more points you will accumulate.'];
            a2 = 'the more fireworks you will receive.';
            // attention check #3
            q3 = 'Most players activate the tile what percentage of the time?';
            a3 = String(pM*100) + '%';
            // attention check #4
            a4 = String(nTrials);
        };

        if (gameType == 'strk') {
            // attention check #1
            a1 = 'Activate the tile as many times in a row as possible';
            // attention check #2
            q2 = 'The longer your streak...';
            o2 = ['the more fireworks you will receive.', 'the sooner the game will end.', 'the more points you will accumulate.'];
            a2 = 'the more fireworks you will receive.';
            // attention check #3
            q3 = 'Most players activate the tile what percentage of the time?';
            a3 = String(pM*100) + '%';
            // attention check #4
            a4 = String(nTrials);
        };

        if (gameType == '1inN') {
            // attention check #1
            a1 = 'Win each round';
            // attention check #2
            q2 = 'Each time you win a round...';
            o2 = ['you will get a fireworks display.', 'the game will end.', 'you will receive points.'];
            a2 = 'you will get a fireworks display.';
            // attention check #3
            q3 = 'Most players win what percentage of their rounds?';
            a3 = String( Math.floor(100 * (1 - (1 - pM)**roundLength)) ) + '%';
            // attention check #4
            a4 = String(nTrials);
        };

        if (gameType == 'bern') {
            // attention check #1
            a1 = 'Win each round';
            // attention check #2
            q2 = 'Each time you win a round...';
            o2 = ['you will get a fireworks display.', 'the game will end.', 'you will receive points.'];
            a2 = 'you will get a fireworks display.';
            // attention check #3
            q3 = 'Most players win what percentage of their rounds?';
            a3 = String(pM*100) + '%';
            // attention check #4
            a4 = String(nTrials);
        };

        const compChk = {
            type: jsPsychSurveyMultiChoice,
            preamble: `<div style="font-size:16px"><p>To make sure you understand the full version of <strong>The Tile Game</strong>, please answer the following questions:</p></div>`,
            questions: [
                {
                  prompt: 'What is the goal of the Tile Game? (Multiple answers are possible, but one is best.)', 
                  name: 'goalChk', 
                  options: ['Activate the tile in as few attempts as possible', 'Activate the tile as many times in a row as possible', 'Win each round'], 
                  required: true
                },
                {
                  prompt: q2, 
                  name: 'fireworksChk', 
                  options: o2, 
                  required: true
                },
                {
                  prompt: q3, 
                  name: 'probChk', 
                  options: ['0%', '13%', '50%', '87%', '96%'], 
                  required: true
                },
                {
                  prompt: 'How many times will the tile appear?', 
                  name: 'nChk', 
                  options: ['22', '42', '62', '82', '102'], 
                  required: true
                },
            ],
            on_finish: (data) => {
                const correctAnswers = [a1, a2, a3, a4];
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                data.totalErrors = totalErrors;
            }
        };

        const errorMessage = {
            type: jsPsychInstructions,
            pages: [`<div class='parent'><p>You provided a wrong answer.<br>To make sure you understand the game, please continue to re-read the instructions.</p></div>`],
            show_clickable_nav: true,
        };

        const conditionalNode = {
            timeline: [errorMessage],
            conditional_function: () => {
                const fail = jsPsych.data.get().last(1).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            }
        };

        this.timeline = [info, compChk, conditionalNode];
        this.loop_function = () => {
            const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
            return fail;
        };
    };


    function MakeSurveyIntro() {
        const info = {
            type: jsPsychInstructions,
            pages: [`<p><div class='parent' style='text-align: left'>For the next 10 to 15 minutes, you'll be helping us answer the following question:<br>
                "What makes some games more immersive and engaging than others?"</p>

                <p>Specifically, you'll play two games and provide feedback about each one. 
                By playing games and providing feedback, you'll help us understand how to design games 
                that are as immersive and engaging as possible.</p>

                <p>To make it easier for you to provide feedback, we will explain exactly what it means<br>
                for a game to be immersive and engaging. To continue, press "Next".</p></div>`,

                `<p><div class='parent' style='text-align: left'>A game that is immersive and engaging captures your attention and "sucks you in."</p>
                <p>When a game is extremely immersive and engaging, it feels difficult to stop playing<br>
                even when you want to quit and do something else.</p></div>`],
            show_clickable_nav: true,
            post_trial_gap: 500,
        };
        const compChk = {
            type: jsPsychSurveyMultiChoice,
            questions: [
                {
                    prompt: `What does it mean for a game to be immersive and engaging?`,
                    name: `defineFlow`,
                    options: [`It means that I enjoyed the game.`, `It means that I won a lot of money by playing the game.`, `It means that the game captured my attention and sucked me in.`],
                    requires: true,
                    horizontal: false,
                }],
            on_finish: (data) => {
                const correctAnswers = [`It means that the game captured my attention and sucked me in.`];
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                data.totalErrors = totalErrors;
            }
        };
        const errorMessage = {
            type: jsPsychInstructions,
            pages: [`<div class='parent'><p>You provided a wrong answer.</p><p>To make sure you understand what makes a game immersive and engaging,<br>please continue to re-read the instructions.</p></div>`],
            show_clickable_nav: true,
        };
        const conditionalNode = {
            timeline: [errorMessage],
            conditional_function: (data) => {
                const fail = jsPsych.data.get().last(1).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            }
        };
        this.timeline = [info, compChk, conditionalNode];
        this.loop_function = () => {
            const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
            return fail;
        };
    };


    // create instruction nodes

    p.consent = {
        type: jsPsychInstructions,
        pages: dmPsych.consentForm(settings),
        show_clickable_nav: true,
    };

    p.surveyIntro = new MakeSurveyIntro();

    p.preFull_task1 = {
        type: jsPsychInstructions,
        pages: [`<div class='instructions'>
            <p>Next, you'll spend a few minutes playing the first of two games: a game called "Hole in One."<br>
            After you finish, you'll answer some questions about your experience.</p>
            <p>When you're ready, press "Next" to continue.</p></div>`],
        show_clickable_nav: true,
    };

    p.intro_task2 = {
        type: jsPsychInstructions,
        pages: dmPsych.intro_tileGame(settings),
        show_clickable_nav: true,
    };

    p.prePractice_task2 = {
        type: jsPsychInstructions,
        pages: dmPsych.prePractice_tileGame(settings),
        show_clickable_nav: true,
    };

    p.practiceComplete = {
        type: jsPsychInstructions,
        pages: dmPsych.practiceComplete_tileGame(),
        show_clickable_nav: true,
    };

    p.postPractice_task2 = new MakePostPractice_tileGame(settings);

    p.preTask_task2 = {
        type: jsPsychInstructions,
        pages: dmPsych.preTask_tileGame(settings),
        show_clickable_nav: true,
    };

   /*
    *
    *   TASK
    *
    */

    p.task1 = {
        type: dmPsychHoleInOne,
        stimulus: dmPsych.holeInOne.run,
        total_shots: 12,  
        canvas_size: [475, 900],
        ball_color: 'white',
        ball_size: 10,
        ball_xPos: .13,
        ball_yPos: .5,
        wall_width: 75,
        wall_color: '#797D7F',
        wall_xPos: .9,
        hole_size: 75,
        friction: .01,
        tension: .008,
        prompt: `<div class='instructions'>

        <p><strong>Hole in One</strong>. The goal of Hole in One is to shoot the ball through the hole.<br>
        Follow the instructions in the game area, then play Hole in One. 
        We'll let you know when time is up.</p></div>`,
        data: {block: 'holeInOne'},
    };

    p.practice2 = new dmPsych.MakeTileGame(settings, settings.gameType, 10, settings.pM_practice, 'practice');

    p.task2 = new dmPsych.MakeTileGame(settings, settings.gameType, settings.nTrials, settings.pM, 'tileGame');


   /*
    *
    *   QUESTIONS
    *
    */

    // scales
    var zeroToExtremely = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8<br>Extremely'];
    var zeroToALot = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8<br>A lot'];

    // constructor functions
    const flowQs = function(name, blockName) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px'>

        <p>Thank you for completing ${name}!</p>

        <p>During ${name}, to what extent did you feel immersed and engaged in what you were doing?<br>
        Report the degree to which you felt immersed and engaged by answering the following questions.</p></div>`;
        this.questions = [
            {prompt: `During ${name}, to what extent did you feel <strong>absorbed</strong> in what you were doing?`,
            name: `absorbed`,
            labels: zeroToExtremely},
            {prompt: `During ${name}, to what extent did you feel <strong>immersed</strong> in what you were doing?`,
            name: `immersed`,
            labels: zeroToExtremely},
            {prompt: `During ${name}, to what extent did you feel <strong>engaged</strong> in what you were doing?`,
            name: `engaged`,
            labels: zeroToExtremely},
            {prompt: `During ${name}, to what extent did you feel <strong>engrossed</strong> in what you were doing?`,
            name: `engrossed`,
            labels: zeroToExtremely},
        ];
        this.randomize_question_order = false;
        this.scale_width = 500;
        this.data = {block: blockName};
        this.on_finish =(data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    var enjoyQs = function(name, blockName) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px'>

        <p>Below are a few more questions about the ${name}.</p>

        <p>Instead of asking about immersion and engagement, these questions ask about <strong>enjoyment</strong>.<br>
        Report how much you <strong>enjoyed</strong> ${name} by answering the following questions.</p></div>`;
        this.questions = [
            {prompt: `How much did you <strong>enjoy</strong> playing ${name}?`,
            name: `enjoyable`,
            labels: zeroToALot},
            {prompt: `How much did you <strong>like</strong> playing ${name}?`,
            name: `like`,
            labels: zeroToALot},
            {prompt: `How much did you <strong>dislike</strong> playing ${name}?`,
            name: `dislike`,
            labels: zeroToALot},
            {prompt: `How much <strong>fun</strong> did you have playing ${name}?`,
            name: `fun`,
            labels: zeroToALot},
            {prompt: `How <strong>entertaining</strong> was ${name}?`,
            name: `entertaining`,
            labels: zeroToExtremely},
        ];
        this.randomize_question_order = false;
        this.scale_width = 500;
        this.data = {block: blockName};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };
    
    p.task1_Qs = {
        timeline: [new flowQs('Hole in One', 'holeInOne'), new enjoyQs('Hole in One', 'holeInOne')]
    };

    p.task2_Qs = {
        timeline: [new flowQs('the Tile Game', 'tileGame'), new enjoyQs('the Tile Game', 'tileGame')]
    };

    p.demographics = (function() {

        const goalProbe = {
            type: jsPsychSurveyMultiChoice,
            questions: [
                {
                    prompt: `Which of the following statements best desicribes the goal you had in mind while playing the Tile Game?`,
                    name: `defineFlow`,
                    options: [`"Activate every single tile I see".`, `"Activate at least 1 of every 5 tiles I see."`, `"Build winning streaks by activing as many tiles in a row as possible.`],
                    requires: true,
                    horizontal: false,
                }],
            on_finish: (data) => {
                const correctAnswers = [`It means that the game captured my attention and sucked me in.`];
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                data.totalErrors = totalErrors;
            }
        };

        const demosIntro = {
            type: jsPsychInstructions,
            pages: [
                `<div class='parent'>
                    <p>Thank you for playing and evaluating our games!</p>
                    <p>Next, you will finish the study by answering a few final questions.</p>
                </div>`
            ],
            show_clickable_nav: true,
        };

        const gender = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>What is your gender?</p>',
            choices: ['Male', 'Female', 'Other'],
            on_finish: (data) => {
                data.gender = data.response;
            }
        };

        const age = {
            type: jsPsychSurveyText,
            questions: [{prompt: "Age:", name: "age"}],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 

        const ethnicity = {
            type: jsPsychSurveyHtmlForm,
            preamble: '<p>What is your race / ethnicity?</p>',
            html: `<div style="text-align: left">
            <p>White / Caucasian <input name="ethnicity" type="radio" value="white"/></p>
            <p>Black / African American <input name="ethnicity" type="radio" value="black"/></p>
            <p>East Asian (e.g., Chinese, Korean, Vietnamese, etc.) <input name="ethnicity" type="radio" value="east-asian"/></p>
            <p>South Asian (e.g., Indian, Pakistani, Sri Lankan, etc.) <input name="ethnicity" type="radio" value="south-asian"/></p>
            <p>Latino / Hispanic <input name="ethnicity" type="radio" value="hispanic"/></p>
            <p>Middle Eastern / North African <input name="ethnicity" type="radio" value="middle-eastern"/></p>
            <p>Indigenous / First Nations <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Bi-racial <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Other <input name="other" type="text"/></p>
            </div>`,
            on_finish: (data) => {
                data.ethnicity = data.response.ethnicity;
                data.other = data.response.other;
            }
        };

        const english = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>Is English your native language?:</p>',
            choices: ['Yes', 'No'],
            on_finish: (data) => {
                data.english = data.response;
            }
        };  

        const finalWord = {
            type: jsPsychSurveyText,
            questions: [{prompt: "Questions? Comments? Complains? Provide your feedback here!", rows: 10, columns: 100, name: "finalWord"}],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 


        const demos = {
            timeline: [goalProbe, demosIntro, gender, age, ethnicity, english, finalWord]
        };

        return demos;

    }());

   /*
    *
    *  END TASK
    *
    */


    p.save_data = {
        type: jsPsychPipe,
        action: "save",
        experiment_id: "zVSVXcJyNugh",
        filename: dmPsych.filename,
        data_string: ()=>jsPsych.data.get().csv()
    };

    return p;

}());

const timeline = [exp.consent, exp.surveyIntro, 
    exp.preFull_task1, exp.task1, exp.task1_Qs,
    exp.intro_task2, exp.prePractice_task2, exp.practice2, exp.practiceComplete, exp.postPractice_task2, exp.preTask_task2, exp.task2, exp.task2_Qs,
    exp.demographics, exp.save_data];

// initiate timeline
jsPsych.run(timeline);
