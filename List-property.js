// Modal Handling
const bookingModal = document.getElementById('bookingModal');
const messageModal = document.getElementById('messageModal');
const previewModal = document.getElementById('previewModal');
const closeButtons = document.getElementsByClassName('close-modal');

// Real-Time Rent Display
const rentInput = document.getElementById('rent');
const rentPeriodRadios = document.querySelectorAll('input[name="price_period"]');
const previewContent = document.getElementById('previewContent');

// Show estimated annual rent
function calculateAnnualRent() {
    const rentValue = rentInput.value;
    const period = document.querySelector('input[name="price_period"]:checked').value;
    let annualRent = 0;

    if (rentValue) {
        annualRent = period === 'weekly' ? rentValue * 52 : rentValue * 12;
    }

    return `Estimated Annual Rent: £${annualRent.toLocaleString()}`;
}

// Update rent estimate as user types
rentInput.addEventListener('input', () => {
    document.getElementById('rentEstimate').textContent = calculateAnnualRent();
});

rentPeriodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        document.getElementById('rentEstimate').textContent = calculateAnnualRent();
    });
});

// Image Preview
document.getElementById('propertyImage').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgPreview = document.createElement('img');
            imgPreview.src = e.target.result;
            imgPreview.alt = "Property Image Preview";
            imgPreview.style.maxWidth = "100%";
            imgPreview.style.marginTop = "1rem";
            
            // Remove any previous preview image
            const previousImage = document.querySelector('.image-preview img');
            if (previousImage) {
                previousImage.remove();
            }

            // Append the new image
            document.querySelector('.image-preview').appendChild(imgPreview);
        };
        reader.readAsDataURL(file);
    }
});

// Show Preview Modal
function showPreview() {
    // Basic form validation
    const requiredFields = ['bedrooms', 'rent', 'address', 'street', 'city', 'postcode', 'county', 'fullname', 'phone', 'email'];
    let valid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            field.style.border = "1px solid red";
            valid = false;
        } else {
            field.style.border = "1px solid #ddd";
        }
    });

    if (!valid) {
        alert("Please fill in all required fields.");
        return;
    }

    // Create Preview Content
    previewContent.innerHTML = `
        <p><strong>Bedrooms:</strong> ${document.getElementById('bedrooms').value}</p>
        <p><strong>Rent:</strong> £${document.getElementById('rent').value} per ${
            document.querySelector('input[name="price_period"]:checked').value
        } (${calculateAnnualRent()})</p>
        <p><strong>Address:</strong> ${document.getElementById('address').value}, ${document.getElementById('street').value}, ${document.getElementById('city').value}, ${document.getElementById('postcode').value}, ${document.getElementById('county').value}</p>
        <p><strong>Description:</strong> ${document.getElementById('description').value || 'N/A'}</p>
        <p><strong>Contact:</strong> ${document.getElementById('fullname').value}, ${document.getElementById('phone').value}, ${document.getElementById('email').value}</p>
        <p><strong>Listed By:</strong> ${
            document.querySelector('input[name="user_type"]:checked').parentElement.innerText.trim()
        }</p>`;

    previewModal.style.display = 'block';
}

// Close Preview Modal
function closePreview() {
    previewModal.style.display = 'none';
}

// Close modal with Esc key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePreview();
    }
});

// Clear Form on Submission
document.querySelector('.submit-btn').addEventListener('click', function() {
    alert("Property listed successfully!");
    document.querySelector('form').reset();
    const imgPreview = document.querySelector('.image-preview img');
    if (imgPreview) imgPreview.remove();
    closePreview();
});

// Event Listeners for Close Buttons
Array.from(closeButtons).forEach(button => {
    button.addEventListener('click', () => {
        bookingModal.style.display = 'none';
        messageModal.style.display = 'none';
        previewModal.style.display = 'none';
    });
});

// Hide Modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target == bookingModal || event.target == messageModal || event.target == previewModal) {
        bookingModal.style.display = 'none';
        messageModal.style.display = 'none';
        previewModal.style.display = 'none';
    }
});
