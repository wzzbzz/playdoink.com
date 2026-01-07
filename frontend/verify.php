<?php

require_once __DIR__ . '/autoload.php';

$doink = new Doink\Doink();

?>
<!DOCTYPE html>
<head>
    <title>Verifying Login - DO!NK</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Luckiest Guy', cursive;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .verify-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 3rem;
            border-radius: 16px;
            backdrop-filter: blur(10px);
        }
        .verify-container h1 {
            font-size: 3rem;
            margin: 0 0 1rem 0;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            font-family: Arial, sans-serif;
            font-size: 1.2rem;
            margin-top: 1rem;
        }
        .error {
            color: #ff6b6b;
        }
        .success {
            color: #51cf66;
        }
    </style>
</head>
<body>
    <div class="verify-container">
        <h1>DO!NK</h1>
        <div id="status">
            <div class="spinner"></div>
            <p class="message">Verifying your magic link...</p>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="js/config.js"></script>
    <script>
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            document.getElementById('status').innerHTML = `
                <p class="message error">Invalid or missing token</p>
                <p style="font-family: Arial;">
                    <a href="/" style="color: white;">Return to home</a>
                </p>
            `;
        } else {
            verifyToken(token);
        }

        async function verifyToken(token) {
            try {
                const response = await fetch(`${CONFIG.API_URL}/api/auth/verify-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    // Add expiration date (30 days from now)
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + 30);
                    data.user.sessionExpires = expirationDate.toISOString();
                    
                    // Store user data in localStorage
                    localStorage.setItem('doink_user', JSON.stringify(data.user));
                    
                    // Check if user needs to set a nickname
                    if (!data.user.username) {
                        document.getElementById('status').innerHTML = `
                            <p class="message success">✓ Login successful!</p>
                            <p class="message">Redirecting to set nickname...</p>
                        `;
                        
                        // Redirect to home and trigger nickname prompt
                        setTimeout(() => {
                            window.location.href = '/?show-nickname=1';
                        }, 1500);
                    } else {
                        document.getElementById('status').innerHTML = `
                            <p class="message success">✓ Login successful!</p>
                            <p class="message">Redirecting to game...</p>
                        `;

                        // Redirect to game after 1.5 seconds
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1500);
                    }
                } else {
                    throw new Error(data.message || 'Verification failed');
                }
            } catch (error) {
                document.getElementById('status').innerHTML = `
                    <p class="message error">✗ ${error.message}</p>
                    <p style="font-family: Arial; margin-top: 2rem;">
                        <a href="/" style="color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 8px;">Return to home</a>
                    </p>
                `;
            }
        }
    </script>
</body>
</html>
