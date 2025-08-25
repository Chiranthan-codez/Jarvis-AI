// DOM elements
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// Speech synthesis setup
let speechSynthesis = window.speechSynthesis;
let speaking = false;

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

// Initialize speech recognition
function initSpeechRecognition() {
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            content.textContent = "Listening...";
            btn.style.background = '#ff4444';
        };
        
        recognition.onresult = (event) => {
            const currentIndex = event.resultIndex;
            const transcript = event.results[currentIndex][0].transcript;
            content.textContent = transcript;
            takeCommand(transcript.toLowerCase());
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            content.textContent = "Error: " + event.error;
            btn.style.background = '#4CAF50';
            speak("Sorry, I couldn't hear you properly. Please try again.");
        };
        
        recognition.onend = () => {
            btn.style.background = '#4CAF50';
        };
    } else {
        content.textContent = "Speech recognition not supported in this browser";
        btn.disabled = true;
    }
}

// Enhanced speak function with proper cleanup
function speak(text) {
    if (speaking) {
        speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.volume = 1;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
        speaking = true;
    };
    
    utterance.onend = () => {
        speaking = false;
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        speaking = false;
    };
    
    speechSynthesis.speak(utterance);
}

// Greeting function
function wishMe() {
    const day = new Date();
    const hour = day.getHours();
    
    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Master...");
    } else {
        speak("Good Evening Sir...");
    }
}

