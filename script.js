
        document.addEventListener('DOMContentLoaded', () => {
            // Scroll animation observer
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.scroll-animation').forEach(section => {
                observer.observe(section);
            });

            // Mobile menu toggle
            const menuButton = document.getElementById('menu-button');
            const navMenu = document.getElementById('nav-menu');
            menuButton.addEventListener('click', () => {
                navMenu.classList.toggle('hidden');
            });
            
            // AI Image Generation
            const generateButton = document.getElementById('generate-button');
            const promptTextarea = document.getElementById('prompt');
            const loadingIndicator = document.getElementById('loading-indicator');
            const imageContainer = document.getElementById('image-container');

            // API key for the image generation model
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

            generateButton.addEventListener('click', async () => {
                const userPrompt = promptTextarea.value.trim();
                if (!userPrompt) {
                    alert('Please enter a description for the image.');
                    return;
                }

                // Show loading indicator
                loadingIndicator.classList.remove('hidden');
                imageContainer.innerHTML = '';
                generateButton.disabled = true;

                const payload = { 
                    instances: { prompt: userPrompt },
                    parameters: { "sampleCount": 1 }
                };

                // Fetch options for the API call
                const fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                };

                try {
                    const response = await fetchWithExponentialBackoff(apiUrl, fetchOptions);
                    const result = await response.json();

                    if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
                        const base64Data = result.predictions[0].bytesBase64Encoded;
                        const imageUrl = `data:image/png;base64,${base64Data}`;
                        
                        const imgElement = document.createElement('img');
                        imgElement.src = imageUrl;
                        imgElement.alt = userPrompt;
                        imgElement.className = 'w-full h-auto rounded-lg shadow-lg border border-green-300';
                        
                        imageContainer.innerHTML = '';
                        imageContainer.appendChild(imgElement);

                    } else {
                        throw new Error('Image generation failed or no data returned.');
                    }
                } catch (error) {
                    // Using a custom message box instead of alert()
                    const messageBox = document.createElement('div');
                    messageBox.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md max-w-sm z-50';
                    messageBox.innerHTML = `
                        <p class="font-bold">Error</p>
                        <p class="text-sm">Failed to generate image. Please try again. ${error.message}</p>
                    `;
                    document.body.appendChild(messageBox);
                    setTimeout(() => messageBox.remove(), 5000);
                } finally {
                    // Hide loading indicator and re-enable button
                    loadingIndicator.classList.add('hidden');
                    generateButton.disabled = false;
                }
            });

            async function fetchWithExponentialBackoff(url, options, retries = 3, delay = 1000) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url, options);
                        if (response.status === 429 && i < retries - 1) { // Too Many Requests
                            await new Promise(res => setTimeout(res, delay));
                            delay *= 2; // Exponential increase
                            continue;
                        }
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response;
                    } catch (error) {
                        if (i < retries - 1) {
                            await new Promise(res => setTimeout(res, delay));
                            delay *= 2;
                        } else {
                            throw error;
                        }
                    }
                }
            }
        });
