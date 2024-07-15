document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('astro-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        try {
            const response = await fetch('http://127.0.0.1:5000/assign_astro_sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            if (response.ok) {
                const data = await response.json();
                const astroSignDiv = document.getElementById('astro-sign');
                astroSignDiv.innerText = `Your astrological sign is: ${data.astro_sign}`;
                astroSignDiv.classList.add('bold');

                // Fetch product recommendations based on astro sign
                const recResponse = await fetch('http://127.0.0.1:5000/recommend_products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ astro_sign: data.astro_sign })
                });
                if (recResponse.ok) {
                    const recData = await recResponse.json();
                    displayRecommendations(recData.recommended_products);
                } else {
                    document.getElementById('product-grid').innerText = `Error: Unable to fetch recommendations`;
                }
            } else {
                document.getElementById('astro-sign').innerText = `Error: Unable to fetch astrological sign`;
            }
        } catch (error) {
            document.getElementById('astro-sign').innerText = `Error: ${error.message}`;
            console.error('Error:', error);
        }
    });

    function displayRecommendations(products) {
        const recommendationsSection = document.getElementById('recommendations');
        const productGrid = document.getElementById('product-grid');
        productGrid.innerHTML = '';

        if (products.length === 0) {
            productGrid.innerText = 'No products found for your astrological sign.';
        } else {
            products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

                // Create anchor element
                const productLink = document.createElement('a');
                productLink.href = product.product_url;
                productLink.target = "_blank";  // Open in a new tab

                // Create image element
                const productImage = document.createElement('img');
                productImage.src = product.image_url;
                productImage.alt = product.name;

                // Create title element
                const productTitle = document.createElement('h3');
                productTitle.innerText = product.name;

                // Create category element
                const productCategory = document.createElement('p');
                productCategory.innerText = `Category: ${product.category}`;

                // Append elements to product link
                productLink.appendChild(productImage);
                productLink.appendChild(productTitle);
                productLink.appendChild(productCategory);

                // Append product link to product card
                productCard.appendChild(productLink);

                // Append product card to grid
                productGrid.appendChild(productCard);
            });
            recommendationsSection.classList.add('visible');
        }
    }
});
