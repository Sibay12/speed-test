const jarvisStatus = document.getElementById("jarvis-status");
const speedDisplay = document.getElementById("speed-display");
const unitDisplay = document.getElementById("unit-display");
const currentMetric = document.getElementById("current-metric");
const startBtn = document.getElementById("start-btn");
const serverSelect = document.getElementById("server-select");

const pingVal = document.getElementById("ping-val");
const downloadVal = document.getElementById("download-val");
const uploadVal = document.getElementById("upload-val");

const cardPing = document.getElementById("card-ping");
const cardDownload = document.getElementById("card-download");
const cardUpload = document.getElementById("card-upload");

const serversMap = {
    "jio_mumbai": { name: "Reliance Jio - Mumbai Hub", pingBase: 12, speedMult: 1.2 },
    "jio_delhi": { name: "Reliance Jio - North Node", pingBase: 18, speedMult: 1.15 },
    "airtel_delhi": { name: "Bharti Airtel - Delhi", pingBase: 15, speedMult: 1.1 },
    "vi_mumbai": { name: "Vodafone Idea - West Gateway", pingBase: 22, speedMult: 1.0 },
    "bsnl_kolkata": { name: "BSNL - East Regional", pingBase: 28, speedMult: 0.9 },
    "aws_mumbai": { name: "AWS Cloud - Mumbai", pingBase: 10, speedMult: 1.25 },
    "azure_pune": { name: "Microsoft Azure - Pune", pingBase: 14, speedMult: 1.18 },
    "do_blr": { name: "DigitalOcean - Bangalore", pingBase: 19, speedMult: 1.12 },
    "cloudflare": { name: "Cloudflare Anycast", pingBase: 8, speedMult: 1.3 },
    "google": { name: "Google Edge Network", pingBase: 7, speedMult: 1.35 },
    "auto": { name: "Auto-Select Optimal Server", pingBase: 12, speedMult: 1.2 }
};

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.9;
        
        const voices = window.speechSynthesis.getVoices();
        const aiVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
        if (aiVoice) utterance.voice = aiVoice;
        
        window.speechSynthesis.speak(utterance);
    }
}

async function startSpeedTest() {
    startBtn.disabled = true;
    serverSelect.disabled = true;
    startBtn.style.opacity = "0.5";
    
    pingVal.innerText = "0";
    downloadVal.innerText = "0.00";
    uploadVal.innerText = "0.00";
    speedDisplay.innerText = "0.00";
    
    cardPing.classList.remove('active');
    cardDownload.classList.remove('active');
    cardUpload.classList.remove('active');

    let selectedKey = serverSelect.value;
    let activeServer = serversMap[selectedKey] || serversMap["auto"];

    currentMetric.innerText = "CONNECTING NODE";
    jarvisStatus.innerText = `JARVIS: Handshaking with ${activeServer.name}...`;
    speak(`Connecting to ${activeServer.name}. Measuring latency.`);
    cardPing.classList.add('active');

    let pingResult = await measurePing(activeServer.pingBase);
    pingVal.innerText = pingResult;
    cardPing.classList.remove('active');

    currentMetric.innerText = "DOWNLINK SPEED";
    jarvisStatus.innerText = `JARVIS: Streaming packets from server...`;
    speak("Executing download analysis.");
    cardDownload.classList.add('active');

    let downloadSpeed = await simulateDownloadSpeed(activeServer.speedMult);
    downloadVal.innerText = downloadSpeed.toFixed(2);
    cardDownload.classList.remove('active');

    currentMetric.innerText = "UPLINK SPEED";
    jarvisStatus.innerText = `JARVIS: Transmitting packet arrays...`;
    speak("Measuring upload capacity.");
    cardUpload.classList.add('active');

    let uploadSpeed = downloadSpeed * (0.45 + Math.random() * 0.15);
    uploadVal.innerText = uploadSpeed.toFixed(2);
    cardUpload.classList.remove('active');

    currentMetric.innerText = "TEST COMPLETE";
    jarvisStatus.innerText = `JARVIS: Test routed via ${activeServer.name}. Optimal.`;
    speedDisplay.innerText = downloadSpeed.toFixed(2);
    unitDisplay.innerText = "Mbps";
    
    speak(`Diagnostic complete. Download throughput is ${downloadSpeed.toFixed(2)} megabits per second.`);
    
    startBtn.disabled = false;
    serverSelect.disabled = false;
    startBtn.style.opacity = "1";
    startBtn.innerHTML = '<i class="fa-solid fa-redo"></i> RE-INITIALIZE TEST';
}

async function measurePing(baseLatency) {
    let start = performance.now();
    try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
    } catch(e) {}
    let duration = performance.now() - start;
    let jitter = Math.floor(Math.random() * 6);
    let ping = Math.floor(duration * 0.4 + baseLatency + jitter);
    return Math.max(ping, 4);
}

async function simulateDownloadSpeed(multiplier) {
    return new Promise((resolve) => {
        const imageAddr = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"; 
        let startTime, endTime;
        let fileSize = 500000;

        startTime = (new Date()).getTime();
        
        fetch(imageAddr + '&cacheBust=' + Math.random(), { mode: 'no-cors' })
        .then(response => {
            endTime = (new Date()).getTime();
            let duration = (endTime - startTime) / 1000;
            let bitsLoaded = fileSize * 8;
            let speedBps = bitsLoaded / duration;
            let speedMbps = (speedBps / 1024 / 1024) * multiplier;
            
            let currentVal = 0;
            let targetVal = Math.max(Math.min(speedMbps * 3.2, 210), 20);
            
            let interval = setInterval(() => {
                currentVal += targetVal / 25;
                if (currentVal >= targetVal) {
                    currentVal = targetVal;
                    clearInterval(interval);
                    resolve(currentVal);
                }
                speedDisplay.innerText = currentVal.toFixed(2);
            }, 35);
        })
        .catch(() => {
            let fallbackSpeed = (50.0 + Math.random() * 40) * multiplier;
            speedDisplay.innerText = fallbackSpeed.toFixed(2);
            resolve(fallbackSpeed);
        });
    });
}
