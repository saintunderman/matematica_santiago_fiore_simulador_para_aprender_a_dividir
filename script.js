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

    let state = { dividendoOriginal: 0, divisor: 0, pasos: [], pasoActual: 0 };

    function resetState() {
        state = { dividendoOriginal: 0, divisor: 0, pasos: [], pasoActual: 0 };
        workArea.innerHTML = ''; cocienteContainer.innerHTML = ''; dividendoContainer.textContent = ''; divisorContainer.textContent = '';
        explanationText.textContent = 'Ingresa un dividendo y un divisor, y presiona "Iniciar".';
        summaryPanel.classList.add('hidden');
        nextStepBtn.disabled = true;
        dividendoContainer.classList.remove('highlighted'); divisorContainer.classList.remove('highlighted');
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
    
    // --- MEJORA (de tu versión): La función de renderizado es más simple ---
    function ejecutarPaso(paso) {
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
                nextStepBtn.disabled = true;
                break;
            }
        }
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
        nextStepBtn.disabled = false;

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

    toggleTheoryBtn.addEventListener('click', () => {
        const hidden = theoryContent.classList.toggle('hidden');
        toggleTheoryBtn.textContent = hidden ? 'Mostrar Fundamento Teórico' : 'Ocultar Fundamento Teórico';
    });
});