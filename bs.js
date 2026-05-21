// Espera todo o HTML carregar antes de rodar o código
document.addEventListener('DOMContentLoaded', () => {
    // Pega todos os cards da tela
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // Remove a transição uma única vez ao entrar no card, em vez de várias vezes ao mover
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });

        // Evento que dispara enquanto o mouse se move DENTRO do card
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Posição X do mouse no card
            const y = e.clientY - rect.top;  // Posição Y do mouse no card

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calcula a inclinação (máximo de 15 graus)
            const rotateX = ((y - centerY) / centerY) * -15; 
            const rotateY = ((x - centerX) / centerX) * 15;

            // Aplica a rotação instantaneamente (transição removida no mouseenter)
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        // Evento que dispara quando o mouse SAI do card
        card.addEventListener('mouseleave', () => {
            // Reseta a posição do card suavemente
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });
    });
});
