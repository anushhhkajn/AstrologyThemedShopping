import csv
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Function to load products from CSV
def load_products():
    products = []
    with open('products.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            row['id'] = int(row['id'])
            products.append(row)
    return products

# Function to load users from CSV
def load_users():
    users = []
    with open('users.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            row['user_id'] = int(row['user_id'])
            row['liked_products'] = list(map(int, row['liked_products'].split(',')))
            users.append(row)
    return users

products = load_products()
user_data = load_users()

@app.route('/assign_astro_sign', methods=['POST'])
def assign_astro_sign():
    data = request.json
    name = data.get('name')
    
    # Simple astro sign assignment based on first letter of the name
    astro_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    index = ord(name[0].upper()) % len(astro_signs)
    astro_sign = astro_signs[index]

    return jsonify({"astro_sign": astro_sign})

@app.route('/recommend_products', methods=['POST'])
def recommend_products():
    data = request.json
    astro_sign = data.get('astro_sign')

    # Collaborative Filtering: Recommend products liked by other users with the same astrological sign
    user_liked_products = []
    for user in user_data:
        if user['astro_sign'] == astro_sign:
            user_liked_products.extend(user['liked_products'])

    # Remove duplicates and recommend unique products
    user_liked_products = list(set(user_liked_products))
    liked_product_details = [{**product, "source": "collaborative"} for product in products if product['id'] in user_liked_products]

    # Content-Based Filtering: Recommend products based on category
    category_counts = {}
    for product in liked_product_details:
        if product['category'] not in category_counts:
            category_counts[product['category']] = 0
        category_counts[product['category']] += 1

    content_based_recommendations = []
    for product in products:
        if product['category'] in category_counts and product['astro_sign'] != astro_sign:
            content_based_recommendations.append({**product, "source": "content-based"})

    # Combine both lists and remove duplicates
    combined_recommendations = {product['id']: product for product in (liked_product_details + content_based_recommendations)}

    return jsonify({"recommended_products": list(combined_recommendations.values())})

if __name__ == '__main__':
    app.run(debug=True)