// Enhanced command processing
function takeCommand(message) {
    console.log('Processing command:', message);
    
    // Greeting commands
    if (message.includes('hey') || message.includes('hello') || message.includes('hi')) {
        speak("Hello Sir, How May I Help You?");
        return;
    }
    
    // Website opening commands
    if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
        return;
    }
    
    if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
        return;
    }
    
    if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
        return;
    }
     if (message.includes("open instagram")) {
        window.open("https://instagram.com", "_blank");
        speak("Opening Instagram...");
        return;
    }
    
    if (message.includes("open github")) {
        window.open("https://github.com", "_blank");
        speak("Opening GitHub...");
        return;
    }
    
    if (message.includes("open stackoverflow")) {
        window.open("https://stackoverflow.com", "_blank");
        speak("Opening Stack Overflow...");
        return;
    }
        // NEW: WhatsApp commands with platform detection
    if (message.includes("open whatsapp") || message.includes("whatsapp")) {
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = /android/.test(userAgent);
        const isWindows = /windows/.test(userAgent);
        
        if (isAndroid) {
            // Try to open WhatsApp app on Android
            try {
                // Attempt to open WhatsApp app
                window.location.href = 'whatsapp://';
                speak("Opening WhatsApp app on your phone...");
            } catch (error) {
                // Fallback to WhatsApp Web
                window.open("https://web.whatsapp.com", "_blank");
                speak("Opening WhatsApp Web...");
            }
        } else if (isWindows) {
            // Try to open WhatsApp Desktop app on Windows
            try {
                // Attempt to open WhatsApp Desktop app
                window.location.href = 'whatsapp://';
                speak("Opening WhatsApp Desktop app...");
            } catch (error) {
                // Fallback to WhatsApp Web
                window.open("https://web.whatsapp.com", "_blank");
                speak("Opening WhatsApp Web...");
            }
        } else {
            // Fallback for other platforms
            window.open("https://web.whatsapp.com", "_blank");
            speak("Opening WhatsApp Web...");
        }
        return;
    }
    // NEW: LinkedIn commands
    if (message.includes("open linkedin") || message.includes("linkedin")) {
        window.open("https://linkedin.com", "_blank");
        speak("Opening LinkedIn...");
        return;
    }
    
      // NEW: Weather commands
    if (message.includes('weather') || message.includes('temperature') || message.includes('forecast')) {
        // Try to get user's location for weather
        if (navigator.geolocation) {
            content.textContent = "Getting weather information...";
            speak("Getting weather information for your location...");
            
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // Using OpenWeatherMap API (free tier)
                    const apiKey = 'YOUR_API_KEY'; // You'll need to get a free API key from openweathermap.org
                    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                    
                    const response = await fetch(weatherUrl);
                    const weatherData = await response.json();
                    
                    if (weatherData.cod === 200) {
                        const temp = Math.round(weatherData.main.temp);
                        const feelsLike = Math.round(weatherData.main.feels_like);
                        const humidity = weatherData.main.humidity;
                        const description = weatherData.weather[0].description;
                        const city = weatherData.name;
                        const country = weatherData.sys.country;
                        
                        const weatherInfo = `Weather in ${city}, ${country}: ${temp}°C, feels like ${feelsLike}°C. ${description}. Humidity: ${humidity}%`;
                        
                        content.textContent = weatherInfo;
                        speak(weatherInfo);
                    } else {
                        throw new Error('Weather data not available');
                    }
                } catch (error) {
                    console.error('Weather API error:', error);
                    // Fallback to weather website
                    const weatherUrl = `https://openweathermap.org/weather?lat=${lat}&lon=${lon}`;
                    window.open(weatherUrl, "_blank");
                    content.textContent = "Weather data unavailable. Opening weather website...";
                    speak("I couldn't fetch weather data. Opening weather website instead...");
                }
            }, (error) => {
                console.error('Geolocation error:', error);
                // Fallback to general weather site
                window.open("https://weather.com", "_blank");
                content.textContent = "Location access denied. Opening Weather.com...";
                speak("I couldn't access your location. Opening Weather.com for weather information...");
            });
        } else {
            // Fallback to general weather site
            window.open("https://weather.com", "_blank");
            content.textContent = "Geolocation not supported. Opening Weather.com...";
            speak("Location services not available. Opening Weather.com for weather information...");
        }
        return;
    }
    
    // Alternative weather command (no API key required)
    if (message.includes('weather info') || message.includes('weather details') || message.includes('current weather')) {
        if (navigator.geolocation) {
            content.textContent = "Getting current weather...";
            speak("Getting current weather information...");
            
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Get current time for weather context
                const now = new Date();
                const hour = now.getHours();
                let timeOfDay = '';
                
                if (hour >= 5 && hour < 12) timeOfDay = 'morning';
                else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
                else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
                else timeOfDay = 'night';
                
                // Basic weather estimation based on time and location
                const weatherInfo = `It's ${timeOfDay} time. I can see your location coordinates are ${lat.toFixed(2)}, ${lon.toFixed(2)}. For detailed weather, I'll open a weather website for you.`;
                
                content.textContent = weatherInfo;
                speak(weatherInfo);
                
                // Open weather website after a short delay
                setTimeout(() => {
                    const weatherUrl = `https://openweathermap.org/weather?lat=${lat}&lon=${lon}`;
                    window.open(weatherUrl, "_blank");
                    speak("Opening detailed weather information...");
                }, 3000);
                
            }, (error) => {
                content.textContent = "Location access denied. Opening Weather.com...";
                speak("I couldn't access your location. Opening Weather.com for weather information...");
                window.open("https://weather.com", "_blank");
            });
        } else {
            content.textContent = "Geolocation not supported. Opening Weather.com...";
            speak("Location services not available. Opening Weather.com for weather information...");
            window.open("https://weather.com", "_blank");
        }
        return;
    }
    
    // NEW: Enhanced music and song commands
    if (message.includes('play music') || message.includes('music') || message.includes('songs') || message.includes('song')) {
        // Try to open Spotify first
        try {
            window.open("https://open.spotify.com", "_blank");
            speak("Opening Spotify for music...");
        } catch (error) {
            // Fallback to YouTube Music
            window.open("https://music.youtube.com", "_blank");
            speak("Opening YouTube Music for songs...");
        }
        return;
    }
    
    // NEW: Specific music platform commands
    if (message.includes('spotify')) {
        window.open("https://open.spotify.com", "_blank");
        speak("Opening Spotify...");
        return;
    }
    
    if (message.includes('youtube music') || message.includes('yt music')) {
        window.open("https://music.youtube.com", "_blank");
        speak("Opening YouTube Music...");
        return;
    }
    
    if (message.includes('apple music')) {
        window.open("https://music.apple.com", "_blank");
        speak("Opening Apple Music...");
        return;
    }
    
    if (message.includes('amazon music')) {
        window.open("https://music.amazon.com", "_blank");
        speak("Opening Amazon Music...");
        return;
    }
    
    // NEW: Play specific songs (opens YouTube search)
    if (message.includes('play') && (message.includes('song') || message.includes('music'))) {
        const songName = message.replace(/play\s+(song\s+)?(music\s+)?/i, '').trim();
        if (songName) {
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName + ' song')}`;
            window.open(searchUrl, "_blank");
            speak(`Searching for ${songName} on YouTube...`);
        } else {
            window.open("https://music.youtube.com", "_blank");
            speak("Opening YouTube Music for songs...");
        }
        return;
    }
    
    // Search commands
    if (message.includes('what is') || message.includes('who is') || message.includes('what are') || message.includes('how to')) {
        const searchQuery = message.replace(/^(what is|who is|what are|how to)\s+/i, '').trim();
        if (searchQuery) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
            speak(`Searching for ${searchQuery} on Google`);
        }
        return;
    }
    
    // Wikipedia commands
    if (message.includes('wikipedia')) {
        const wikiQuery = message.replace(/wikipedia/i, '').trim();
        if (wikiQuery) {
            window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(wikiQuery)}`, "_blank");
            speak(`Searching Wikipedia for ${wikiQuery}`);
        }
        return;
    }
    
    // Time and date commands
    if (message.includes('time')) {
        const time = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        speak(`The current time is ${time}`);
        return;
    }
    
    if (message.includes('date')) {
        const date = new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        speak(`Today's date is ${date}`);
        return;
    }
    
    // Calculator command
    if (message.includes('calculator')) {
        // Detect platform for appropriate calculator
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = /android/.test(userAgent);
        const isWindows = /windows/.test(userAgent);
        
        if (isAndroid) {
            // Try to open Android calculator app
            try {
                window.location.href = 'calculator://';
                speak("Opening Calculator app on your phone...");
            } catch (error) {
                // Fallback to web calculator
                window.open("https://www.calculator.net", "_blank");
                speak("Opening web calculator...");
            }
        } else if (isWindows) {
            // Try to open Windows calculator
            try {
                window.location.href = 'calculator://';
                speak("Opening Windows Calculator...");
            } catch (error) {
                // Fallback to web calculator
                window.open("https://www.calculator.net", "_blank");
                speak("Opening web calculator...");
            }
        } else {
            // Fallback for other platforms
            window.open("https://www.calculator.net", "_blank");
            speak("Opening web calculator...");
        }
        return;
    }
    
    // NEW: Phone/Call commands for Android
    if (message.includes('phone') || message.includes('call') || message.includes('dialer')) {
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = /android/.test(userAgent);
        
        if (isAndroid) {
            // Try to open Android phone/dialer app
            try {
                window.location.href = 'tel:';
                speak("Opening Phone app on your Android device...");
            } catch (error) {
                speak("I'm sorry, I couldn't open the phone app. You can manually open it from your home screen.");
            }
        } else {
            speak("Phone app is only available on mobile devices. You can use your computer's calling apps instead.");
        }
        return;
    }
    
    
    // Help command
    if (message.includes('help') || message.includes('what can you do')) {
        speak("I can help you with opening websites like Google, YouTube, Facebook, LinkedIn, GitHub, searching the internet, playing music on Spotify and YouTube Music, checking weather, telling time and date, and answering questions. Just ask me what you need!");
        return;
    }
    
    // Default search for anything else
    if (message.trim().length > 0) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
        speak(`I found some information for ${message} on Google`);
    }
}

// Event listeners
btn.addEventListener('click', () => {
    if (recognition && !speaking) {
        try {
            recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            content.textContent = "Error starting recognition";
        }
    }
});

// Initialize on page load
window.addEventListener('load', () => {
    initSpeechRecognition();
    speak("Initializing JARVIS...");
    setTimeout(() => {
        wishMe();
    }, 2000);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && speaking) {
        speechSynthesis.cancel();
        speaking = false;
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', () => {
    if (speaking) {
        speechSynthesis.cancel();
    }
    if (recognition) {
        recognition.stop();
    }
});




