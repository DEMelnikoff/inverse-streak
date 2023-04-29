var exp = (function() {

    let p = {};

    // randomly assign to conditions and save settings
    const settings = {
        pM: Array(.87, .13)[Math.floor(Math.random()*2)],
        gameType: ['strk', 'invStrk'][Math.floor(Math.random()*2)],
        val: 6,
        nTrials: 62,
        basePay: 10,
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
    function MakePostPractice_tileGame({gameType, pM, val, plural}) {

        const info = {
            type: jsPsychInstructions,
            pages: dmPsych.postPractice_tileGame({gameType, pM, val, plural}),
            show_clickable_nav: true,
        };

        const compChk1 = {
            type: jsPsychSurveyHtmlForm,
            preamble: `<div style="font-size:16px"><p>To make sure you understand the full version of <strong>The Tile Game</strong>, please answer the following question:</p></div>`,
            html: `<div class='parent' style="height: 300px; font-size: 16px">
                <p>For most players, what is the probability of activating the tile?</p>
                <select name="attnChk1" style="font-size: 16px"><option value="0">0%</option><option value="13">13%</option><option value="50">50%</option><option value="87">87%</option><option value="100">100%</option></select>
                </div>`,
            on_finish: (data) => {
                const correctAnswers = [String(pM*100)]
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                data.totalErrors = totalErrors;
            }
        };

        let compChk2;

        if (gameType == 'invStrk') {
            compChk2 = {
                type: jsPsychSurveyHtmlForm,
                preamble: `<div style="font-size:16px"><p>To make sure you understand the full version of <strong>The Tile Game</strong>, please answer the following questions:</p></div>`,
                html: `<div class='parent' style='height:600px; font-size: 16px'>
                    <p>If you activate the tile on your 1st of 5 attempts, how much money will you win?</p>
                    <select name="attnChk2" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="4">4 cents</option><option value="3">3 cents</option><option value="2">2 cents</option><option value="1">1 cent</option><option value=".5">.5 cents</option><option value="0">0 cents</option></select>
                    <p>If you activate the tile on your 2nd of 5 attempts, how much money will you win?</p>
                    <select name="attnChk3" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="4">4 cents</option><option value="3">3 cents</option><option value="2">2 cents</option><option value="1">1 cent</option><option value=".5">.5 cents</option><option value="0">0 cents</option></select>
                    <p>If you activate the tile on your 3rd of 5 attempts, how much money will you win?</p>
                    <select name="attnChk4" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="4">4 cents</option><option value="3">3 cents</option><option value="2">2 cents</option><option value="1">1 cent</option><option value=".5">.5 cents</option><option value="0">0 cents</option></select>
                    <p>If you activate the tile on your 4th of 5 attempts, how much money will you win?</p>
                    <select name="attnChk5" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="4">4 cents</option><option value="3">3 cents</option><option value="2">2 cents</option><option value="1">1 cent</option><option value=".5">.5 cents</option><option value="0">0 cents</option></select>
                    <p>If you activate the tile on your 5th of 5 attempts, how much money will you win?</p>
                    <select name="attnChk6" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="4">4 cents</option><option value="3">3 cents</option><option value="2">2 cents</option><option value="1">1 cent</option><option value=".5">.5 cents</option><option value="0">0 cents</option></select>
                    <p>If you fail to activate the tile before the round ends, how much money will you win?</p>
                    <select name="attnChk7" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="4">4 cents</option><option value="3">3 cents</option><option value="2">2 cents</option><option value="1">1 cent</option><option value=".5">.5 cents</option><option value="0">0 cents</option></select>
                    </div>`,
                on_finish: (data) => {
                    const correctAnswers = ['4', '3', '2', '1', '.5', '0'];
                    const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                    data.totalErrors = totalErrors;
                }
            };
        };

        if (gameType == 'strk') {
            compChk2 = {
                type: jsPsychSurveyHtmlForm,
                preamble: `<div style="font-size:16px"><p>To make sure you understand the full version of <strong>The Tile Game</strong>, please answer the following questions:</p></div>`,
                html: `<div class='parent' style='height:600px; font-size: 16px'>
                    <p>If you activate the tile 0 times in a row, how much money will you win?</p>
                    <select name="attnChk2" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="0">0 cents</option><option value="6">6 cents</option><option value="12">12 cents</option><option value="18">18 cent</option><option value="24">24 cents</option><option value="30">30 cents</option></select>
                    <p>If you activate the tile 1 time in a row, how much money will you win?</p>
                    <select name="attnChk3" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="0">0 cents</option><option value="6">6 cents</option><option value="12">12 cents</option><option value="18">18 cent</option><option value="24">24 cents</option><option value="30">30 cents</option></select>
                    <p>If you activate the tile 2 times in a row, how much money will you win?</p>
                    <select name="attnChk4" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="0">0 cents</option><option value="6">6 cents</option><option value="12">12 cents</option><option value="18">18 cent</option><option value="24">24 cents</option><option value="30">30 cents</option></select>
                    <p>If you activate the tile 3 times in a row, how much money will you win?</p>
                    <select name="attnChk5" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="0">0 cents</option><option value="6">6 cents</option><option value="12">12 cents</option><option value="18">18 cent</option><option value="24">24 cents</option><option value="30">30 cents</option></select>
                    <p>If you activate the tile 4 time in a row, how much money will you win?</p>
                    <select name="attnChk6" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="0">0 cents</option><option value="6">6 cents</option><option value="12">12 cents</option><option value="18">18 cent</option><option value="24">24 cents</option><option value="30">30 cents</option></select>
                    <p>If you activate the tile 5 times in a row, how much money will you win?</p>
                    <select name="attnChk7" style="font-size: 16px"><option value="" selected disabled hidden>Choose here</option><option value="0">0 cents</option><option value="6">6 cents</option><option value="12">12 cents</option><option value="18">18 cent</option><option value="24">24 cents</option><option value="30">30 cents</option></select>
                    </div>`,
                on_finish: (data) => {
                    const correctAnswers = ['0', '6', '12', '18', '24', '30'];
                    const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                    data.totalErrors = totalErrors;
                }
            };
        };

        const errorMessage = {
            type: jsPsychInstructions,
            pages: [`<div class='parent'><p>You provided a wrong answer.<br>To make sure you understand the game, please continue to re-read the instructions.</p></div>`],
            show_clickable_nav: true,
        };

        const conditionalNode = {
            timeline: [errorMessage],
            conditional_function: () => {
                const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            }
        };

        this.timeline = [info, compChk1, compChk2, conditionalNode];
        this.loop_function = () => {
            const fail = jsPsych.data.get().last(3).select('totalErrors').sum() > 0 ? true : false;
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

    p.surveyIntro = new MakeSurveyIntro()

    p.consent = {
        type: jsPsychInstructions,
        pages: dmPsych.consentForm(settings),
        show_clickable_nav: true,
    };

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
        friction: .02,
        tension: .008,
        prompt: `<div class='instructions'>

        <p><strong>Hole in One</strong>. The goal of Hole in One is to shoot the ball through the hole.<br>
        Follow the instructions in the game area, then play Hole in One. 
        We'll let you know when time is up.</p></div>`,
        data: {block: 'holeInOne'}
    };

    p.practice2 = new dmPsych.MakeTileGame(settings, settings.gameType, 10, .5, false, 'practice');

    p.task2 = new dmPsych.MakeTileGame(settings, settings.gameType, settings.nTrials, settings.pM, true, 'tileGame');


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

        const demosIntro = {
            type: jsPsychInstructions,
            pages: [
                `<div class='parent'>
                    <p>Thank you for playing and evaluating our games!</p>
                    <p>Next, you will finish the study by completing a few surveys.</p>
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
            timeline: [demosIntro, gender, age, ethnicity, english, finalWord]
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

const timeline = [exp.surveyIntro, exp.preFull_task1, exp.task1, exp.task1_Qs,
    exp.intro_task2, exp.prePractice_task2, exp.practice2, exp.practiceComplete, exp.postPractice_task2, 
    exp.preTask_task2, exp.task2, exp.task2_Qs,
    exp.demographics, exp.save_data];

// initiate timeline
jsPsych.run(timeline);
