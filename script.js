document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const dividendoInput = document.getElementById('dividendo');
    const divisorInput = document.getElementById('divisor');
    const startBtn = document.getElementById('start-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const dividendoContainer = document.querySelector('.dividendo-container');
    const divisorContainer = document.querySelector('.divisor-container');
    const cocienteContainer = document.querySelector('.cociente-container');
    const workArea = document.getElementById('work-area');
    const explanationText = document.getElementById('explanation-text');
    const summaryPanel = document.getElementById('summary');
    const finalResultEl = document.getElementById('final-result');
    const proofEl = document.getElementById('proof');
    const toggleTheoryBtn = document.getElementById('toggle-theory-btn');
    const theoryContent = document.getElementById('theory-content');
    
    // Nuevos elementos
    const printBtn = document.getElementById('print-btn');
    const saveBtn = document.getElementById('save-btn');
    const showExercisesBtn = document.getElementById('show-exercises-btn');
    const showHistoryBtn = document.getElementById('show-history-btn');
    const exercisesModal = document.getElementById('exercises-modal');
    const historyModal = document.getElementById('history-modal');
    const exerciseAnswer = document.getElementById('exercise-answer');
    const exerciseRemainder = document.getElementById('exercise-remainder');
    const checkAnswerBtn = document.getElementById('check-answer-btn');
    const newExerciseBtn = document.getElementById('new-exercise-btn');
    const exerciseQuestion = document.getElementById('exercise-question');
    const exerciseFeedback = document.getElementById('exercise-feedback');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const exportHistoryBtn = document.getElementById('export-history-btn');

    // Nuevas funcionalidades
    const prevStepBtn = document.getElementById('prev-step-btn');
    const resetStepsBtn = document.getElementById('reset-steps-btn');
    const navigationControls = document.getElementById('navigation-controls');
    const showVisualToggle = document.getElementById('show-visual-toggle');
    const visualRepresentation = document.getElementById('visual-representation');
    const visualObjects = document.getElementById('visual-objects');
    const visualGroups = document.getElementById('visual-groups');
    const showTimerBtn = document.getElementById('show-timer-btn');
    const timerModal = document.getElementById('timer-modal');

    let state = { dividendoOriginal: 0, divisor: 0, pasos: [], pasoActual: 0 };
    let currentExercise = null;
    let history = JSON.parse(localStorage.getItem('divisionHistory')) || [];

    function resetState() {
        workArea.innerHTML = '';
        cocienteContainer.innerHTML = '';
        dividendoContainer.textContent = '';
        divisorContainer.textContent = '';
        if (visualObjects) visualObjects.innerHTML = '';
        if (visualGroups) visualGroups.innerHTML = '';
        explanationText.textContent = 'Ingresa un dividendo y un divisor, y presiona "Iniciar".';
        summaryPanel.classList.add('hidden');
        if (nextStepBtn) nextStepBtn.disabled = true;
        if (prevStepBtn) prevStepBtn.disabled = true;
        if (navigationControls) navigationControls.classList.add('hidden');
        dividendoContainer.classList.remove('highlighted');
        divisorContainer.classList.remove('highlighted');
    }

    // Función para guardar en historial
    function saveToHistory(dividendo, divisor, cociente, resto) {
        const entry = {
            date: new Date().toLocaleString('es-AR'),
            dividendo,
            divisor,
            cociente,
            resto,
            formula: `${dividendo} = ${divisor} × ${cociente} + ${resto}`
        };
        history.unshift(entry);
        if (history.length > 50) history = history.slice(0, 50); // Limitar a 50
        localStorage.setItem('divisionHistory', JSON.stringify(history));
    }

    // --- MEJORA (de tu versión): Lógica de cálculo separada y robusta ---
    function calcularPasos(dividendo, divisor) {
        const pasos = [];
        if (dividendo < 0 || divisor < 1) return pasos; // Seguridad extra

        // Casos especiales para una respuesta inmediata
        if (dividendo === 0) {
            pasos.push({ tipo: 'finalizar', restoFinal: 0, cocienteFinal: 0, mensaje: 'Al dividir 0, el cociente es 0 y el resto es 0.' });
            return pasos;
        }
        if (dividendo < divisor) {
            pasos.push({ tipo: 'finalizar', restoFinal: dividendo, cocienteFinal: 0, mensaje: 'Como el divisor es mayor que el dividendo, el cociente es 0 y el resto es igual al dividendo.' });
            return pasos;
        }

        let dividendoParcial = dividendo;
        let cocienteAcumulado = 0;
        while (dividendoParcial >= divisor) {
            let potencia = 1;
            while (divisor * potencia * 10 <= dividendoParcial) { potencia *= 10; }

            const digitoEstimado = Math.floor(dividendoParcial / (divisor * potencia));
            if (digitoEstimado === 0) { // Safety break
                if (potencia > 1) { potencia /= 10; continue; } 
                else break;
            }

            const cocienteParcial = digitoEstimado * potencia;
            const producto = cocienteParcial * divisor;

            pasos.push({ tipo: 'estimar', dividendoActual: dividendoParcial, potencia, digitoEstimado });
            pasos.push({ tipo: 'restar', producto, nuevoDividendo: dividendoParcial - producto, cocienteAAgregar: cocienteParcial });
            dividendoParcial -= producto;
            cocienteAcumulado += cocienteParcial;
        }
        pasos.push({ tipo: 'finalizar', restoFinal: dividendoParcial, cocienteFinal: cocienteAcumulado });
        return pasos;
    }
    
    // === REPRESENTACIÓN VISUAL CON OBJETOS ===
    function createVisualObjects(count) {
        if (!visualObjects || !showVisualToggle || !showVisualToggle.checked || count > 100) return;
        
        visualObjects.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < count; i++) {
            const obj = document.createElement('div');
            obj.className = 'visual-object';
            obj.style.animationDelay = `${i * 0.02}s`;
            fragment.appendChild(obj);
        }
        visualObjects.appendChild(fragment);
    }
    
    function createVisualGroups(objectCount, groupSize) {
        if (!visualGroups || !showVisualToggle || !showVisualToggle.checked || objectCount > 100) return;
        
        visualGroups.innerHTML = '';
        const numGroups = Math.floor(objectCount / groupSize);
        const remainder = objectCount % groupSize;
        const fragment = document.createDocumentFragment();
        
        for (let g = 0; g < numGroups; g++) {
            const group = document.createElement('div');
            group.className = 'visual-group';
            group.style.animationDelay = `${g * 0.1}s`;
            
            const label = document.createElement('div');
            label.className = 'visual-group-label';
            label.textContent = `Grupo ${g + 1} (${groupSize} objetos)`;
            group.appendChild(label);
            
            const objContainer = document.createElement('div');
            objContainer.className = 'visual-group-objects';
            
            for (let i = 0; i < groupSize; i++) {
                const obj = document.createElement('div');
                obj.className = 'visual-object grouped';
                objContainer.appendChild(obj);
            }
            
            group.appendChild(objContainer);
            fragment.appendChild(group);
        }
        
        if (remainder > 0) {
            const group = document.createElement('div');
            group.className = 'visual-group';
            group.style.borderColor = '#dc3545';
            group.style.animationDelay = `${numGroups * 0.1}s`;
            
            const label = document.createElement('div');
            label.className = 'visual-group-label';
            label.style.color = '#dc3545';
            label.textContent = `Resto (${remainder} objetos)`;
            group.appendChild(label);
            
            const objContainer = document.createElement('div');
            objContainer.className = 'visual-group-objects';
            
            for (let i = 0; i < remainder; i++) {
                const obj = document.createElement('div');
                obj.className = 'visual-object';
                objContainer.appendChild(obj);
            }
            
            group.appendChild(objContainer);
            fragment.appendChild(group);
        }
        
        visualGroups.appendChild(fragment);
    }
    
    // === NAVEGACIÓN DE PASOS ===
    function renderStepAt(index) {
        if (!state.pasos || state.pasos.length === 0) return;
        if (index < -1 || index >= state.pasos.length) return;
        
        // Limpiar visualización pero mantener estado
        workArea.innerHTML = '';
        cocienteContainer.innerHTML = '';
        if (visualGroups) visualGroups.innerHTML = '';
        summaryPanel.classList.add('hidden');
        
        // Restablecer visualización inicial
        dividendoContainer.textContent = state.dividendoOriginal;
        divisorContainer.textContent = state.divisor;
        dividendoContainer.classList.add('highlighted');
        divisorContainer.classList.add('highlighted');
        createVisualObjects(state.dividendoOriginal);
        
        // Ejecutar todos los pasos hasta el índice solicitado
        if (index >= 0) {
            for (let i = 0; i <= index; i++) {
                ejecutarPaso(state.pasos[i], true);
            }
        }
        
        state.pasoActual = index + 1;
        
        if (index === -1) {
            explanationText.textContent = "Todo listo. Presiona 'Siguiente' para comenzar.";
        }
        
        updateNavigationButtons();
    }
    
    function updateNavigationButtons() {
        if (!prevStepBtn || !nextStepBtn) return;
        
        prevStepBtn.disabled = state.pasoActual <= 0;
        nextStepBtn.disabled = state.pasoActual >= state.pasos.length;
    }
    
    // --- MEJORA (de tu versión): La función de renderizado es más simple ---
    function ejecutarPaso(paso, silent = false) {
        switch (paso.tipo) {
            case 'estimar': {
                const unidad = paso.potencia === 1 ? 'unidades' : `múltiplos de ${paso.potencia}`;
                explanationText.innerHTML = `<b>Paso (Estimar)</b><br>Del número <b>${paso.dividendoActual}</b>, buscamos cuántos grupos del divisor podemos restar usando <b>${unidad}</b>.`;
                break;
            }
            case 'restar': {
                const dividendoAnterior = state.pasos[state.pasoActual - 1].dividendoActual;
                explanationText.innerHTML = `<b>Paso (Restar)</b><br>Multiplicamos <b>${paso.cocienteAAgregar} × ${state.divisor} = ${paso.producto}</b>.<br>Luego restamos: ${dividendoAnterior} - ${paso.producto} = <b>${paso.nuevoDividendo}</b>.`;
                const stepGroup = document.createElement('div'); stepGroup.className = 'step-group';
                const productoRow = document.createElement('div'); productoRow.className = 'work-row subtraction'; productoRow.textContent = `- ${paso.producto}`; stepGroup.appendChild(productoRow);
                const restoRow = document.createElement('div'); restoRow.className = 'work-row remainder'; restoRow.textContent = paso.nuevoDividendo;
                restoRow.style.minWidth = `${String(dividendoAnterior).length}ch`;
                stepGroup.appendChild(restoRow);
                workArea.appendChild(stepGroup);
                const cocienteParcialRow = document.createElement('div'); cocienteParcialRow.textContent = `+ ${paso.cocienteAAgregar}`; cocienteContainer.appendChild(cocienteParcialRow);
                stepGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                break;
            }
            case 'finalizar': {
                explanationText.innerHTML = paso.mensaje ? `<b>¡Resultado Final!</b><br>${paso.mensaje}` : `<b>¡Hemos terminado!</b><br>El resto (${paso.restoFinal}) es menor que el divisor (${state.divisor}). Sumamos los cocientes parciales.`;
                const lineaSuma = document.createElement('div'); lineaSuma.style.borderTop = '2px solid #28a745'; lineaSuma.style.marginTop = '0.2em'; cocienteContainer.appendChild(lineaSuma);
                const cocienteFinalRow = document.createElement('div'); cocienteFinalRow.textContent = paso.cocienteFinal; cocienteContainer.appendChild(cocienteFinalRow);
                summaryPanel.classList.remove('hidden');
                finalResultEl.innerHTML = `Cociente (C) = <b>${paso.cocienteFinal}</b><br>Resto (R) = <b>${paso.restoFinal}</b>`;
                const comprobacion = state.divisor * paso.cocienteFinal + paso.restoFinal;
                proofEl.innerHTML = `${state.dividendoOriginal} = ${state.divisor} × ${paso.cocienteFinal} + ${paso.restoFinal}<br><b>${state.dividendoOriginal} = ${comprobacion}</b>`;
                if (nextStepBtn) nextStepBtn.disabled = true;
                // Guardar en historial
                saveToHistory(state.dividendoOriginal, state.divisor, paso.cocienteFinal, paso.restoFinal);
                // Actualizar visualizaciones
                createVisualGroups(state.dividendoOriginal, state.divisor);
                break;
            }
        }
        if (!silent) updateNavigationButtons();
    }

    // --- Listeners ---
    startBtn.addEventListener('click', () => {
        resetState();
        const dividendo = parseInt(dividendoInput.value, 10);
        const divisor = parseInt(divisorInput.value, 10);

        if (!Number.isInteger(dividendo) || dividendo < 0) {
            explanationText.innerHTML = "<strong style='color:red;'>Error:</strong> El dividendo debe ser un entero ≥ 0."; return;
        }
        if (!Number.isInteger(divisor) || divisor < 1) {
            explanationText.innerHTML = "<strong style='color:red;'>Error:</strong> El divisor debe ser un entero ≥ 1."; return;
        }

        state.dividendoOriginal = dividendo;
        state.divisor = divisor;
        state.pasos = calcularPasos(dividendo, divisor);
        
        dividendoContainer.textContent = dividendo; divisorContainer.textContent = divisor;
        dividendoContainer.classList.add('highlighted'); divisorContainer.classList.add('highlighted');
        explanationText.textContent = "Todo listo. Presiona 'Siguiente Paso' para comenzar.";
        if (nextStepBtn) nextStepBtn.disabled = false;
        if (navigationControls) navigationControls.classList.remove('hidden');
        
        // Crear visualización inicial
        createVisualObjects(dividendo);

        // MEJORA (de tu versión): Ejecutar casos especiales inmediatamente
        if (state.pasos.length === 1 && state.pasos[0].tipo === 'finalizar') {
            ejecutarPaso(state.pasos[0]);
        }
    });

    nextStepBtn.addEventListener('click', () => {
        if (!state.pasos || state.pasoActual >= state.pasos.length) return;
        ejecutarPaso(state.pasos[state.pasoActual]);
        state.pasoActual++;
    });

    // Navegación de pasos
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            if (state.pasoActual > 0) {
                renderStepAt(state.pasoActual - 2);
            }
        });
    }

    if (resetStepsBtn) {
        resetStepsBtn.addEventListener('click', () => {
            if (state.pasos.length > 0) {
                renderStepAt(-1);
                state.pasoActual = 0;
                if (nextStepBtn) nextStepBtn.disabled = false;
                explanationText.textContent = "Todo listo. Presiona 'Siguiente Paso' para comenzar.";
            }
        });
    }

    // Toggles de visualización
    if (showVisualToggle) {
        showVisualToggle.addEventListener('change', (e) => {
            if (visualRepresentation) {
                visualRepresentation.style.display = e.target.checked ? 'block' : 'none';
                
                // Si se activa en medio del proceso, regenerar toda la visualización hasta el paso actual
                if (e.target.checked && state.pasos && state.pasos.length > 0 && state.pasoActual > 0) {
                    renderStepAt(state.pasoActual - 1);
                }
            }
        });
    }

    toggleTheoryBtn.addEventListener('click', () => {
        const hidden = theoryContent.classList.toggle('hidden');
        toggleTheoryBtn.textContent = hidden ? 'Mostrar Fundamento Teórico' : 'Ocultar Fundamento Teórico';
    });

    // === NUEVAS FUNCIONALIDADES ===

    // Soporte para teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (exercisesModal && !exercisesModal.classList.contains('hidden')) {
                return; // No interferir con modales
            }
            if (nextStepBtn && !nextStepBtn.disabled) {
                nextStepBtn.click();
            } else if ((document.activeElement === dividendoInput || document.activeElement === divisorInput) && startBtn) {
                startBtn.click();
            }
        }
    });

    // Imprimir resultados
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Guardar resultados
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const result = finalResultEl.textContent + '\n' + proofEl.textContent;
            const blob = new Blob([result], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `division_${state.dividendoOriginal}_${state.divisor}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Sistema de ejercicios
    function generateExercise() {
        const level = Math.random();
        let dividendo, divisor;
        
        if (level < 0.3) { // Fácil
            divisor = Math.floor(Math.random() * 9) + 2; // 2-10
            dividendo = Math.floor(Math.random() * 50) + 10; // 10-59
        } else if (level < 0.7) { // Medio
            divisor = Math.floor(Math.random() * 20) + 5; // 5-24
            dividendo = Math.floor(Math.random() * 200) + 50; // 50-249
        } else { // Difícil
            divisor = Math.floor(Math.random() * 50) + 10; // 10-59
            dividendo = Math.floor(Math.random() * 500) + 100; // 100-599
        }
        
        const cociente = Math.floor(dividendo / divisor);
        const resto = dividendo % divisor;
        
        return { dividendo, divisor, cociente, resto };
    }

    function showExercise() {
        currentExercise = generateExercise();
        if (exerciseQuestion) {
            exerciseQuestion.innerHTML = `<strong>Calcula:</strong> ${currentExercise.dividendo} ÷ ${currentExercise.divisor}`;
        }
        if (exerciseAnswer) exerciseAnswer.value = '';
        if (exerciseRemainder) exerciseRemainder.value = '';
        if (exerciseFeedback) {
            exerciseFeedback.innerHTML = '';
            exerciseFeedback.className = 'exercise-feedback';
        }
    }

    if (showExercisesBtn) {
        showExercisesBtn.addEventListener('click', () => {
            if (exercisesModal) {
                exercisesModal.classList.remove('hidden');
                if (!currentExercise) showExercise();
            }
        });
    }

    if (newExerciseBtn) {
        newExerciseBtn.addEventListener('click', showExercise);
    }

    if (checkAnswerBtn) {
        checkAnswerBtn.addEventListener('click', () => {
            if (!exerciseAnswer || !exerciseRemainder || !exerciseFeedback) return;
            
            const userCociente = parseInt(exerciseAnswer.value, 10);
            const userResto = parseInt(exerciseRemainder.value, 10);
            
            if (isNaN(userCociente) || isNaN(userResto)) {
                exerciseFeedback.innerHTML = '⚠️ Por favor ingresa ambos valores';
                exerciseFeedback.className = 'exercise-feedback warning';
                return;
            }
            
            if (userCociente === currentExercise.cociente && userResto === currentExercise.resto) {
                exerciseFeedback.innerHTML = '✅ ¡Excelente! Respuesta correcta';
                exerciseFeedback.className = 'exercise-feedback correct';
            } else {
                exerciseFeedback.innerHTML = `❌ Incorrecto. La respuesta es: Cociente = ${currentExercise.cociente}, Resto = ${currentExercise.resto}`;
                exerciseFeedback.className = 'exercise-feedback incorrect';
            }
        });
    }

    // Historial
    function renderHistory() {
        if (!historyList) return;
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No hay operaciones en el historial</p>';
            return;
        }
        
        historyList.innerHTML = history.map((entry, index) => `
            <div class="history-item">
                <div class="history-date">${entry.date}</div>
                <div class="history-formula">${entry.formula}</div>
            </div>
        `).join('');
    }

    if (showHistoryBtn) {
        showHistoryBtn.addEventListener('click', () => {
            renderHistory();
            if (historyModal) historyModal.classList.remove('hidden');
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
                history = [];
                localStorage.removeItem('divisionHistory');
                renderHistory();
            }
        });
    }

    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', () => {
            const text = history.map(e => `${e.date}: ${e.formula}`).join('\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'historial_divisiones.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Cerrar modales
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            if (exercisesModal) exercisesModal.classList.add('hidden');
            if (historyModal) historyModal.classList.add('hidden');
            if (timerModal) timerModal.classList.add('hidden');
        });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (exercisesModal && e.target === exercisesModal) exercisesModal.classList.add('hidden');
        if (historyModal && e.target === historyModal) historyModal.classList.add('hidden');
        if (timerModal && e.target === timerModal) timerModal.classList.add('hidden');
    });

    // === MODO CONTRARRELOJ ===
    let timerInterval = null;
    let timerData = { timeLeft: 60, correct: 0, wrong: 0, currentQuestion: null };

    function generateTimerQuestion() {
        const divisor = Math.floor(Math.random() * 12) + 2;
        const cociente = Math.floor(Math.random() * 20) + 1;
        const resto = Math.floor(Math.random() * divisor);
        const dividendo = divisor * cociente + resto;
        return { dividendo, divisor, cociente, resto };
    }

    function showTimerQuestion() {
        timerData.currentQuestion = generateTimerQuestion();
        const timerQuestion = document.getElementById('timer-question');
        const timerCociente = document.getElementById('timer-cociente');
        const timerResto = document.getElementById('timer-resto');
        const timerFeedback = document.getElementById('timer-feedback');
        
        if (timerQuestion) timerQuestion.textContent = `${timerData.currentQuestion.dividendo} ÷ ${timerData.currentQuestion.divisor} = ?`;
        if (timerCociente) timerCociente.value = '';
        if (timerResto) timerResto.value = '';
        if (timerFeedback) timerFeedback.innerHTML = '';
        
        if (timerCociente) timerCociente.focus();
    }

    function checkTimerAnswer() {
        const timerCociente = document.getElementById('timer-cociente');
        const timerResto = document.getElementById('timer-resto');
        const timerFeedback = document.getElementById('timer-feedback');
        
        if (!timerCociente || !timerResto || !timerFeedback) return false;
        
        const userCociente = parseInt(timerCociente.value, 10);
        const userResto = parseInt(timerResto.value, 10);
        
        if (isNaN(userCociente) || isNaN(userResto)) {
            timerFeedback.innerHTML = '⚠️ Ingresa ambos valores';
            timerFeedback.className = '';
            return false;
        }
        
        const correct = userCociente === timerData.currentQuestion.cociente && 
                       userResto === timerData.currentQuestion.resto;
        
        if (correct) {
            timerData.correct++;
            timerFeedback.innerHTML = '✅ ¡Correcto!';
            timerFeedback.className = 'correct';
        } else {
            timerData.wrong++;
            timerFeedback.innerHTML = `❌ Incorrecto (${timerData.currentQuestion.cociente}, ${timerData.currentQuestion.resto})`;
            timerFeedback.className = 'incorrect';
        }
        
        document.getElementById('timer-correct').textContent = timerData.correct;
        document.getElementById('timer-wrong').textContent = timerData.wrong;
        
        setTimeout(() => showTimerQuestion(), 1000);
        return correct;
    }

    function startTimer() {
        const duration = parseInt(document.getElementById('timer-duration').value, 10);
        timerData = { timeLeft: duration, correct: 0, wrong: 0, currentQuestion: null };
        
        document.getElementById('timer-setup').classList.add('hidden');
        document.getElementById('timer-game').classList.remove('hidden');
        document.getElementById('timer-correct').textContent = '0';
        document.getElementById('timer-wrong').textContent = '0';
        
        showTimerQuestion();
        
        const timerCountdown = document.getElementById('timer-countdown');
        const timerClock = document.querySelector('.timer-clock');
        
        timerInterval = setInterval(() => {
            timerData.timeLeft--;
            if (timerCountdown) timerCountdown.textContent = timerData.timeLeft;
            
            if (timerData.timeLeft <= 10 && timerClock) {
                timerClock.classList.add('warning');
            }
            
            if (timerData.timeLeft <= 0) {
                endTimer();
            }
        }, 1000);
    }

    function endTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        document.getElementById('timer-game').classList.add('hidden');
        document.getElementById('timer-results').classList.remove('hidden');
        
        const total = timerData.correct + timerData.wrong;
        const accuracy = total > 0 ? Math.round((timerData.correct / total) * 100) : 0;
        
        document.getElementById('timer-final-score').innerHTML = `
            <div style="font-size: 3rem; margin: 20px 0;">${timerData.correct}</div>
            <div style="font-size: 1.2rem;">Respuestas Correctas</div>
            <div style="margin-top: 20px; font-size: 1.1rem;">
                Precisión: <strong>${accuracy}%</strong> (${timerData.correct} correctas, ${timerData.wrong} incorrectas)
            </div>
        `;
    }

    if (showTimerBtn) {
        showTimerBtn.addEventListener('click', () => {
            if (timerModal) {
                timerModal.classList.remove('hidden');
                document.getElementById('timer-setup').classList.remove('hidden');
                document.getElementById('timer-game').classList.add('hidden');
                document.getElementById('timer-results').classList.add('hidden');
            }
        });
    }

    const startTimerBtn = document.getElementById('start-timer-btn');
    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', startTimer);
    }

    const timerSubmitBtn = document.getElementById('timer-submit-btn');
    if (timerSubmitBtn) {
        timerSubmitBtn.addEventListener('click', checkTimerAnswer);
    }

    const timerSkipBtn = document.getElementById('timer-skip-btn');
    if (timerSkipBtn) {
        timerSkipBtn.addEventListener('click', () => {
            timerData.wrong++;
            document.getElementById('timer-wrong').textContent = timerData.wrong;
            showTimerQuestion();
        });
    }

    const timerRestartBtn = document.getElementById('timer-restart-btn');
    if (timerRestartBtn) {
        timerRestartBtn.addEventListener('click', () => {
            document.getElementById('timer-results').classList.add('hidden');
            document.getElementById('timer-setup').classList.remove('hidden');
        });
    }

    // Permitir Enter en inputs del timer
    ['timer-cociente', 'timer-resto'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    checkTimerAnswer();
                }
            });
        }
    });
});
