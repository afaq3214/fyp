from fastapi import FastAPI
import requests
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import os
from datetime import datetime

app = FastAPI()

@app.post("/getadatata")
def home():
    return {"message": "Jillian's AI Ranking API is running!"}

@app.get("/products")
def get_products():
    try:
        response = requests.get("http://localhost:5000/api/products")  # Replace with your backend URL
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

@app.get("/train-popular-products")
def train_popular_products():
    try:
        # Fetch products data from the backend
        response = requests.get("http://localhost:5000/api/products")
        response.raise_for_status()
        products = response.json()
        
        # Convert products data to a DataFrame
        df = pd.DataFrame(products)
        df.to_csv("all_products_data.csv", index=False)
        # Perform all transformations before saving the DataFrame
        df['upvotes'] = df['upvotes'].apply(len)
        df['is_popular'] = ((df['upvotes'] > 1) & (df['totalcomments'] > 5)).astype(int)

        # Update the 'updatedAt' field to the current timestamp
        df['updatedAt'] = datetime.now().isoformat()

        # Print the popular products to the console
        popular_products = df[df['is_popular'] == 1]
        print("Popular Products:")
        print(popular_products)

        # Ensure the 'is_popular' column is updated before saving
        df['is_popular'] = ((df['upvotes'] > 1) & (df['totalcomments'] > 5)).astype(int)

        # Save the updated DataFrame to a temporary directory
        temp_dir = os.path.join(os.getcwd(), "temp")
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, "products_data.csv")
        df.to_csv(file_path, index=False)

        # Print confirmation
        print("Updated CSV saved with popular products.")

        # Ensure required columns exist
        if 'upvotes' not in df.columns or 'totalcomments' not in df.columns:
            return {"error": "Required columns 'upvotes' and 'totalcomments' are missing in the data."}

        # Features and target
        X = df[['upvotes', 'totalcomments']]
        y = df['is_popular']

        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Check if there are at least two classes in the target variable
        if len(y.unique()) < 2:
            return {"error": "The dataset must contain at least two classes in the target variable 'is_popular'."}

        # Check if there are at least two classes in the target variable after filtering
        if df['is_popular'].sum() == 0 or df['is_popular'].sum() == len(df):
            return {"error": "The dataset must contain at least one popular and one non-popular product to train the model."}

        # Train a logistic regression model
        model = LogisticRegression()
        model.fit(X_train, y_train)

        # Evaluate the model
        accuracy = model.score(X_test, y_test)
      
        return {"message": "Model trained successfully!", "accuracy": accuracy}

    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def root():
    return {"message": "Welcome to Jillian's API!"}
