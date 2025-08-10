// Aguarda o documento carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos da página
    const photoContainer = document.getElementById('photo-container');
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');

    let cycleInterval = null; // Variável para guardar nosso temporizador (setInterval)
    const CYCLE_TIME = 10000; // Tempo em milissegundos para trocar as fotos (10 segundos)

    // Função principal que busca e exibe as fotos
    const runCycle = async () => {
        try {
            // 1. Anima a saída das fotos existentes
            await fadeOutExistingPhotos();

            // 2. Busca novas fotos no servidor (no nosso PHP)
            const response = await fetch('buscar_fotos.php');
            if (!response.ok) {
                throw new Error('Falha ao buscar fotos no servidor.');
            }
            const photos = await response.json();

            // 3. Exibe as novas fotos
            displayPhotos(photos);

        } catch (error) {
            console.error("Erro no ciclo:", error);
            stopCycle(); // Para o ciclo se houver um erro
        }
    };

   // ... (todo o código anterior do script.js permanece o mesmo até a função displayPhotos)

// Função para exibir as fotos na tela (VERSÃO COM DETECÇÃO DE COLISÃO)
const displayPhotos = (photos) => {
    const photoWidth = 200; // Largura da foto + borda
    const photoHeight = 200; // Altura da foto + borda
    const maxTries = 20; // Número máximo de tentativas para encontrar um lugar vago

    const placedPhotosRects = []; // Array para guardar a posição das fotos já colocadas

    photos.forEach(photo => {
        let currentTry = 0;
        let isOverlapping;

        while (currentTry < maxTries) {
            // Gera posições e rotação aleatórias
            const top = Math.random() * (window.innerHeight - photoHeight);
            const left = Math.random() * (window.innerWidth - photoWidth);
            const rotation = (Math.random() * 90) - 45;

            // Cria um "retângulo" para a nova foto
            const newRect = {
                x: left,
                y: top,
                width: photoWidth,
                height: photoHeight
            };

            // Verifica se o novo retângulo colide com algum já existente
            isOverlapping = false;
            for (const placedRect of placedPhotosRects) {
                // Lógica de detecção de colisão (AABB - Axis-Aligned Bounding Box)
                if (newRect.x < placedRect.x + placedRect.width &&
                    newRect.x + newRect.width > placedRect.x &&
                    newRect.y < placedRect.y + placedRect.height &&
                    newRect.y + newRect.height > placedRect.y) {
                    isOverlapping = true;
                    break; // Se colidiu com um, não precisa checar os outros
                }
            }

            // Se NÃO está sobrepondo, encontramos um lugar!
            if (!isOverlapping) {
                const img = document.createElement('img');
                img.src = photo.caminho_arquivo;
                img.className = 'photo-item';
                
                img.style.top = `${top}px`;
                img.style.left = `${left}px`;
                img.style.transform = `scale(1) rotate(${rotation}deg)`;

                photoContainer.appendChild(img);

                // Adiciona o retângulo da foto recém-colocada à nossa lista de posições
                placedPhotosRects.push(newRect);
                
                break; // Sai do loop de tentativas e vai para a próxima foto
            }

            // Se sobrepôs, incrementa a tentativa e o loop continua
            currentTry++;
        }
        // Se o loop terminar por excesso de tentativas, a foto simplesmente não é adicionada.
    });
};


// ... (o restante do script.js, como a função fadeOutExistingPhotos e os event listeners, continua o mesmo)

    // Função para remover as fotos atuais com uma animação
    const fadeOutExistingPhotos = () => {
        return new Promise(resolve => {
            const existingPhotos = document.querySelectorAll('.photo-item');
            if (existingPhotos.length === 0) {
                resolve(); // Resolve imediatamente se não houver fotos
                return;
            }

            existingPhotos.forEach(photo => {
                photo.classList.add('fading-out');
            });
            
            // Espera a animação de saída terminar para limpar o container
            setTimeout(() => {
                photoContainer.innerHTML = ''; // Limpa todas as fotos
                resolve();
            }, 1000); // Duração da animação de fadeOut
        });
    };

    // Função para iniciar o ciclo
    const startCycle = () => {
        btnStart.disabled = true;
        btnStop.disabled = false;
        
        runCycle(); // Roda a primeira vez imediatamente
        cycleInterval = setInterval(runCycle, CYCLE_TIME); // E depois a cada X segundos
    };

    // Função para parar o ciclo
    const stopCycle = () => {
        btnStart.disabled = false;
        btnStop.disabled = true;

        clearInterval(cycleInterval); // Limpa o temporizador
        cycleInterval = null;
    };

    // Adiciona os eventos aos botões
    btnStart.addEventListener('click', startCycle);
    btnStop.addEventListener('click', stopCycle);
});
