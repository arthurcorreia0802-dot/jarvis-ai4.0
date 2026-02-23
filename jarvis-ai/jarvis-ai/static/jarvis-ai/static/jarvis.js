const circle = document.getElementById("circle");
const speakBtn = document.getElementById("speakBtn");
const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    output.textContent = "Seu navegador não suporta reconhecimento de voz!";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    // Cria linhas no círculo
    const totalLines = 24;
    for (let i = 0; i < totalLines; i++) {
        const line = document.createElement("div");
        line.classList.add("line");
        line.style.transform = `rotate(${(360/totalLines)*i}deg) translateY(-50%)`;
        circle.appendChild(line);
    }

    function animateLines() {
        document.querySelectorAll(".line").forEach(line => {
            line.style.animation = "pulse 0.5s infinite alternate";
        });
        setTimeout(() => {
            document.querySelectorAll(".line").forEach(line => {
                line.style.animation = "pulse 1s infinite alternate";
            });
        }, 2000);
    }

    speakBtn.onclick = () => {
        recognition.start();
        output.textContent = "Ouvindo...";
        animateLines();
    };

    recognition.onresult = async (event) => {
        const text = event.results[0][0].transcript;
        output.textContent = "Você disse: " + text;

        // Comandos simples
        if (text.toLowerCase().includes("pesquisar")) {
            const termo = text.toLowerCase().replace("pesquisar", "").trim();
            window.open("https://www.google.com/search?q=" + encodeURIComponent(termo), "_blank");
            return;
        }

        if (text.toLowerCase().includes("abrir youtube")) {
            window.open("https://www.youtube.com", "_blank");
            return;
        }

        // Pergunta para OpenAI
        const resp = await fetch("/ask", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({question: text})
        });
        const data = await resp.json();

        // Resposta em voz
        const utterance = new SpeechSynthesisUtterance(data.answer);
        speechSynthesis.speak(utterance);

        output.textContent += "\nJarvis: " + data.answer;
        animateLines();
    };
}
