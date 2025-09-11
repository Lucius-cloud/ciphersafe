// utils/breachChecker.js
const axios = require('axios');
const crypto = require('crypto');

// Function to check if password has been breached
async function checkHIBP(password) {
  // SHA1 hash the password (HIBP uses SHA1 hashes)
  const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();

  // Split hash into prefix and suffix
  const prefix = sha1Hash.slice(0, 5);
  const suffix = sha1Hash.slice(5);

  // Query HIBP API with prefix
  const url = `https://api.pwnedpasswords.com/range/${prefix}`;

  try {
    const response = await axios.get(url);
    const hashes = response.data.split("\n");

    // Check if the suffix exists in the list of hashes
    for (const line of hashes) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix === suffix) {
        return parseInt(count, 10); // Return the breach count
      }
    }

    return 0; // Password not found in HIBP
  } catch (error) {
    console.error("Error with HIBP API:", error.message);
    return -1; // Indicating failure in API call
  }
}

module.exports = checkHIBP;
