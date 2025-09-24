document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordOutput = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateBtn = document.getElementById('generate-btn');
    const strengthMeter = document.getElementById('strength-meter');

    // Character Sets
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';

    // Initialize
    lengthValue.textContent = lengthSlider.value;
    // Don't generate password on load
    passwordOutput.value = "";
    updateStrengthMeter("");

    // Event Listeners
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
        // Don't generate password on slider change
    });

    // Don't generate password on checkbox changes
    uppercaseCheckbox.addEventListener('change', () => {});
    lowercaseCheckbox.addEventListener('change', () => {});
    numbersCheckbox.addEventListener('change', () => {});
    symbolsCheckbox.addEventListener('change', () => {});
    
    // Only generate password when button is clicked
    generateBtn.addEventListener('click', generatePassword);

    copyBtn.addEventListener('click', () => {
        const password = passwordOutput.value;
        if (!password) return;

        // Copy to clipboard
        navigator.clipboard.writeText(password)
            .then(() => {
                // Visual feedback
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.classList.remove('copied');
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    // Functions
    function generatePassword() {
        // Ensure at least one character type is selected
        if (!uppercaseCheckbox.checked && 
            !lowercaseCheckbox.checked && 
            !numbersCheckbox.checked && 
            !symbolsCheckbox.checked) {
            // Default to lowercase if nothing is selected
            lowercaseCheckbox.checked = true;
        }

        // Build character pool based on selected options
        let charPool = '';
        if (uppercaseCheckbox.checked) charPool += uppercaseChars;
        if (lowercaseCheckbox.checked) charPool += lowercaseChars;
        if (numbersCheckbox.checked) charPool += numberChars;
        if (symbolsCheckbox.checked) charPool += symbolChars;

        const passwordLength = lengthSlider.value;
        let password = '';

        // Generate password
        for (let i = 0; i < passwordLength; i++) {
            const randomIndex = Math.floor(Math.random() * charPool.length);
            password += charPool[randomIndex];
        }

        // Ensure password contains at least one character from each selected type
        let validPassword = validatePassword(password);
        while (!validPassword) {
            password = '';
            for (let i = 0; i < passwordLength; i++) {
                const randomIndex = Math.floor(Math.random() * charPool.length);
                password += charPool[randomIndex];
            }
            validPassword = validatePassword(password);
        }

        // Update UI
        passwordOutput.value = password;
        updateStrengthMeter(password);
    }

    function validatePassword(password) {
        // Check if password contains at least one character from each selected type
        let hasUppercase = !uppercaseCheckbox.checked || /[A-Z]/.test(password);
        let hasLowercase = !lowercaseCheckbox.checked || /[a-z]/.test(password);
        let hasNumber = !numbersCheckbox.checked || /[0-9]/.test(password);
        let hasSymbol = !symbolsCheckbox.checked || /[^A-Za-z0-9]/.test(password);

        return hasUppercase && hasLowercase && hasNumber && hasSymbol;
    }

    function updateStrengthMeter(password) {
        // Handle empty password case
        if (!password) {
            strengthMeter.style.width = '0%';
            strengthMeter.style.background = 'var(--danger-color)';
            return;
        }
        
        // Calculate password strength
        let strength = 0;
        
        // Length contribution (up to 40%)
        strength += Math.min(password.length / 32 * 40, 40);
        
        // Character variety contribution (up to 60%)
        let varietyScore = 0;
        if (/[A-Z]/.test(password)) varietyScore += 15;
        if (/[a-z]/.test(password)) varietyScore += 15;
        if (/[0-9]/.test(password)) varietyScore += 15;
        if (/[^A-Za-z0-9]/.test(password)) varietyScore += 15;
        
        strength += varietyScore;
        
        // Update the strength meter
        strengthMeter.style.width = `${strength}%`;
        
        // Set color based on strength
        if (strength < 40) {
            strengthMeter.style.background = 'var(--danger-color)';
        } else if (strength < 70) {
            strengthMeter.style.background = 'var(--warning-color)';
        } else {
            strengthMeter.style.background = 'var(--success-color)';
        }
    }
});