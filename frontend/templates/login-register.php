<?php global $doink; ?>
<div id="login-register-overlay" class="overlay">
    <div class="auth-container">
        <h2>DO!NK</h2>
        <p class="auth-subtitle">Join the battle!</p>
        
        <form id="auth-form" class="auth-form">
            <input 
                type="email" 
                id="email-input" 
                placeholder="Enter your email" 
                required
                autocomplete="email"
            />
            <button type="submit" id="auth-submit-btn">
                Send Magic Link
            </button>
        </form>
        
        <div id="auth-message" class="auth-message"></div>
        
        <p class="auth-footer">
            We'll send you a link to login instantly.<br>
            No password needed!
        </p>

        <div class="auth-legal-links">
            <a href="/terms.php" target="_blank">Terms of Use</a>
            <span>•</span>
            <a href="/privacy.php" target="_blank">Privacy Policy</a>
        </div>
    </div>
</div>

<style>
.auth-container {
    background: white;
    padding: 3rem 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 90%;
}

.auth-container h2 {
    font-family: 'Luckiest Guy', cursive;
    font-size: 3rem;
    margin: 0 0 0.5rem 0;
    color: #2b8bf6;
}

.auth-subtitle {
    font-family: 'Luckiest Guy', cursive;
    font-size: 1.2rem;
    color: #666;
    margin: 0 0 2rem 0;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

#email-input {
    font-family: Arial, sans-serif;
    padding: 1rem;
    font-size: 1rem;
    border: 3px solid #2b8bf6;
    border-radius: 8px;
    outline: none;
}

#email-input:focus {
    border-color: #62bf5e;
}

#auth-submit-btn {
    font-family: 'Luckiest Guy', cursive;
    padding: 1rem;
    font-size: 1.5rem;
    background-color: #62bf5e;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
}

#auth-submit-btn:hover {
    background-color: #4fa047;
}

#auth-submit-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.auth-message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    font-family: Arial, sans-serif;
    display: none;
}

.auth-message.success {
    display: block;
    background-color: #d4edda;
    color: #155724;
    border: 2px solid #c3e6cb;
}

.auth-message.error {
    display: block;
    background-color: #f8d7da;
    color: #721c24;
    border: 2px solid #f5c6cb;
}

.auth-footer {
    font-family: Arial, sans-serif;
    font-size: 0.9rem;
    color: #666;
    margin-top: 2rem;
    line-height: 1.5;
}

.auth-legal-links {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e0e0e0;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 0.75rem;
}

.auth-legal-links a {
    color: #999;
    text-decoration: none;
    transition: color 0.2s;
}

.auth-legal-links a:hover {
    color: #2b8bf6;
    text-decoration: underline;
}

.auth-legal-links span {
    color: #ccc;
    margin: 0 0.5rem;
}
</style>

<script>
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email-input').value;
    const submitBtn = document.getElementById('auth-submit-btn');
    const messageEl = document.getElementById('auth-message');
    
    // Disable button during request
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    messageEl.className = 'auth-message';
    messageEl.style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/request-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageEl.className = 'auth-message success';
            messageEl.textContent = '✓ Check your email! We sent you a magic link.';
            messageEl.style.display = 'block';
            document.getElementById('email-input').value = '';
        } else {
            throw new Error(data.message || 'Failed to send magic link');
        }
    } catch (error) {
        messageEl.className = 'auth-message error';
        messageEl.textContent = '✗ ' + error.message;
        messageEl.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Magic Link';
    }
});
</script>
