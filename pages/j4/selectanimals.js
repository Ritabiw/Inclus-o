const niveis = [
    { word: "COW", pt: "COW", sub: "(VACA)", img: "../j3/photos/vaca.jpg", audio: "audio/cow.mp3" },
    { word: "PIG", pt: "PIG", sub: "(PORCO)", img: "../j3/photos/porco.jpg", audio: "audio/pig.mp3" },
    
    { word: "BIRD", pt: "BIRD", sub: "(PÁSSARO)", img: "../j3/photos/passaro.jpg", audio: "audio/bird.mp3" },
    { word: "CAT", pt: "CAT", sub: "(GATO)", img: "../j3/photos/gato.jpg", audio: "audio/cat.mp3" },
    { word: "DOG", pt: "DOG", sub: "(CACHORRO)", img: "../j3/photos/cachorro.jpg", audio: "audio/dog.mp3" },
    
    { word: "LION", pt: "LION", sub: "(LEÃO)", img: "../j3/photos/leao.jpg", audio: "audio/lion.mp3" },
    { word: "FISH", pt: "FISH", sub: "(PEIXE)", img: "../j3/photos/peixe.jpg", audio: "audio/fish.mp3" },
    { word: "GOAT", pt: "GOAT", sub: "(BODE)", img: "../j3/photos/bode.jpg", audio: "audio/goat.mp3" }
];

let etapaAtual = 0;

const animalImg = document.getElementById("animal-img");
const caption = document.getElementById("caption");
const subCaption = document.getElementById("sub-caption");
const slotsContainer = document.getElementById("slots");
const lettersContainer = document.getElementById("letters");

// Pega as referências dos sons e do relógio
const clockOverlay = document.getElementById("clock-overlay");
const sfxWordCorrect = document.getElementById("sfx-word-correct");
const sfxVictory = document.getElementById("sfx-victory");

function embaralhar(array) {
    return array.sort(() => Math.random() - 0.5);
}

function carregarEtapa() {
    if (etapaAtual >= niveis.length) {
        // Toca o som final do jogo (Conquista)
        if (sfxVictory) {
            sfxVictory.currentTime = 0;
            sfxVictory.play().catch(e => console.log("Erro de áudio:", e));
        }
        setTimeout(() => {
            mostrarTelaFim();
        }, 1500); // Aguarda um momento pro som tocar antes de redirecionar
        return;
    }

    const nivel = niveis[etapaAtual];
    animalImg.src = nivel.img;
    caption.innerText = nivel.pt;
    subCaption.innerText = nivel.sub;
    
    slotsContainer.innerHTML = "";
    lettersContainer.innerHTML = "";
    slotsContainer.classList.remove("success-flash");

    let letras = nivel.word.split("");
    
    letras.forEach((letra) => {
        let slot = document.createElement("div");
        slot.classList.add("slot");
        slot.dataset.letra = letra;
        slotsContainer.appendChild(slot);
    });

    let letrasEmbaralhadas = embaralhar([...letras]);
    letrasEmbaralhadas.forEach((letra) => {
        let divLetra = document.createElement("div");
        divLetra.classList.add("letter");
        divLetra.innerText = letra;
        divLetra.dataset.letra = letra;
        
        divLetra.addEventListener('pointerdown', iniciarArraste);
        lettersContainer.appendChild(divLetra);
    });
}

let itemArrastado = null;
let offsetX = 0;
let offsetY = 0;
let paiOriginal = null;

function iniciarArraste(e) {
    if(e.target.classList.contains('correct')) return;
    
    e.preventDefault();
    itemArrastado = e.target;
    const rect = itemArrastado.getBoundingClientRect();
    
    paiOriginal = itemArrastado.parentNode;
    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    itemArrastado.style.position = 'absolute';
    itemArrastado.style.left = rect.left + 'px';
    itemArrastado.style.top = rect.top + 'px';
    itemArrastado.style.width = rect.width + 'px';
    itemArrastado.style.height = rect.height + 'px';
    itemArrastado.classList.add('dragging');
    
    document.body.appendChild(itemArrastado);

    document.addEventListener('pointermove', moverArraste);
    document.addEventListener('pointerup', soltarArraste);
}

