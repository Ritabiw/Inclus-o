const animaisDisponiveis = [
    { id: "cow", nome: "Cow", img: "../j3/photos/vaca.jpg", audio: "../j4/audio/cow.mp3" },
    { id: "pig", nome: "Pig", img: "../j3/photos/porco.jpg", audio: "../j4/audio/pig.mp3" },
    { id: "bird", nome: "Bird", img: "../j3/photos/passaro.jpg", audio: "../j4/audio/bird.mp3" },
    { id: "cat", nome: "Cat", img: "../j3/photos/gato.jpg", audio: "../j4/audio/cat.mp3" },
    { id: "dog", nome: "Dog", img: "../j3/photos/cachorro.jpg", audio: "../j4/audio/dog.mp3" },
    { id: "lion", nome: "Lion", img: "../j3/photos/leao.jpg", audio: "../j4/audio/lion.mp3" },
    { id: "fish", nome: "Fish", img: "../j3/photos/peixe.jpg", audio: "../j4/audio/fish.mp3" },
    { id: "goat", nome: "Goat", img: "../j3/photos/bode.jpg", audio: "../j4/audio/goat.mp3" }
];

// Pré-carrega os áudios para que toquem imediatamente sem nenhum atraso
animaisDisponiveis.forEach(animal => {
    animal.audioObj = new Audio(animal.audio);
    animal.audioObj.preload = "auto";
});

const fases = [2, 2, 3, 3, 4,4]; // 2 fases de 3, 3 fases de 4 e 2 fases de 6
let faseAtual = 0;

let animaisUsadosHistorico = [];
let conexoesFeitas = 0;
let totalConexoes = 0;

const leftColumn = document.getElementById('left-column');
const rightColumn = document.getElementById('right-column');
const svg = document.getElementById('lines-svg');
const sfxCorrect = document.getElementById('sfx-correct');
const sfxConquista = document.getElementById('sfx-conquista');

let arrastando = false;
let itemOrigem = null;
let linhaTemp = null;

function embaralhar(array) {
    return array.sort(() => Math.random() - 0.5);
}

function iniciarRodada() {
    conexoesFeitas = 0;
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';
    svg.innerHTML = '';
    
    totalConexoes = fases[faseAtual];
    
    // Filtra os animais para não repetir os já usados ao longo das rodadas
    let animaisDisponiveisFiltrados = animaisDisponiveis.filter(a => !animaisUsadosHistorico.includes(a.id));
    
    // Se não houver animais inéditos suficientes, reseta o histórico
    // MAS preserva os animais da rodada anterior para não repetirem em seguida!
    if (animaisDisponiveisFiltrados.length < totalConexoes) {
        animaisUsadosHistorico = faseAtual > 0 ? animaisUsadosHistorico.slice(-fases[faseAtual - 1]) : [];
        animaisDisponiveisFiltrados = animaisDisponiveis.filter(a => !animaisUsadosHistorico.includes(a.id));
    }
    
    let animaisRodada = embaralhar([...animaisDisponiveisFiltrados]).slice(0, totalConexoes);
    animaisUsadosHistorico.push(...animaisRodada.map(a => a.id));
    
    let ordemImagens = embaralhar([...animaisRodada]);
    let ordemNomes = embaralhar([...animaisRodada]);
    
    // Garante que a imagem e o nome não fiquem na mesma reta horizontal
    let tentativas = 0;
    while (ordemImagens.some((animal, i) => animal.id === ordemNomes[i].id) && tentativas < 20) {
        ordemNomes = embaralhar([...animaisRodada]);
        tentativas++;
    }
    
    ordemImagens.forEach(animal => {
        let divImg = document.createElement('div');
        divImg.classList.add('animal-img');
        divImg.dataset.id = animal.id;
        divImg.dataset.tipo = 'img';
        
        let img = document.createElement('img');
        img.src = animal.img;
        divImg.appendChild(img);
        
        leftColumn.appendChild(divImg);
        adicionarEventos(divImg);
    });
    
    ordemNomes.forEach(animal => {
        let divNome = document.createElement('div');
        divNome.classList.add('animal-name');
        divNome.dataset.id = animal.id;
        divNome.dataset.tipo = 'nome';
        divNome.innerText = animal.nome;
        
        rightColumn.appendChild(divNome);
        adicionarEventos(divNome);
    });
}

function adicionarEventos(elemento) {
    elemento.addEventListener('mousedown', iniciarArraste);
    elemento.addEventListener('touchstart', iniciarArraste, { passive: false });
}

function obterCentro(elemento) {
    const rect = elemento.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2 - svgRect.left,
        y: rect.top + rect.height / 2 - svgRect.top
    };
}

function iniciarArraste(e) {
    if (e.currentTarget.classList.contains('conectado')) return;
    
    e.preventDefault();
    arrastando = true;
    itemOrigem = e.currentTarget;
    itemOrigem.classList.add('selecionado');
    
    const centro = obterCentro(itemOrigem);
    
    linhaTemp = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linhaTemp.setAttribute('x1', centro.x);
    linhaTemp.setAttribute('y1', centro.y);
    linhaTemp.setAttribute('x2', centro.x);
    linhaTemp.setAttribute('y2', centro.y);
    linhaTemp.setAttribute('stroke', '#f1c40f'); // Cor da linha enquanto é arrastada
    
    svg.appendChild(linhaTemp);
    
    document.addEventListener('mousemove', moverArraste);
    document.addEventListener('touchmove', moverArraste, { passive: false });
    
    document.addEventListener('mouseup', encerrarArraste);
    document.addEventListener('touchend', encerrarArraste);
}

