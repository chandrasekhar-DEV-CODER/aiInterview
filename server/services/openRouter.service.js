import axios from "axios";

export const askAi = async (messages) => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: "openrouter/free", 
                messages: messages,
            }, {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 45000 // Increase to 45 seconds
            });

            if (response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            }
        } catch (error) {
            attempts++;
            console.warn(`Attempt ${attempts} failed. Error: ${error.message}`);
            
            // If it's a network/SSL error, wait 2 seconds and try again
            if (attempts < maxAttempts) {
                await new Promise(res => setTimeout(res, 2000));
            } else {
                throw new Error("AI Service is currently unstable. Please check your internet or try a different network.");
            }
        }
    }
};