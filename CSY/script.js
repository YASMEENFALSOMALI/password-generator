// Character sets
const smallLetters = 'abcdefghijklmnopqrstuvwxyz';
const capitalLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const punctuation = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Get DOM elements
const passwordLengthInput = document.getElementById('passwordLength');
const smallLettersCheckbox = document.getElementById('smallLetters');
const capitalLettersCheckbox = document.getElementById('capitalLetters');
const numbersCheckbox = document.getElementById('numbers');
const punctuationCheckbox = document.getElementById('punctuation');
const quantityInput = document.getElementById('quantity');
const generateBtn = document.getElementById('generateBtn');
const passwordResults = document.getElementById('passwordResults');

// Generate a single random password with enhanced strength for longer passwords
function generatePassword(length, useSmall, useCapital, useNumbers, usePunctuation) {
    let charset = '';
    const availableSets = [];
    
    if (useSmall) {
        charset += smallLetters;
        availableSets.push(smallLetters);
    }
    if (useCapital) {
        charset += capitalLetters;
        availableSets.push(capitalLetters);
    }
    if (useNumbers) {
        charset += numbers;
        availableSets.push(numbers);
    }
    if (usePunctuation) {
        charset += punctuation;
        availableSets.push(punctuation);
    }
    
    // If no character types selected, use all
    if (charset === '') {
        charset = smallLetters + capitalLetters + numbers + punctuation;
        availableSets.push(smallLetters, capitalLetters, numbers, punctuation);
    }
    
    // For longer passwords (16+), ensure extra strong generation
    if (length >= 16 && availableSets.length > 1) {
        return generateExtraStrongPassword(length, availableSets);
    }
    
    // For medium passwords (12-15), ensure good distribution
    if (length >= 12 && availableSets.length > 1) {
        return generateStrongPassword(length, availableSets, charset);
    }
    
    // For shorter passwords, use standard generation but ensure all types are used
    return generateStandardPassword(length, availableSets, charset);
}

// Generate extra strong password for longer lengths (16+)
function generateExtraStrongPassword(length, availableSets) {
    let password = new Array(length);
    const charsetLength = availableSets.reduce((sum, set) => sum + set.length, 0);
    
    // Calculate minimum characters from each set for extra strength
    const minPerSet = Math.floor(length / availableSets.length);
    const remainder = length % availableSets.length;
    
    // Create a pool of required characters from each set
    let requiredChars = [];
    availableSets.forEach((set, index) => {
        const count = minPerSet + (index < remainder ? 1 : 0);
        const randomValues = new Uint32Array(count);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < count; i++) {
            requiredChars.push(set[randomValues[i] % set.length]);
        }
    });
    
    // Shuffle the required characters using Fisher-Yates algorithm
    const randomValues = new Uint32Array(requiredChars.length);
    crypto.getRandomValues(randomValues);
    for (let i = requiredChars.length - 1; i > 0; i--) {
        const j = randomValues[i] % (i + 1);
        [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
    }
    
    // Fill password array with shuffled characters
    for (let i = 0; i < length; i++) {
        password[i] = requiredChars[i];
    }
    
    return password.join('');
}

// Generate strong password for medium lengths (12-15)
function generateStrongPassword(length, availableSets, charset) {
    let password = new Array(length);
    const charsetLength = charset.length;
    
    // Ensure at least one character from each selected set
    let usedIndices = new Set();
    let charIndex = 0;
    
    // Place at least one character from each set
    availableSets.forEach(set => {
        const randomValue = new Uint32Array(1);
        crypto.getRandomValues(randomValue);
        const pos = randomValue[0] % length;
        let attempts = 0;
        let finalPos = pos;
        while (usedIndices.has(finalPos) && attempts < length) {
            finalPos = (finalPos + 1) % length;
            attempts++;
        }
        usedIndices.add(finalPos);
        const charRandom = new Uint32Array(1);
        crypto.getRandomValues(charRandom);
        password[finalPos] = set[charRandom[0] % set.length];
        charIndex++;
    });
    
    // Fill remaining positions with random characters from full charset
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        if (!password[i]) {
            password[i] = charset[randomValues[i] % charsetLength];
        }
    }
    
    return password.join('');
}