function obterCoordenadasPointer(e) {
    let clientX, clientY;
    if (e.type.includes('touch')) {
        const touch = e.touches.length > 0 ? e.touches[0] : (e.changedTouches.length > 0 ? e.changedTouches[0] : null);
        if (touch) {
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            return { x: 0, y: 0, clientX: 0, clientY: 0 };
        }
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const svgRect = svg.getBoundingClientRect();
    return {
        x: clientX - svgRect.left,
        y: clientY - svgRect.top,
        clientX,
        clientY
    };
}

function moverArraste(e) {
    if (!arrastando || !linhaTemp) return;
    e.preventDefault();
    
    const pos = obterCoordenadasPointer(e);
    linhaTemp.setAttribute('x2', pos.x);
    linhaTemp.setAttribute('y2', pos.y);
}

function encerrarArraste(e) {
    if (!arrastando) return;
    
    const pos = obterCoordenadasPointer(e);
    
    // Identificar o elemento onde o ponteiro foi solto
    let elementoAlvo = document.elementFromPoint(pos.clientX, pos.clientY);
    let itemDestino = elementoAlvo ? elementoAlvo.closest('.animal-img, .animal-name') : null;
    
    let conectadoSucesso = false;
    
    if (itemDestino && !itemDestino.classList.contains('conectado')) {
        if (itemDestino.dataset.id === itemOrigem.dataset.id && itemDestino.dataset.tipo !== itemOrigem.dataset.tipo) {
            conectadoSucesso = true;
            
            const centroDestino = obterCentro(itemDestino);
            linhaTemp.setAttribute('x2', centroDestino.x);
            linhaTemp.setAttribute('y2', centroDestino.y);
            linhaTemp.setAttribute('stroke', '#2ecc71'); // Verde ao acertar a conexão
            
            itemOrigem.classList.remove('selecionado');
            itemOrigem.classList.add('conectado');
            itemDestino.classList.add('conectado');
            
            linhaTemp = null; // Mantém a linha
            conexoesFeitas++;
            
            // Salva se ESTA conexão exata foi a responsável por concluir a fase
            const ehUltimaConexao = (conexoesFeitas === totalConexoes);
            const fimDeBloco = ehUltimaConexao && ((faseAtual === fases.length - 1) || (fases[faseAtual] !== fases[faseAtual + 1]));

            // Toca o som de acerto imediatamente sempre que conectar certo
            if (sfxCorrect) {
                sfxCorrect.currentTime = 0;
                sfxCorrect.play().catch(err => console.log(err));
            }

            // Função isolada para evitar repetição de código no avanço de fase
            const finalizarConexao = (tempoEspera = 500) => {
                if (fimDeBloco) {
                    if (sfxConquista) {
                        sfxConquista.currentTime = 0;
                        sfxConquista.play().catch(err => console.log(err));
                    }
                    setTimeout(avancarFase, 2000);
                } else {
                    setTimeout(avancarFase, tempoEspera);
                }
            };

            let animalData = animaisDisponiveis.find(a => a.id === itemDestino.dataset.id);
            if (animalData && animalData.audioObj) {
                animalData.audioObj.currentTime = 0;
                animalData.audioObj.onended = null; // Limpa eventos antigos
                
                // Trava de segurança para impedir que o navegador dispare o som duas vezes
                let executouFim = false; 

                if (ehUltimaConexao) {
                    // Só avança a fase ou toca a conquista DEPOIS que a voz do animal terminar
                    animalData.audioObj.onended = () => {
                        if (executouFim) return; // Se já tocou, cancela a repetição do bug
                        executouFim = true;
                        
                        animalData.audioObj.onended = null;
                        finalizarConexao(500);
                    };
                }
                
                animalData.audioObj.play().catch(err => console.log(err));
            } else if (ehUltimaConexao) {
                // Fallback de segurança caso o animal esteja sem áudio configurado
                finalizarConexao(1500);
            }
        }
    }
    
    if (!conectadoSucesso) {
        if (linhaTemp) {
            svg.removeChild(linhaTemp);
            linhaTemp = null;
        }
        itemOrigem.classList.remove('selecionado');
    }
    
    arrastando = false;
    itemOrigem = null;
    
    document.removeEventListener('mousemove', moverArraste);
    document.removeEventListener('touchmove', moverArraste);
    document.removeEventListener('mouseup', encerrarArraste);
    document.removeEventListener('touchend', encerrarArraste);
}

function avancarFase() {
    if (faseAtual < fases.length - 1) {
        faseAtual++;
        iniciarRodada();
    } else {
        document.getElementById("tela-fim").style.display = "flex";
    }
}

document.getElementById("btn-jogar").addEventListener("click", () => {
    document.getElementById("tela-fim").style.display = "none";
    faseAtual = 0;
    animaisUsadosHistorico = [];
    iniciarRodada();
});

document.getElementById("btn-inicio").addEventListener("click", () => {
    window.top.location.href = "../../index.html"; 
});

// Em caso de redimensionamento da janela, recarregamos para que o SVG não fique torto
window.addEventListener('resize', () => {
    if (conexoesFeitas < totalConexoes && totalConexoes > 0) {
        iniciarRodada();
    }
});

iniciarRodada();