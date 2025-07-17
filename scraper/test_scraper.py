#!/usr/bin/env python3
"""
Test script for the recipe scraper with enhanced error handling
"""

import json
import sys
from scraper import scrape_recipe

def test_scraper():
    """Test the scraper with various URLs to verify error handling"""
    
    test_cases = [
        {
            "name": "Valid recipe URL",
            "url": "https://www.allrecipes.com/recipe/24074/alysias-basic-meat-lasagna/",
            "expected": "success"
        },
        {
            "name": "Empty URL",
            "url": "",
            "expected": "error"
        },
        {
            "name": "Invalid URL",
            "url": "not-a-url",
            "expected": "error"
        },
        {
            "name": "Non-existent URL",
            "url": "https://www.example.com/nonexistent-recipe",
            "expected": "error"
        },
        {
            "name": "Unsupported website",
            "url": "https://www.unsupported-site.com/recipe",
            "expected": "error"
        },
        {
            "name": "Non-recipe page",
            "url": "https://www.google.com",
            "expected": "error"
        }
    ]
    
    print("Testing recipe scraper with enhanced error handling...")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. {test_case['name']}")
        print(f"   URL: {test_case['url']}")
        print(f"   Expected: {test_case['expected']}")
        
        try:
            if not test_case['url']:
                result = scrape_recipe(test_case['url'])
            else:
                result = scrape_recipe(test_case['url'])
            
            if test_case['expected'] == "success":
                if isinstance(result, dict) and "error" not in result:
                    print("   ✅ PASS: Successfully scraped recipe")
                    print(f"   Title: {result.get('title', 'N/A')}")
                    print(f"   Ingredients: {len(result.get('ingredients', []))} items")
                    print(f"   Instructions: {len(result.get('instructions', []))} steps")
                else:
                    print(f"   ❌ FAIL: Expected success but got error: {result.get('error', 'Unknown error')}")
            else:
                if isinstance(result, dict) and "error" in result:
                    print(f"   ✅ PASS: Correctly returned error: {result['error']}")
                else:
                    print(f"   ❌ FAIL: Expected error but got success")
                    
        except Exception as e:
            if test_case['expected'] == "error":
                print(f"   ✅ PASS: Correctly raised exception: {str(e)}")
            else:
                print(f"   ❌ FAIL: Unexpected exception: {str(e)}")
        
        print("-" * 40)

def test_validation():
    """Test the validation function specifically"""
    print("\n" + "=" * 60)
    print("Testing recipe data validation...")
    print("=" * 60)
    
    # Test cases for validation
    test_data = [
        {
            "name": "Complete recipe data",
            "data": {
                "title": "Test Recipe",
                "ingredients": ["ingredient 1", "ingredient 2"],
                "instructions": ["step 1", "step 2"]
            },
            "should_pass": True
        },
        {
            "name": "Missing title",
            "data": {
                "title": "",
                "ingredients": ["ingredient 1"],
                "instructions": ["step 1"]
            },
            "should_pass": False
        },
        {
            "name": "Missing ingredients",
            "data": {
                "title": "Test Recipe",
                "ingredients": [],
                "instructions": ["step 1"]
            },
            "should_pass": False
        },
        {
            "name": "Missing instructions",
            "data": {
                "title": "Test Recipe",
                "ingredients": ["ingredient 1"],
                "instructions": []
            },
            "should_pass": False
        }
    ]
    
    for test_case in test_data:
        print(f"\n{test_case['name']}")
        try:
            # Import the validation function
            from scraper import validate_recipe_data
            errors = validate_recipe_data(test_case['data'])
            
            if test_case['should_pass'] and not errors:
                print("   ✅ PASS: Validation passed as expected")
            elif not test_case['should_pass'] and errors:
                print(f"   ✅ PASS: Validation correctly found errors: {errors}")
            else:
                print(f"   ❌ FAIL: Validation result unexpected. Errors: {errors}")
                
        except Exception as e:
            print(f"   ❌ FAIL: Validation function error: {str(e)}")

if __name__ == "__main__":
    print("Recipe Scraper Test Suite")
    print("Enhanced Error Handling Verification")
    print("=" * 60)
    
    try:
        test_scraper()
        test_validation()
        print("\n" + "=" * 60)
        print("Test suite completed!")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {str(e)}")
        sys.exit(1) 