#!/usr/bin/env python3
"""
Test script for the recipe scraper
Run this to test the scraper locally before deploying to Vercel
"""

import requests
import json

def test_scraper():
    # Test URL - you can change this to any recipe URL
    test_url = "https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/"
    
    # Test data
    data = {
        "url": test_url
    }
    
    try:
        # Test local server (if running)
        response = requests.post(
            "http://localhost:8000",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Title: {result.get('title', 'N/A')}")
            print(f"Ingredients count: {len(result.get('ingredients', []))}")
            print(f"Instructions count: {len(result.get('instructions', []))}")
            print(f"Total time: {result.get('total_time', 'N/A')}")
            print(f"Image: {result.get('image', 'N/A')}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to local server")
        print("Make sure to run: python index.py")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_scraper() 