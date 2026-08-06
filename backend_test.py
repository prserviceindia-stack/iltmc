#!/usr/bin/env python3
"""
ILTMC Backend API Test Suite - NEW FEATURES
Tests new member signup flow, gallery management, and application system
"""

import requests
import json
import uuid
import base64
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://leones-admin.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@iltmc.com"
ADMIN_PASSWORD = "admin123"

class ILTMCAPITester:
    def __init__(self):
        self.admin_token = None
        self.member_token = None
        self.test_results = {}
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
        self.created_member_id = None
        self.created_gallery_id = None

    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        self.test_results[test_name] = {
            'success': success,
            'message': message,
            'response_data': response_data
        }
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")

    def make_request(self, method, endpoint, data=None, use_auth=False, token=None):
        """Make HTTP request with error handling"""
        url = f"{BASE_URL}{endpoint}"
        headers = {}
        
        if use_auth:
            auth_token = token if token else self.admin_token
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'
            
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=30)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=30)
            
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def get_captcha(self):
        """Get captcha for member signup/login"""
        response = self.make_request('GET', '/captcha/generate')
        if response and response.status_code == 200:
            data = response.json()
            # Parse the captcha question and calculate answer
            question = data['question']  # e.g., "5 + 3 = ?"
            parts = question.replace('=', '').replace('?', '').strip().split()
            num1 = int(parts[0])
            op = parts[1]
            num2 = int(parts[2])
            
            if op == '+':
                answer = num1 + num2
            elif op == '-':
                answer = num1 - num2
            elif op == '*':
                answer = num1 * num2
            
            return data['captchaId'], answer
        return None, None

    def test_admin_login(self):
        """Test admin authentication"""
        print("\n=== Testing Admin Login ===")
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.admin_token = data['token']
                    self.log_result("Admin Login", True, f"Admin login successful for {data['user']['email']}")
                else:
                    self.log_result("Admin Login", False, "Invalid response structure")
            except json.JSONDecodeError:
                self.log_result("Admin Login", False, "Invalid JSON response")
        else:
            self.log_result("Admin Login", False, f"Login failed: {response.status_code if response else 'No response'}")

    def test_member_signup(self):
        """Test member signup flow - creates account with pending status"""
        print("\n=== Testing Member Signup Flow ===")
        
        # Get captcha
        captcha_id, captcha_answer = self.get_captcha()
        if not captcha_id:
            self.log_result("Member Signup - Captcha", False, "Failed to get captcha")
            return
        
        self.log_result("Member Signup - Captcha", True, f"Captcha obtained: {captcha_id}")
        
        # Test member signup
        unique_email = f"testmember_{uuid.uuid4().hex[:8]}@iltmc.com"
        signup_data = {
            "email": unique_email,
            "password": "testpass123",
            "name": "Rajesh Kumar",
            "captchaId": captcha_id,
            "captchaAnswer": str(captcha_answer)
        }
        
        response = self.make_request('POST', '/member/signup', signup_data)
        
        if response and response.status_code == 201:
            try:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.member_token = data['token']
                    self.created_member_id = data['user']['id']
                    approval_status = data['user'].get('approvalStatus')
                    
                    if approval_status == 'pending':
                        self.log_result("Member Signup", True, f"Member account created with status 'pending'. ID: {self.created_member_id}")
                    else:
                        self.log_result("Member Signup", False, f"Expected status 'pending', got '{approval_status}'")
                else:
                    self.log_result("Member Signup", False, "Invalid response structure")
            except json.JSONDecodeError:
                self.log_result("Member Signup", False, "Invalid JSON response")
        else:
            self.log_result("Member Signup", False, f"Signup failed: {response.status_code if response else 'No response'}")

    def test_member_profile_pending(self):
        """Test member profile returns approvalStatus"""
        print("\n=== Testing Member Profile (Pending Status) ===")
        
        if not self.member_token:
            self.log_result("Member Profile - Pending", False, "No member token available")
            return
        
        response = self.make_request('GET', '/member/profile', use_auth=True, token=self.member_token)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'approvalStatus' in data:
                    status = data['approvalStatus']
                    if status == 'pending':
                        self.log_result("Member Profile - Pending", True, f"Profile shows approvalStatus: {status}")
                    else:
                        self.log_result("Member Profile - Pending", False, f"Expected 'pending', got '{status}'")
                else:
                    self.log_result("Member Profile - Pending", False, "approvalStatus field missing")
            except json.JSONDecodeError:
                self.log_result("Member Profile - Pending", False, "Invalid JSON response")
        else:
            self.log_result("Member Profile - Pending", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_joining_form_submission(self):
        """Test member joining form submission with documents"""
        print("\n=== Testing Joining Form Submission ===")
        
        if not self.member_token:
            self.log_result("Joining Form", False, "No member token available")
            return
        
        # Create fake base64 documents
        fake_aadhaar = base64.b64encode(b"FAKE_AADHAAR_DOCUMENT_DATA").decode('utf-8')
        fake_license = base64.b64encode(b"FAKE_DRIVING_LICENSE_DATA").decode('utf-8')
        
        form_data = {
            "roadName": "Thunder Rider",
            "phone": "+91-9876543210",
            "bike": "Royal Enfield Himalayan 450",
            "experience": "7 years of riding experience",
            "reason": "I want to join ILTMC to be part of the brotherhood and explore new riding adventures",
            "chapter": "Agartala",
            "aadhaarCard": fake_aadhaar,
            "aadhaarFileName": "aadhaar.jpg",
            "drivingLicense": fake_license,
            "drivingLicenseFileName": "license.jpg"
        }
        
        response = self.make_request('POST', '/member/joining-form', form_data, use_auth=True, token=self.member_token)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'approvalStatus' in data and data['approvalStatus'] == 'form_submitted':
                    self.log_result("Joining Form", True, "Form submitted successfully, status changed to 'form_submitted'")
                else:
                    self.log_result("Joining Form", False, f"Unexpected response: {data}")
            except json.JSONDecodeError:
                self.log_result("Joining Form", False, "Invalid JSON response")
        else:
            self.log_result("Joining Form", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_member_profile_form_submitted(self):
        """Test member profile after form submission"""
        print("\n=== Testing Member Profile (Form Submitted) ===")
        
        if not self.member_token:
            self.log_result("Member Profile - Form Submitted", False, "No member token available")
            return
        
        response = self.make_request('GET', '/member/profile', use_auth=True, token=self.member_token)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'approvalStatus' in data:
                    status = data['approvalStatus']
                    if status == 'form_submitted':
                        self.log_result("Member Profile - Form Submitted", True, f"Profile shows approvalStatus: {status}")
                    else:
                        self.log_result("Member Profile - Form Submitted", False, f"Expected 'form_submitted', got '{status}'")
                else:
                    self.log_result("Member Profile - Form Submitted", False, "approvalStatus field missing")
            except json.JSONDecodeError:
                self.log_result("Member Profile - Form Submitted", False, "Invalid JSON response")
        else:
            self.log_result("Member Profile - Form Submitted", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_admin_applications_list(self):
        """Test admin applications list includes signup applications with source field"""
        print("\n=== Testing Admin Applications List ===")
        
        if not self.admin_token:
            self.log_result("Admin Applications List", False, "No admin token available")
            return
        
        response = self.make_request('GET', '/admin/applications', use_auth=True)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    # Check if our signup application is in the list
                    signup_apps = [app for app in data if app.get('source') == 'signup']
                    direct_apps = [app for app in data if app.get('source') == 'direct']
                    
                    found_our_app = any(app.get('id') == self.created_member_id for app in data)
                    
                    if found_our_app:
                        self.log_result("Admin Applications List", True, 
                                      f"Applications list includes signup applications. Total: {len(data)}, Signup: {len(signup_apps)}, Direct: {len(direct_apps)}")
                    else:
                        self.log_result("Admin Applications List", False, 
                                      f"Our signup application not found in list. Total apps: {len(data)}")
                else:
                    self.log_result("Admin Applications List", False, "Response is not a list")
            except json.JSONDecodeError:
                self.log_result("Admin Applications List", False, "Invalid JSON response")
        else:
            self.log_result("Admin Applications List", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_admin_approve_application(self):
        """Test admin approving member application"""
        print("\n=== Testing Admin Approve Application ===")
        
        if not self.admin_token or not self.created_member_id:
            self.log_result("Admin Approve Application", False, "No admin token or member ID available")
            return
        
        approve_data = {
            "status": "approved",
            "memberType": "prospect"
        }
        
        response = self.make_request('PUT', f'/admin/applications/{self.created_member_id}', approve_data, use_auth=True)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'message' in data and 'approved' in data['message'].lower():
                    self.log_result("Admin Approve Application", True, "Application approved successfully")
                else:
                    self.log_result("Admin Approve Application", False, f"Unexpected response: {data}")
            except json.JSONDecodeError:
                self.log_result("Admin Approve Application", False, "Invalid JSON response")
        else:
            self.log_result("Admin Approve Application", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_member_profile_approved(self):
        """Test member profile after approval"""
        print("\n=== Testing Member Profile (Approved) ===")
        
        if not self.member_token:
            self.log_result("Member Profile - Approved", False, "No member token available")
            return
        
        response = self.make_request('GET', '/member/profile', use_auth=True, token=self.member_token)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'approvalStatus' in data:
                    status = data['approvalStatus']
                    if status == 'approved':
                        self.log_result("Member Profile - Approved", True, f"Profile shows approvalStatus: {status}")
                    else:
                        self.log_result("Member Profile - Approved", False, f"Expected 'approved', got '{status}'")
                else:
                    self.log_result("Member Profile - Approved", False, "approvalStatus field missing")
            except json.JSONDecodeError:
                self.log_result("Member Profile - Approved", False, "Invalid JSON response")
        else:
            self.log_result("Member Profile - Approved", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_public_member_profile(self):
        """Test public member profile with rank uploads"""
        print("\n=== Testing Public Member Profile ===")
        
        if not self.created_member_id:
            self.log_result("Public Member Profile", False, "No member ID available")
            return
        
        response = self.make_request('GET', f'/members/{self.created_member_id}/profile')
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'rankUploads' in data:
                    self.log_result("Public Member Profile", True, 
                                  f"Public profile retrieved with rankUploads field. Uploads: {len(data['rankUploads'])}")
                else:
                    self.log_result("Public Member Profile", False, "rankUploads field missing")
            except json.JSONDecodeError:
                self.log_result("Public Member Profile", False, "Invalid JSON response")
        else:
            self.log_result("Public Member Profile", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_gallery_management(self):
        """Test gallery management APIs"""
        print("\n=== Testing Gallery Management ===")
        
        if not self.admin_token:
            self.log_result("Gallery Management", False, "No admin token available")
            return
        
        # Test GET all gallery items (admin)
        response = self.make_request('GET', '/admin/gallery', use_auth=True)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.log_result("Gallery - Admin List", True, f"Retrieved {len(data)} gallery items")
            except json.JSONDecodeError:
                self.log_result("Gallery - Admin List", False, "Invalid JSON response")
        else:
            self.log_result("Gallery - Admin List", False, f"Failed: {response.status_code if response else 'No response'}")
        
        # Test POST - Add to gallery
        gallery_data = {
            "title": "Test Ride Photo",
            "description": "A beautiful mountain ride captured",
            "imageUrl": "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
            "category": "rides",
            "isPublic": True
        }
        
        response = self.make_request('POST', '/admin/gallery', gallery_data, use_auth=True)
        if response and response.status_code == 201:
            try:
                data = response.json()
                self.created_gallery_id = data.get('id')
                self.log_result("Gallery - Create", True, f"Gallery item created with ID: {self.created_gallery_id}")
            except json.JSONDecodeError:
                self.log_result("Gallery - Create", False, "Invalid JSON response")
        else:
            self.log_result("Gallery - Create", False, f"Failed: {response.status_code if response else 'No response'}")
        
        # Test PUT - Update gallery item
        if self.created_gallery_id:
            update_data = {
                "title": "Updated Test Ride Photo",
                "description": "Updated description"
            }
            response = self.make_request('PUT', f'/admin/gallery/{self.created_gallery_id}', update_data, use_auth=True)
            
            if response and response.status_code == 200:
                self.log_result("Gallery - Update", True, "Gallery item updated successfully")
            else:
                self.log_result("Gallery - Update", False, f"Failed: {response.status_code if response else 'No response'}")
        
        # Test GET public gallery
        response = self.make_request('GET', '/gallery')
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.log_result("Gallery - Public List", True, f"Public gallery retrieved with {len(data)} items")
            except json.JSONDecodeError:
                self.log_result("Gallery - Public List", False, "Invalid JSON response")
        else:
            self.log_result("Gallery - Public List", False, f"Failed: {response.status_code if response else 'No response'}")
        
        # Test DELETE - Delete gallery item
        if self.created_gallery_id:
            response = self.make_request('DELETE', f'/admin/gallery/{self.created_gallery_id}', use_auth=True)
            
            if response and response.status_code == 200:
                self.log_result("Gallery - Delete", True, "Gallery item deleted successfully")
            else:
                self.log_result("Gallery - Delete", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_admin_reject_application(self):
        """Test admin rejecting an application (create new member for this)"""
        print("\n=== Testing Admin Reject Application ===")
        
        # Create another member to test rejection
        captcha_id, captcha_answer = self.get_captcha()
        if not captcha_id:
            self.log_result("Admin Reject - Setup", False, "Failed to get captcha")
            return
        
        unique_email = f"rejecttest_{uuid.uuid4().hex[:8]}@iltmc.com"
        signup_data = {
            "email": unique_email,
            "password": "testpass123",
            "name": "Reject Test User",
            "captchaId": captcha_id,
            "captchaAnswer": str(captcha_answer)
        }
        
        response = self.make_request('POST', '/member/signup', signup_data)
        
        if response and response.status_code == 201:
            data = response.json()
            reject_member_id = data['user']['id']
            reject_token = data['token']
            
            # Submit joining form
            fake_aadhaar = base64.b64encode(b"FAKE_AADHAAR_DATA").decode('utf-8')
            fake_license = base64.b64encode(b"FAKE_LICENSE_DATA").decode('utf-8')
            
            form_data = {
                "roadName": "Test Reject",
                "phone": "+91-9999999999",
                "bike": "Test Bike",
                "experience": "Test",
                "reason": "Test",
                "chapter": "Agartala",
                "aadhaarCard": fake_aadhaar,
                "aadhaarFileName": "aadhaar.jpg",
                "drivingLicense": fake_license,
                "drivingLicenseFileName": "license.jpg"
            }
            
            self.make_request('POST', '/member/joining-form', form_data, use_auth=True, token=reject_token)
            
            # Now reject the application
            reject_data = {
                "status": "rejected"
            }
            
            response = self.make_request('PUT', f'/admin/applications/{reject_member_id}', reject_data, use_auth=True)
            
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    if 'message' in data and 'rejected' in data['message'].lower():
                        self.log_result("Admin Reject Application", True, "Application rejected successfully")
                    else:
                        self.log_result("Admin Reject Application", False, f"Unexpected response: {data}")
                except json.JSONDecodeError:
                    self.log_result("Admin Reject Application", False, "Invalid JSON response")
            else:
                self.log_result("Admin Reject Application", False, f"Failed: {response.status_code if response else 'No response'}")
        else:
            self.log_result("Admin Reject - Setup", False, "Failed to create test member for rejection")

    def run_all_tests(self):
        """Run all backend tests for new features"""
        print("🚀 Starting ILTMC Backend API Test Suite - NEW FEATURES")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 80)
        
        # Test in order of the flow
        self.test_admin_login()
        
        # Member Signup & Approval Flow
        self.test_member_signup()
        self.test_member_profile_pending()
        self.test_joining_form_submission()
        self.test_member_profile_form_submitted()
        self.test_admin_applications_list()
        self.test_admin_approve_application()
        self.test_member_profile_approved()
        
        # Public Member Profile
        self.test_public_member_profile()
        
        # Gallery Management
        self.test_gallery_management()
        
        # Test rejection flow
        self.test_admin_reject_application()
        
        # Print final summary
        print("\n" + "=" * 80)
        print("📊 FINAL TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for test_name, result in self.test_results.items():
                if not result['success']:
                    print(f"   ❌ {test_name}: {result['message']}")
        
        return passed_tests == total_tests


if __name__ == "__main__":
    tester = ILTMCAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All backend tests passed!")
        exit(0)
    else:
        print("\n⚠️ Some backend tests failed. Check logs above.")
        exit(1)
