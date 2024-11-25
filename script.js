const handleFormSubmit = async (formId, type) => {
    const form = document.getElementById(formId);
    if (!form) return; // Exit if form not found on the page

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = { type }; // Add the submission type (signup or article)
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch('/handleFormSubmission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const message = await response.text();
            alert(message);

            if (response.ok) {
                form.reset();
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form.');
        }
    });
};

// Detect the form on the page and attach the correct handler
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('signupForm')) {
        handleFormSubmit('signupForm', 'signup');
    } else if (document.getElementById('articleForm')) {
        handleFormSubmit('articleForm', 'article');
    }
});