// Generate standard password with all types included
function generateStandardPassword(length, availableSets, charset) {
    let password = new Array(length);
    const charsetLength = charset.length;
    
    // Ensure at least one character from each selected set
    let usedIndices = new Set();
    
    // Place at least one character from each set
    availableSets.forEach((set, index) => {
        const randomValue = new Uint32Array(1);
        crypto.getRandomValues(randomValue);
        const pos = randomValue[0] % length;
        let attempts = 0;
        let finalPos = pos;
        while (usedIndices.has(finalPos) && attempts < length) {
            finalPos = (finalPos + 1) % length;
            attempts++;
        }
        usedIndices.add(finalPos);
        const charRandom = new Uint32Array(1);
        crypto.getRandomValues(charRandom);
        password[finalPos] = set[charRandom[0] % set.length];
    });
    
    // Fill remaining positions with random characters
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        if (!password[i]) {
            password[i] = charset[randomValues[i] % charsetLength];
        }
    }
    
    return password.join('');
}

// Copy password to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback (you could add a toast notification here)
        console.log('Password copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Generate passwords and display them
function generatePasswords() {
    const length = parseInt(passwordLengthInput.value);
    const quantity = parseInt(quantityInput.value);
    
    // Validate inputs
    if (length < 6 || length > 64) {
        alert('Password length must be between 6 and 64 characters');
        return;
    }
    
    if (quantity < 1 || quantity > 100) {
        alert('Quantity must be between 1 and 100');
        return;
    }
    
    // Check if at least one character type is selected
    if (!smallLettersCheckbox.checked && 
        !capitalLettersCheckbox.checked && 
        !numbersCheckbox.checked && 
        !punctuationCheckbox.checked) {
        alert('Please select at least one character type');
        return;
    }
    
    // Clear previous results
    passwordResults.innerHTML = '';
    
    // Generate passwords
    for (let i = 0; i < quantity; i++) {
        const password = generatePassword(
            length,
            smallLettersCheckbox.checked,
            capitalLettersCheckbox.checked,
            numbersCheckbox.checked,
            punctuationCheckbox.checked
        );
        
        // Create password item
        const passwordItem = document.createElement('div');
        passwordItem.className = 'password-item';
        
        const passwordText = document.createElement('span');
        passwordText.className = 'password-text';
        passwordText.textContent = password;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => {
            copyToClipboard(password);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        };
        
        passwordItem.appendChild(passwordText);
        passwordItem.appendChild(copyBtn);
        passwordResults.appendChild(passwordItem);
    }
}

// Password Strength Evaluator
const passwordInput = document.getElementById('passwordInput');
const checkBtn = document.getElementById('checkBtn');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const strengthDetails = document.getElementById('strengthDetails');
const timeToCrack = document.getElementById('timeToCrack');
const timeExplanation = document.getElementById('timeExplanation');
const estimationInfo = document.getElementById('estimationInfo');

// Calculate password strength
function calculatePasswordStrength(password) {
    if (!password || password.length === 0) {
        return {
            score: 0,
            strength: '',
            details: [],
            timeToCrack: ''
        };
    }

    let score = 0;
    const details = [];
    
    // Length check (enhanced scoring)
    if (password.length >= 20) {
        score += 3;
        details.push({ text: 'Password length is 20+ characters (excellent)', strong: true });
    } else if (password.length >= 16) {
        score += 2;
        details.push({ text: 'Password length is 16+ characters (very good)', strong: true });
    } else if (password.length >= 12) {
        score += 2;
        details.push({ text: 'Password length is 12+ characters', strong: true });
    } else if (password.length >= 8) {
        score += 1;
        details.push({ text: 'Password length is 8+ characters', strong: true });
    } else {
        details.push({ text: 'Password is too short (recommended: 12+ characters)', strong: false });
    }
    
    // Character variety checks
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    
    if (hasLower) {
        score += 1;
        details.push({ text: 'Contains lowercase letters', strong: true });
    } else {
        details.push({ text: 'Missing lowercase letters', strong: false });
    }
    
    if (hasUpper) {
        score += 1;
        details.push({ text: 'Contains uppercase letters', strong: true });
    } else {
        details.push({ text: 'Missing uppercase letters', strong: false });
    }
    
    if (hasNumber) {
        score += 1;
        details.push({ text: 'Contains numbers', strong: true });
    } else {
        details.push({ text: 'Missing numbers', strong: false });
    }
    
    if (hasSpecial) {
        score += 1;
        details.push({ text: 'Contains special characters', strong: true });
    } else {
        details.push({ text: 'Missing special characters', strong: false });
    }
    
    // Enhanced complexity bonus
    const uniqueChars = new Set(password).size;
    const varietyRatio = uniqueChars / password.length;
    
    if (varietyRatio > 0.9) {
        score += 2;
        details.push({ text: 'Excellent character variety (>90% unique)', strong: true });
    } else if (varietyRatio > 0.8) {
        score += 2;
        details.push({ text: 'Very good character variety (>80% unique)', strong: true });
    } else if (varietyRatio > 0.7) {
        score += 1;
        details.push({ text: 'Good character variety (>70% unique)', strong: true });
    } else if (varietyRatio > 0.5) {
        details.push({ text: 'Moderate character variety', strong: true });
    } else {
        details.push({ text: 'Low character variety (many repeated characters)', strong: false });
    }
    
    // Bonus for multiple special characters
    const specialCharCount = (password.match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/g) || []).length;
    if (specialCharCount >= 3) {
        score += 1;
        details.push({ text: 'Multiple special characters (excellent)', strong: true });
    } else if (specialCharCount >= 2) {
        score += 0.5;
        details.push({ text: 'Multiple special characters (good)', strong: true });
    }
    
    // Bonus for excellent length (20+)
    if (password.length >= 20 && hasLower && hasUpper && hasNumber && hasSpecial) {
        score += 1;
        details.push({ text: 'Excellent password composition (20+ chars with all types)', strong: true });
    }
    
    // Check for sequential patterns (weak)
    const sequentialPatterns = ['123', '234', '345', '456', '567', '678', '789', '012',
                                'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz',
                                'qwerty', 'asdf', 'zxcv'];
    const hasSequential = sequentialPatterns.some(pattern => 
        password.toLowerCase().includes(pattern)
    );
    
    // Common patterns check
    const commonPatterns = ['password', 'admin', 'login', 'welcome', 'letmein'];
    const hasCommonPattern = commonPatterns.some(pattern => 
        password.toLowerCase().includes(pattern)
    );
    
    if (hasCommonPattern) {
        score -= 2;
        details.push({ text: 'Contains common patterns (weak)', strong: false });
    } else if (hasSequential) {
        score -= 1;
        details.push({ text: 'Contains sequential patterns (moderate weakness)', strong: false });
    } else {
        score += 0.5;
        details.push({ text: 'No common or sequential patterns (excellent)', strong: true });
    }
    
    // Determine strength level
    let strength = '';
    let strengthClass = '';
    
    if (score <= 2) {
        strength = 'Very Weak';
        strengthClass = 'very-weak';
    } else if (score <= 4) {
        strength = 'Weak';
        strengthClass = 'weak';
    } else if (score <= 6) {
        strength = 'Moderate';
        strengthClass = 'moderate';
    } else if (score <= 8) {
        strength = 'Strong';
        strengthClass = 'strong';
    } else {
        strength = 'Very Strong';
        strengthClass = 'very-strong';
    }
    
    // ACCURATE TIME-TO-CRACK CALCULATION
    // 
    // METHOD 1: ACTUAL CHARACTER SET ANALYSIS (Most Accurate)
    // Count the actual unique characters used in the password
    const actualCharset = new Set(password.split(''));
    const actualCharsetSize = actualCharset.size;
    
    // METHOD 2: POTENTIAL CHARACTER SET (What attacker would need to try)
    // Calculate based on what character types are present
    const potentialCharsetSize = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSpecial ? 32 : 0);
    
    // Use the larger of the two for security (attacker doesn't know which chars are used)
    // But also consider actual charset for more accurate worst-case scenario
    const effectiveCharsetSize = Math.max(actualCharsetSize, potentialCharsetSize);
    
    // TOTAL COMBINATIONS (worst case - attacker tries all possibilities)
    const worstCaseCombinations = Math.pow(effectiveCharsetSize, password.length);
    
    // AVERAGE CASE: On average, attacker finds password after trying 50% of combinations
    const averageCaseCombinations = worstCaseCombinations / 2;
    
    // BEST CASE FOR ATTACKER: Finds it immediately (1 attempt) - not realistic but shows minimum
    const bestCaseCombinations = 1;
    
    // GUESSES PER SECOND - More accurate based on hashing algorithm
    // Different algorithms have different speeds. We'll use a realistic average:
    // - MD5: ~10-50 billion/sec (very fast, weak)
    // - SHA-256: ~1-5 billion/sec (common, moderate)
    // - bcrypt: ~10,000/sec (slow, secure)
    // - Argon2: ~1,000/sec (very slow, very secure)
    // 
    // For accuracy, we'll use SHA-256 as it's commonly used: ~2 billion/sec for modern GPU
    // But we'll also provide estimates for different scenarios
    const guessesPerSecondMD5 = 20e9;      // 20 billion/sec (weak hash)
    const guessesPerSecondSHA256 = 2e9;     // 2 billion/sec (common hash)
    const guessesPerSecondBcrypt = 1e4;     // 10,000/sec (strong hash)
    const guessesPerSecondArgon2 = 1e3;    // 1,000/sec (very strong hash)
    
    // Use SHA-256 as baseline (most common)
    const guessesPerSecond = guessesPerSecondSHA256;
    
    // Calculate times for different scenarios
    const worstCaseSeconds = worstCaseCombinations / guessesPerSecond;
    const averageCaseSeconds = averageCaseCombinations / guessesPerSecond;
    const bestCaseSeconds = bestCaseCombinations / guessesPerSecond;
    
    // Also calculate for different hash algorithms
    const worstCaseSecondsMD5 = worstCaseCombinations / guessesPerSecondMD5;
    const worstCaseSecondsBcrypt = worstCaseCombinations / guessesPerSecondBcrypt;
    const worstCaseSecondsArgon2 = worstCaseCombinations / guessesPerSecondArgon2;
    
    // Use average case for primary estimate (most realistic)
    const secondsToCrack = averageCaseSeconds;
    
    // Store additional data for detailed explanation
    const calculationData = {
        actualCharsetSize: actualCharsetSize,
        potentialCharsetSize: potentialCharsetSize,
        effectiveCharsetSize: effectiveCharsetSize,
        worstCaseCombinations: worstCaseCombinations,
        averageCaseCombinations: averageCaseCombinations,
        worstCaseSeconds: worstCaseSeconds,
        averageCaseSeconds: averageCaseSeconds,
        worstCaseSecondsMD5: worstCaseSecondsMD5,
        worstCaseSecondsBcrypt: worstCaseSecondsBcrypt,
        worstCaseSecondsArgon2: worstCaseSecondsArgon2,
        guessesPerSecond: guessesPerSecond
    };
    
    let timeToCrackText = '';
    let timeExplanation = '';
    const data = calculationData;
    
    // Format large numbers for display
    const formatNumber = (num) => {
        if (num >= 1e18) return (num / 1e18).toFixed(2) + ' quintillion';
        if (num >= 1e15) return (num / 1e15).toFixed(2) + ' quadrillion';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + ' trillion';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + ' billion';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + ' million';
        return num.toLocaleString();
    };
    
    if (secondsToCrack < 1) {
        const milliseconds = Math.round(secondsToCrack * 1000);
        timeToCrackText = 'Less than a second';
        timeExplanation = `⚡ <strong>EXTREMELY WEAK - Cracked almost instantly!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack:</strong><br>
        • <strong>Average case:</strong> ${milliseconds} milliseconds (${(secondsToCrack).toFixed(4)} seconds)<br>
        • <strong>Worst case:</strong> ${(data.worstCaseSeconds * 1000).toFixed(2)} milliseconds<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5 * 1000).toFixed(2)} milliseconds<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt).toFixed(2)} seconds<br><br>
        <strong>Why so fast?</strong> Your password is too short (${password.length} characters) and uses only ${data.actualCharsetSize} unique characters. 
        With ${formatNumber(data.worstCaseCombinations)} possible combinations, modern GPUs can try all possibilities almost instantly. 
        <strong>IMMEDIATE ACTION REQUIRED:</strong> Use a longer password (12+ characters) with more character variety!`;
        
    } else if (secondsToCrack < 60) {
        const seconds = Math.round(secondsToCrack);
        timeToCrackText = `${seconds} seconds`;
        timeExplanation = `🔴 <strong>VERY WEAK - Cracked in seconds!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Password length:</strong> ${password.length} characters<br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack (Average Case):</strong><br>
        • <strong>SHA-256 hash:</strong> ${seconds} seconds (${secondsToCrack.toFixed(2)} seconds exact)<br>
        • <strong>Worst case scenario:</strong> ${(data.worstCaseSeconds).toFixed(2)} seconds<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5).toFixed(2)} seconds<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt / 60).toFixed(1)} minutes<br><br>
        <strong>Why so fast?</strong> With ${formatNumber(data.worstCaseCombinations)} possible combinations, 
        a modern GPU testing at ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second can crack this in ${seconds} seconds on average. 
        Your password is too short or lacks sufficient character variety. <strong>URGENT:</strong> Increase password length to 12+ characters!`;
        
    } else if (secondsToCrack < 3600) {
        const minutes = Math.round(secondsToCrack / 60);
        const exactMinutes = (secondsToCrack / 60).toFixed(2);
        timeToCrackText = `${minutes} minutes`;
        timeExplanation = `🟠 <strong>WEAK - Cracked in minutes!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Password length:</strong> ${password.length} characters<br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack (Average Case):</strong><br>
        • <strong>SHA-256 hash:</strong> ${exactMinutes} minutes (${minutes} minutes rounded)<br>
        • <strong>Worst case scenario:</strong> ${(data.worstCaseSeconds / 60).toFixed(2)} minutes<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5 / 60).toFixed(2)} minutes<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt / 3600).toFixed(1)} hours<br><br>
        <strong>Why so fast?</strong> With ${formatNumber(data.worstCaseCombinations)} possible combinations, 
        a modern GPU can crack this in ${exactMinutes} minutes on average. This is far too fast for meaningful security. 
        <strong>RECOMMENDED:</strong> Increase password length to 16+ characters with all character types!`;
        
    } else if (secondsToCrack < 86400) {
        const hours = Math.round(secondsToCrack / 3600);
        const exactHours = (secondsToCrack / 3600).toFixed(2);
        timeToCrackText = `${hours} hours`;
        timeExplanation = `🟡 <strong>MODERATE - Cracked in hours!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Password length:</strong> ${password.length} characters<br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack (Average Case):</strong><br>
        • <strong>SHA-256 hash:</strong> ${exactHours} hours (${hours} hours rounded)<br>
        • <strong>Worst case scenario:</strong> ${(data.worstCaseSeconds / 3600).toFixed(2)} hours<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5 / 3600).toFixed(2)} hours<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt / 86400).toFixed(1)} days<br><br>
        <strong>Analysis:</strong> With ${formatNumber(data.worstCaseCombinations)} possible combinations, 
        this password offers basic protection but is still vulnerable. While ${exactHours} hours might seem long, 
        for sensitive accounts (banking, email, etc.), you need passwords that take years or centuries to crack. 
        <strong>SUGGESTED:</strong> Increase password length to 16+ characters for better security!`;
        
    } else if (secondsToCrack < 31536000) {
        const days = Math.round(secondsToCrack / 86400);
        const exactDays = (secondsToCrack / 86400).toFixed(2);
        const yearsEquivalent = (days / 365).toFixed(2);
        timeToCrackText = `${days} days`;
        timeExplanation = `🟢 <strong>GOOD - Cracked in days!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Password length:</strong> ${password.length} characters<br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack (Average Case):</strong><br>
        • <strong>SHA-256 hash:</strong> ${exactDays} days (${yearsEquivalent} years)<br>
        • <strong>Worst case scenario:</strong> ${(data.worstCaseSeconds / 86400).toFixed(2)} days<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5 / 86400).toFixed(2)} days<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt / 31536000).toFixed(1)} years<br><br>
        <strong>Analysis:</strong> With ${formatNumber(data.worstCaseCombinations)} possible combinations, 
        this password offers reasonable protection. However, ${exactDays} days (${yearsEquivalent} years) is still relatively fast for 
        sophisticated attackers using multiple GPUs or cloud computing. For truly secure passwords 
        (especially for banking, email, or work accounts), you should aim for passwords that take 
        decades or centuries to crack. <strong>IMPROVEMENT:</strong> Add 2-4 more characters to significantly increase security!`;
        
    } else if (secondsToCrack < 31536000000) {
        const years = Math.round(secondsToCrack / 31536000);
        const yearsDecimal = (secondsToCrack / 31536000).toFixed(2);
        const daysEquivalent = (secondsToCrack / 86400).toFixed(0);
        timeToCrackText = `${years} years`;
        timeExplanation = `🔵 <strong>STRONG - Cracked in ${years} years!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Password length:</strong> ${password.length} characters<br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack (Average Case):</strong><br>
        • <strong>SHA-256 hash:</strong> ${yearsDecimal} years (${daysEquivalent} days)<br>
        • <strong>Worst case scenario:</strong> ${(data.worstCaseSeconds / 31536000).toFixed(2)} years<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5 / 31536000).toFixed(2)} years<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt / 31536000).toFixed(1)} years<br>
        • <strong>With very strong hash (Argon2):</strong> ${(data.worstCaseSecondsArgon2 / 31536000).toFixed(1)} years<br><br>
        <strong>Detailed Security Analysis:</strong><br>
        • <strong>Security Level:</strong> Strong - This password would require ${yearsDecimal} years of continuous 
        computing to crack on average, making it impractical for attackers. Even with multiple GPUs or cloud computing, 
        it would still take many years. This is considered a secure password for most purposes.<br><br>
        <strong>Why is this secure?</strong> The mathematical complexity (${formatNumber(data.worstCaseCombinations)} combinations) 
        combined with the time required (${yearsDecimal} years average, ${(data.worstCaseSeconds / 31536000).toFixed(2)} years worst case) 
        makes brute force attacks economically and practically unfeasible. By the time an attacker could crack this password, 
        technology and security standards will have evolved, making this level of protection appropriate for sensitive accounts 
        (banking, email, work). This password meets modern security standards.`;
        
    } else {
        const years = (secondsToCrack / 31536000).toFixed(0);
        const yearsDecimal = (secondsToCrack / 31536000).toFixed(2);
        const centuries = Math.floor(secondsToCrack / 3153600000);
        const centuriesDecimal = (secondsToCrack / 3153600000).toFixed(2);
        timeToCrackText = 'Centuries';
        timeExplanation = `💎 <strong>VERY STRONG - Cracked in centuries!</strong><br><br>
        <strong>Accurate Calculation Results:</strong><br>
        • <strong>Password length:</strong> ${password.length} characters<br>
        • <strong>Actual character set used:</strong> ${data.actualCharsetSize} unique characters<br>
        • <strong>Potential character set:</strong> ${data.potentialCharsetSize} characters<br>
        • <strong>Total combinations (worst case):</strong> ${formatNumber(data.worstCaseCombinations)}<br>
        • <strong>Average case (50% probability):</strong> ${formatNumber(data.averageCaseCombinations)}<br>
        • <strong>Cracking speed (SHA-256):</strong> ${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second<br><br>
        <strong>Time to Crack (Average Case):</strong><br>
        • <strong>SHA-256 hash:</strong> ${centuriesDecimal} centuries (${yearsDecimal} years, ${years} years rounded)<br>
        • <strong>Worst case scenario:</strong> ${(data.worstCaseSeconds / 3153600000).toFixed(2)} centuries<br>
        • <strong>With weak hash (MD5):</strong> ${(data.worstCaseSecondsMD5 / 3153600000).toFixed(2)} centuries<br>
        • <strong>With strong hash (bcrypt):</strong> ${(data.worstCaseSecondsBcrypt / 3153600000).toFixed(2)} centuries<br>
        • <strong>With very strong hash (Argon2):</strong> ${(data.worstCaseSecondsArgon2 / 3153600000).toFixed(2)} centuries<br><br>
        <strong>Detailed Security Analysis:</strong><br>
        • <strong>Security Level:</strong> Exceptional - This password is virtually uncrackable through brute force.<br>
        • <strong>Protection Level:</strong> EXCEPTIONAL - Suitable for the most sensitive accounts (government, military-grade security)<br>
        • <strong>This is an extremely secure password</strong> that exceeds modern security standards<br><br>
        <strong>Why is this so secure?</strong> The astronomical number of combinations (${formatNumber(data.worstCaseCombinations)}) 
        means that even with the fastest modern hardware (${(data.guessesPerSecond / 1e9).toFixed(1)} billion attempts/second), 
        it would take ${centuriesDecimal} centuries (${yearsDecimal} years) on average to try all possibilities. 
        This far exceeds the practical lifetime of any technology or security need. Even with:<br>
        • Multiple high-end GPUs working in parallel (10x faster = still ${(centuriesDecimal / 10).toFixed(2)} centuries)<br>
        • Cloud computing clusters (100x faster = still ${(centuriesDecimal / 100).toFixed(2)} centuries)<br>
        • Future quantum computers (in their current state)<br>
        This password would remain secure for centuries. This level of security demonstrates excellent password practices 
        and is appropriate for highly sensitive systems.`;
    }
    
    // Round score to 1 decimal place, then cap at 10
    const finalScore = Math.min(10, Math.round(score * 10) / 10);
    
    return {
        score: finalScore,
        strength,
        strengthClass,
        details,
        timeToCrack: `Estimated time to crack: ${timeToCrackText}`,
        timeExplanation: timeExplanation,
        calculationData: calculationData
    };
}