function moverArraste(e) {
    if (!itemArrastado) return;
    itemArrastado.style.left = (e.clientX - offsetX) + 'px';
    itemArrastado.style.top = (e.clientY - offsetY) + 'px';
}

function soltarArraste(e) {
    if (!itemArrastado) return;
    
    itemArrastado.style.display = 'none';
    let elementoAbaixo = document.elementFromPoint(e.clientX, e.clientY);
    itemArrastado.style.display = 'flex';

    let slot = elementoAbaixo ? elementoAbaixo.closest('.slot') : null;

    if (slot && !slot.hasChildNodes() && slot.dataset.letra === itemArrastado.dataset.letra) {
        slot.appendChild(itemArrastado);
        itemArrastado.style.position = 'static';
        itemArrastado.classList.remove('dragging');
        itemArrastado.classList.add('correct');
        itemArrastado.style.width = '100%';
        itemArrastado.style.height = '100%';
        
        let completou = Array.from(document.querySelectorAll('.slot')).every(s => s.hasChildNodes());
        if(completou) {
            const nivel = niveis[etapaAtual];
            
            // Função que tocará o som de acerto e, ao fim dele, mostrará o relógio
            const tocarAcerto = () => {
                slotsContainer.classList.add("success-flash"); // Adiciona o efeito visual verde
                if (sfxWordCorrect) {
                    sfxWordCorrect.currentTime = 0;
                    sfxWordCorrect.play()
                        .then(() => {
                            sfxWordCorrect.onended = mostrarRelogioEPassarDeFase;
                        })
                        .catch(e => {
                            console.log("Erro de áudio:", e);
                            mostrarRelogioEPassarDeFase();
                        });
                } else {
                    mostrarRelogioEPassarDeFase();
                }
            };

            if (nivel.audio && nivel.audio.trim() !== "") {
                let animalAudio = new Audio(nivel.audio);
                animalAudio.play()
                    .then(() => {
                        // Quando a voz do animal terminar, toca o som de acerto
                        animalAudio.onended = tocarAcerto;
                    })
                    .catch(e => {
                        console.log("Erro ao tocar áudio do animal:", e);
                        tocarAcerto();
                    });
            } else {
                // Se não houver voz de animal, pula direto para o som de acerto
                tocarAcerto();
            }
        }

    } else {
        itemArrastado.style.position = 'static';
        itemArrastado.classList.remove('dragging');
        paiOriginal.appendChild(itemArrastado);
    }

    itemArrastado = null;
    document.removeEventListener('pointermove', moverArraste);
    document.removeEventListener('pointerup', soltarArraste);
}

function mostrarRelogioEPassarDeFase() {
    // Remove o efeito visual verde
    slotsContainer.classList.remove("success-flash");

    // Mostra a animação do relógio
    clockOverlay.style.display = 'flex';
    
    // Aguarda 2 segundos, esconde o relógio e passa para a próxima foto
    setTimeout(() => { 
        clockOverlay.style.display = 'none';
        etapaAtual++; 
        carregarEtapa(); 
    }, 2000);
}

function mostrarTelaFim() {
    document.getElementById("game-container").style.display = "none";
    document.querySelector("h1.container").style.display = "none";
    document.getElementById("tela-fim").style.display = "flex";
}

document.getElementById("btn-jogar").addEventListener("click", () => {
    document.getElementById("game-container").style.display = "";
    document.querySelector("h1.container").style.display = "";
    document.getElementById("tela-fim").style.display = "none";
    etapaAtual = 0;
    carregarEtapa();
});

document.getElementById("btn-inicio").addEventListener("click", () => {
    window.top.location.href = "../../../index.html"; 
});

carregarEtapa();