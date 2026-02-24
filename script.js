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
    const stepNumberEl = document.getElementById('step-number');
    const stepTotalEl = document.getElementById('step-total');
    const openVisualWindowBtn = document.getElementById('open-visual-window-btn');
    
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
    const showTimerBtn = document.getElementById('show-timer-btn');
    const timerModal = document.getElementById('timer-modal');

    let state = { dividendoOriginal: 0, divisor: 0, pasos: [], pasoActual: 0 };
    let currentExercise = null;
    let history = JSON.parse(localStorage.getItem('divisionHistory')) || [];
    let visualWindow = null; // Ventana para visualización
    
    // Función para actualizar el indicador de paso
    function updateStepIndicator() {
        if (stepNumberEl && stepTotalEl && state.pasos.length > 0) {
            stepNumberEl.textContent = `Paso ${state.pasoActual}`;
            stepTotalEl.textContent = `de ${state.pasos.length}`;
        } else if (stepNumberEl && stepTotalEl) {
            stepNumberEl.textContent = 'Paso 0';
            stepTotalEl.textContent = '';
        }
    }

    function resetState() {
        workArea.innerHTML = '';
        cocienteContainer.innerHTML = '';
        dividendoContainer.textContent = '';
        divisorContainer.textContent = '';
        explanationText.textContent = 'Ingresa un dividendo y un divisor, y presiona "Comenzar".';
        summaryPanel.classList.add('hidden');
        if (nextStepBtn) nextStepBtn.disabled = true;
        if (prevStepBtn) prevStepBtn.disabled = true;
        if (navigationControls) navigationControls.classList.add('hidden');
        dividendoContainer.classList.remove('highlighted');
        divisorContainer.classList.remove('highlighted');
        updateStepIndicator();
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
    
    // Función para abrir ventana de visualización
    function openVisualWindow() {
        if (visualWindow && !visualWindow.closed) {
            visualWindow.focus();
            return;
        }
        
        const dividendo = parseInt(dividendoInput.value, 10);
        const divisor = parseInt(divisorInput.value, 10);
        
        if (!Number.isInteger(dividendo) || dividendo < 0 || !Number.isInteger(divisor) || divisor < 1) {
            alert('Por favor, ingresa valores válidos para dividendo y divisor antes de abrir la ventana de visualización.');
            return;
        }
        
        if (dividendo > 100) {
            alert('La representación visual está disponible solo para dividendos entre 1 y 100.');
            return;
        }
        
        visualWindow = window.open('', 'Visualización de División', 'width=900,height=700,scrollbars=yes,resizable=yes');
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualización: ${dividendo} ÷ ${divisor}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2rem;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.2rem;
        }
        .visual-section {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            border: 3px solid #667eea;
        }
        .section-title {
            font-size: 1.3rem;
            color: #667eea;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }
        #visual-objects {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            min-height: 120px;
            justify-content: center;
            align-items: center;
        }
        .visual-object {
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            animation: popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .visual-object:hover {
            transform: scale(1.2) rotate(15deg);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.2); opacity: 1; }
            80% { transform: scale(0.95); }
            100% { transform: scale(1); opacity: 1; }
        }
        #visual-groups {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
            justify-content: center;
        }
        .visual-group {
            padding: 20px;
            border: 4px dashed #667eea;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.9);
            animation: groupForm 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            transition: all 0.3s ease;
        }
        .visual-group:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .visual-group-label {
            text-align: center;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .visual-group-objects {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
        }
        .visual-object.grouped {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .resto-group {
            border-color: #dc3545 !important;
        }
        .resto-group .visual-group-label {
            color: #dc3545 !important;
        }
        @keyframes groupForm {
            0% { transform: scale(0.7) translateY(30px); opacity: 0; }
            60% { transform: scale(1.05) translateY(-5px); opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .info-box {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
            font-size: 1.1rem;
            font-weight: bold;
            color: #333;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 1.2rem;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Visualización de División</h1>
        <div class="subtitle">${dividendo} ÷ ${divisor}</div>
        
        <div class="info-box">
            💡 Esta ventana muestra la representación visual de la división
        </div>
        
        <div class="visual-section">
            <div class="section-title">🔵 Total de Objetos: ${dividendo}</div>
            <div id="visual-objects"></div>
        </div>
        
        <div class="visual-section">
            <div class="section-title">📦 Agrupando en Grupos de ${divisor}</div>
            <div id="visual-groups"></div>
        </div>
    </div>
    
    <script>
        const dividendo = ${dividendo};
        const divisor = ${divisor};
        
        function createVisualObjects() {
            const container = document.getElementById('visual-objects');
            for (let i = 0; i < dividendo; i++) {
                const obj = document.createElement('div');
                obj.className = 'visual-object';
                obj.style.animationDelay = \`\${i * 0.03}s\`;
                container.appendChild(obj);
            }
        }
        
        function createVisualGroups() {
            const container = document.getElementById('visual-groups');
            const numGroups = Math.floor(dividendo / divisor);
            const remainder = dividendo % divisor;
            
            for (let g = 0; g < numGroups; g++) {
                const group = document.createElement('div');
                group.className = 'visual-group';
                group.style.animationDelay = \`\${g * 0.15}s\`;
                
                const label = document.createElement('div');
                label.className = 'visual-group-label';
                label.textContent = \`Grupo \${g + 1} (\${divisor} objetos)\`;
                group.appendChild(label);
                
                const objContainer = document.createElement('div');
                objContainer.className = 'visual-group-objects';
                
                for (let i = 0; i < divisor; i++) {
                    const obj = document.createElement('div');
                    obj.className = 'visual-object grouped';
                    obj.style.animationDelay = \`\${(g * divisor + i) * 0.03}s\`;
                    objContainer.appendChild(obj);
                }
                
                group.appendChild(objContainer);
                container.appendChild(group);
            }
            
            if (remainder > 0) {
                const group = document.createElement('div');
                group.className = 'visual-group resto-group';
                group.style.animationDelay = \`\${numGroups * 0.15}s\`;
                
                const label = document.createElement('div');
                label.className = 'visual-group-label';
                label.textContent = \`⚠️ Resto (\${remainder} objetos)\`;
                group.appendChild(label);
                
                const objContainer = document.createElement('div');
                objContainer.className = 'visual-group-objects';
                
                for (let i = 0; i < remainder; i++) {
                    const obj = document.createElement('div');
                    obj.className = 'visual-object';
                    obj.style.animationDelay = \`\${(numGroups * divisor + i) * 0.03}s\`;
                    objContainer.appendChild(obj);
                }
                
                group.appendChild(objContainer);
                container.appendChild(group);
            }
        }
        
        // Crear visualizaciones al cargar
        setTimeout(() => {
            createVisualObjects();
            setTimeout(() => createVisualGroups(), 500);
        }, 300);
    </script>
</body>
</html>
        `;
        
        visualWindow.document.write(htmlContent);
        visualWindow.document.close();
    }
    
    // Event listener para botón de ventana visual
    if (openVisualWindowBtn) {
        openVisualWindowBtn.addEventListener('click', openVisualWindow);
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
    
    function updateNavigationButtons() {
        if (!prevStepBtn || !nextStepBtn) return;
        
        prevStepBtn.disabled = state.pasoActual <= 0;
        nextStepBtn.disabled = state.pasoActual >= state.pasos.length;
        updateStepIndicator();
    }
    
    // --- MEJORA (de tu versión): La función de renderizado es más simple ---
    function ejecutarPaso(paso, silent = false) {
        switch (paso.tipo) {
            case 'estimar': {
                const unidad = paso.potencia === 1 ? 'unidades' : `múltiplos de ${paso.potencia}`;
                explanationText.innerHTML = `
                    <div style="padding: 10px; background: rgba(102, 126, 234, 0.1); border-radius: 8px; margin: 10px 0;">
                        <strong style="color: #667eea; font-size: 1.1rem;">🔍 Estimación</strong><br><br>
                        Del número <strong style="color: #764ba2; font-size: 1.2rem;">${paso.dividendoActual}</strong>, buscamos cuántos grupos del divisor
                        <strong style="color: #764ba2; font-size: 1.2rem;">${state.divisor}</strong> podemos restar.<br><br>
                        Trabajamos con <strong style="color: #667eea;">${unidad}</strong> para hacer el cálculo más eficiente.
                    </div>
                `;
                break;
            }
            case 'restar': {
                const dividendoAnterior = state.pasos[state.pasoActual - 1].dividendoActual;
                explanationText.innerHTML = `
                    <div style="padding: 10px; background: rgba(211, 51, 132, 0.1); border-radius: 8px; margin: 10px 0;">
                        <strong style="color: #d63384; font-size: 1.1rem;">➖ Operación de Resta</strong><br><br>
                        <div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0;">
                            Multiplicamos: <strong style="color: #28a745;">${paso.cocienteAAgregar}</strong> × 
                            <strong style="color: #007bff;">${state.divisor}</strong> = 
                            <strong style="color: #d63384; font-size: 1.2rem;">${paso.producto}</strong>
                        </div>
                        Luego restamos del dividendo parcial:<br>
                        <div style="background: white; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 1.1rem;">
                            ${dividendoAnterior} - ${paso.producto} = <strong style="color: #6f42c1; font-size: 1.3rem;">${paso.nuevoDividendo}</strong>
                        </div>
                    </div>
                `;
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
                explanationText.innerHTML = paso.mensaje ? 
                    `<div style="padding: 15px; background: rgba(40, 167, 69, 0.1); border-radius: 8px; border: 2px solid #28a745;">
                        <strong style="color: #28a745; font-size: 1.2rem;">✅ ¡Resultado Final!</strong><br><br>
                        ${paso.mensaje}
                    </div>` : 
                    `<div style="padding: 15px; background: rgba(40, 167, 69, 0.1); border-radius: 8px; border: 2px solid #28a745;">
                        <strong style="color: #28a745; font-size: 1.2rem;">✅ ¡División Completada!</strong><br><br>
                        El resto <strong style="color: #6f42c1; font-size: 1.1rem;">(${paso.restoFinal})</strong> es menor que el divisor 
                        <strong style="color: #007bff; font-size: 1.1rem;">(${state.divisor})</strong>.<br><br>
                        Ahora sumamos todos los cocientes parciales para obtener el resultado final.
                    </div>`;
                const lineaSuma = document.createElement('div'); lineaSuma.style.borderTop = '2px solid #28a745'; lineaSuma.style.marginTop = '0.2em'; cocienteContainer.appendChild(lineaSuma);
                const cocienteFinalRow = document.createElement('div'); cocienteFinalRow.textContent = paso.cocienteFinal; cocienteContainer.appendChild(cocienteFinalRow);
                summaryPanel.classList.remove('hidden');
                finalResultEl.innerHTML = `Cociente (C) = <b>${paso.cocienteFinal}</b><br>Resto (R) = <b>${paso.restoFinal}</b>`;
                const comprobacion = state.divisor * paso.cocienteFinal + paso.restoFinal;
                proofEl.innerHTML = `${state.dividendoOriginal} = ${state.divisor} × ${paso.cocienteFinal} + ${paso.restoFinal}<br><b>${state.dividendoOriginal} = ${comprobacion}</b>`;
                if (nextStepBtn) nextStepBtn.disabled = true;
                // Guardar en historial
                saveToHistory(state.dividendoOriginal, state.divisor, paso.cocienteFinal, paso.restoFinal);
                break;
            }
        }
        if (!silent) updateNavigationButtons();
    }

    // === NAVEGACIÓN Y CONTROL DE FLUJO OPTIMIZADO ===
    
    // --- Listeners ---
    startBtn.addEventListener('click', () => {
        resetState();
        const dividendo = parseInt(dividendoInput.value, 10);
        const divisor = parseInt(divisorInput.value, 10);

        if (!Number.isInteger(dividendo) || dividendo < 0) {
            explanationText.innerHTML = "<strong style='color:red;'>⚠️ Error:</strong> El dividendo debe ser un entero ≥ 0."; return;
        }
        if (!Number.isInteger(divisor) || divisor < 1) {
            explanationText.innerHTML = "<strong style='color:red;'>⚠️ Error:</strong> El divisor debe ser un entero ≥ 1."; return;
        }

        state.dividendoOriginal = dividendo;
        state.divisor = divisor;
        state.pasos = calcularPasos(dividendo, divisor);
        state.pasoActual = 0;
        
        dividendoContainer.textContent = dividendo; divisorContainer.textContent = divisor;
        dividendoContainer.classList.add('highlighted'); divisorContainer.classList.add('highlighted');
        explanationText.innerHTML = `
            <div style="padding: 15px; background: rgba(0, 123, 255, 0.1); border-radius: 8px; border: 2px solid #007bff;">
                <strong style="color: #007bff; font-size: 1.2rem;">✅ ¡Listo para comenzar!</strong><br><br>
                Presiona <strong>'Siguiente'</strong> para ver el primer paso de la división.<br><br>
                Dividendo: <strong style="color: #764ba2;">${dividendo}</strong> | 
                Divisor: <strong style="color: #764ba2;">${divisor}</strong>
            </div>
        `;
        if (nextStepBtn) nextStepBtn.disabled = false;
        if (navigationControls) navigationControls.classList.remove('hidden');
        updateStepIndicator();

        // MEJORA: Ejecutar casos especiales inmediatamente
        if (state.pasos.length === 1 && state.pasos[0].tipo === 'finalizar') {
            state.pasoActual = 1;
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
                // Recalcular desde el principio hasta el paso anterior
                const targetStep = state.pasoActual - 2;
                workArea.innerHTML = '';
                cocienteContainer.innerHTML = '';
                summaryPanel.classList.add('hidden');
                dividendoContainer.textContent = state.dividendoOriginal;
                divisorContainer.textContent = state.divisor;
                dividendoContainer.classList.add('highlighted');
                divisorContainer.classList.add('highlighted');
                
                if (targetStep >= 0) {
                    for (let i = 0; i <= targetStep; i++) {
                        ejecutarPaso(state.pasos[i], true);
                    }
                    state.pasoActual = targetStep + 1;
                } else {
                    state.pasoActual = 0;
                    explanationText.innerHTML = `
                        <div style="padding: 15px; background: rgba(0, 123, 255, 0.1); border-radius: 8px; border: 2px solid #007bff;">
                            <strong style="color: #007bff; font-size: 1.2rem;">✅ ¡Listo para comenzar!</strong><br><br>
                            Presiona <strong>'Siguiente'</strong> para ver el primer paso de la división.
                        </div>
                    `;
                }
                
                if (nextStepBtn) nextStepBtn.disabled = false;
                updateNavigationButtons();
            }
        });
    }

    if (resetStepsBtn) {
        resetStepsBtn.addEventListener('click', () => {
            if (state.pasos.length > 0) {
                workArea.innerHTML = '';
                cocienteContainer.innerHTML = '';
                summaryPanel.classList.add('hidden');
                dividendoContainer.textContent = state.dividendoOriginal;
                divisorContainer.textContent = state.divisor;
                dividendoContainer.classList.add('highlighted');
                divisorContainer.classList.add('highlighted');
                state.pasoActual = 0;
                if (nextStepBtn) nextStepBtn.disabled = false;
                explanationText.innerHTML = `
                    <div style="padding: 15px; background: rgba(0, 123, 255, 0.1); border-radius: 8px; border: 2px solid #007bff;">
                        <strong style="color: #007bff; font-size: 1.2rem;">🔄 Reiniciado</strong><br><br>
                        Presiona <strong>'Siguiente'</strong> para comenzar nuevamente.
                    </div>
                `;
                updateStepIndicator();
            }
        });
    }

    toggleTheoryBtn.addEventListener('click', () => {
        const hidden = theoryContent.classList.toggle('hidden');
        toggleTheoryBtn.textContent = hidden ? 'Mostrar Fundamento Teórico' : 'Ocultar Fundamento Teórico';
    });

    // === FUNCIONALIDADES ADICIONALES ===

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