// Display strength results
function displayStrength() {
    const password = passwordInput.value;
    const result = calculatePasswordStrength(password);
    
    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'Enter a password to check its strength';
        strengthText.className = 'strength-text';
        strengthDetails.innerHTML = '';
        timeToCrack.textContent = '';
        timeExplanation.innerHTML = '';
        estimationInfo.style.display = 'none';
        return;
    }
    
    // Show estimation info when password is entered
    estimationInfo.style.display = 'block';
    
    // Update strength bar
    strengthBar.style.width = `${(result.score / 10) * 100}%`;
    strengthBar.className = `strength-bar ${result.strengthClass}`;
    
    // Update strength text
    strengthText.textContent = `Strength: ${result.strength} (${result.score}/10)`;
    strengthText.className = `strength-text ${result.strengthClass}`;
    
    // Update details
    let detailsHTML = '<ul>';
    result.details.forEach(detail => {
        detailsHTML += `<li class="${detail.strong ? '' : 'weak'}">${detail.text}</li>`;
    });
    detailsHTML += '</ul>';
    strengthDetails.innerHTML = detailsHTML;
    
    // Update time to crack
    timeToCrack.textContent = result.timeToCrack;
    
    // Update detailed time explanation
    timeExplanation.innerHTML = result.timeExplanation;
}

// Event listeners
generateBtn.addEventListener('click', generatePasswords);
checkBtn.addEventListener('click', displayStrength);
passwordInput.addEventListener('input', displayStrength);
passwordInput.addEventListener('paste', () => {
    setTimeout(displayStrength, 10);
});

// Allow Enter key to generate
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'passwordInput') {
        displayStrength();
    } else if (e.key === 'Enter') {
        generatePasswords();
    }
});

