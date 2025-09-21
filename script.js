type = "module" >
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


        const uploaderLinks = document.querySelectorAll('#nav-data-uploader, #uploader-link, #footer-uploader-link');
        uploaderLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                const newUrl = `data_uploader.html?appId=${encodeURIComponent(appId)}&authToken=${encodeURIComponent(initialAuthToken)}`;
                window.location.href = newUrl;
            });
        });
    });
