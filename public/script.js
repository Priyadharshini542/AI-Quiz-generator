// script.js
const topicScreen = document.getElementById('topic-screen');
const quizScreen = document.getElementById('quiz-screen');
const scoreScreen = document.getElementById('score-screen');
const loading = document.getElementById('loading');

const topicInput = document.getElementById('topic-input');
const generateBtn = document.getElementById('generate-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const errorMessage = document.getElementById('error-message');

const quizTopicHeader = document.getElementById('quiz-topic');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const finalScoreSpan = document.getElementById('final-score');

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

// --- Utility Functions ---

function showScreen(screen) {
    topicScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    scoreScreen.classList.add('hidden');
    loading.classList.add('hidden');
    screen.classList.remove('hidden');
}

function displayQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        showScore();
        return;
    }

    const currentQ = quizData[currentQuestionIndex];
    questionText.textContent = `${currentQuestionIndex + 1}/10: ${currentQ.question}`;
    optionsContainer.innerHTML = '';
    selectedAnswer = null;
    nextBtn.disabled = true;

    currentQ.options.forEach(optionText => {
        const option = document.createElement('div');
        option.textContent = optionText;
        option.classList.add('option');
        option.addEventListener('click', () => selectOption(option, optionText));
        optionsContainer.appendChild(option);
    });
}

function selectOption(selectedElement, answerText) {
    // Deselect all other options
    Array.from(optionsContainer.children).forEach(opt => {
        opt.classList.remove('selected');
    });

    // Select the clicked option
    selectedElement.classList.add('selected');
    selectedAnswer = answerText;
    nextBtn.disabled = false;
}

function checkAnswer() {
    if (selectedAnswer) {
        const currentQ = quizData[currentQuestionIndex];
        if (selectedAnswer === currentQ.correct_answer) {
            score++;
        }
    }
}

function showScore() {
    finalScoreSpan.textContent = score;
    showScreen(scoreScreen);
}

// --- Event Handlers ---

generateBtn.addEventListener('click', async () => {
    const topic = topicInput.value.trim();
    if (!topic) {
        errorMessage.textContent = 'Please enter a topic.';
        return;
    }

    errorMessage.textContent = '';
    showScreen(loading);
    
    try {
        const response = await fetch('/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Validate the structure
        if (result && result.quiz && result.quiz.length === 10) {
            quizData = result.quiz;
            currentQuestionIndex = 0;
            score = 0;
            quizTopicHeader.textContent = topic;
            displayQuestion();
            showScreen(quizScreen);
        } else {
            throw new Error('Invalid quiz format received from AI. Try again.');
        }

    } catch (error) {
        console.error('Quiz Generation Failed:', error);
        errorMessage.textContent = `Error: ${error.message}. Please check server and try again.`;
        showScreen(topicScreen); // Go back to the input screen on failure
    }
});

nextBtn.addEventListener('click', () => {
    checkAnswer();
    currentQuestionIndex++;
    displayQuestion();
});

restartBtn.addEventListener('click', () => {
    topicInput.value = '';
    showScreen(topicScreen);
});

// Initial load
showScreen(topicScreen);