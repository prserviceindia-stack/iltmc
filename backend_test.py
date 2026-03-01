#!/usr/bin/env python3
"""
ILTMC Backend API Test Suite
Tests all backend APIs for the Intrepidus Leones Tripura Motorcycle Club
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://leones-admin.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@iltmc.com"
ADMIN_PASSWORD = "admin123"

class ILTMCAPITester:
    def __init__(self):
        self.token = None
        self.test_results = {}
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })

    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        self.test_results[test_name] = {
            'success': success,
            'message': message,
            'response_data': response_data
        }
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")

    def make_request(self, method, endpoint, data=None, use_auth=False):
        """Make HTTP request with error handling"""
        url = f"{BASE_URL}{endpoint}"
        headers = {}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def test_auth_login(self):
        """Test authentication login API"""
        print("\n=== Testing Auth System - Login API ===")
        
        # Test valid login
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.token = data['token']
                    self.log_result("Auth Login", True, f"Login successful for {data['user']['email']}", data)
                    
                    # Test token verification
                    verify_response = self.make_request('GET', '/auth/verify', use_auth=True)
                    if verify_response and verify_response.status_code == 200:
                        self.log_result("Auth Token Verify", True, "Token verification successful")
                    else:
                        self.log_result("Auth Token Verify", False, f"Token verification failed: {verify_response.status_code if verify_response else 'No response'}")
                else:
                    self.log_result("Auth Login", False, "Invalid response structure", data)
            except json.JSONDecodeError:
                self.log_result("Auth Login", False, "Invalid JSON response")
        else:
            self.log_result("Auth Login", False, f"Login failed: {response.status_code if response else 'No response'}")
            
        # Test invalid login
        invalid_data = {"email": "wrong@test.com", "password": "wrong"}
        response = self.make_request('POST', '/auth/login', invalid_data)
        if response and response.status_code == 401:
            self.log_result("Auth Invalid Login", True, "Invalid login properly rejected")
        else:
            self.log_result("Auth Invalid Login", False, f"Invalid login not properly handled: {response.status_code if response else 'No response'}")

    def test_public_stats(self):
        """Test public stats API"""
        print("\n=== Testing Public Stats API ===")
        
        response = self.make_request('GET', '/stats')
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                required_fields = ['totalMembers', 'activeMembers', 'totalRides', 'totalEvents', 'totalDistance', 'yearsActive']
                
                if all(field in data for field in required_fields):
                    self.log_result("Public Stats", True, f"Stats retrieved successfully: {data}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Public Stats", False, f"Missing fields: {missing}")
            except json.JSONDecodeError:
                self.log_result("Public Stats", False, "Invalid JSON response")
        else:
            self.log_result("Public Stats", False, f"Stats API failed: {response.status_code if response else 'No response'}")

    def test_public_apis(self):
        """Test all public APIs"""
        print("\n=== Testing Public APIs ===")
        
        public_endpoints = [
            ('/members/public', 'Public Members'),
            ('/rides/public', 'Public Rides'),
            ('/rides/upcoming', 'Upcoming Rides'),
            ('/events/upcoming', 'Upcoming Events'),
            ('/ranks', 'Ranks List'),
            ('/chapters', 'Chapters List')
        ]
        
        for endpoint, name in public_endpoints:
            response = self.make_request('GET', endpoint)
            
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_result(name, True, f"Retrieved {len(data)} items")
                    else:
                        self.log_result(name, True, "Data retrieved successfully")
                except json.JSONDecodeError:
                    self.log_result(name, False, "Invalid JSON response")
            else:
                self.log_result(name, False, f"Failed: {response.status_code if response else 'No response'}")

    def test_admin_dashboard(self):
        """Test admin dashboard API"""
        print("\n=== Testing Admin Dashboard ===")
        
        if not self.token:
            self.log_result("Admin Dashboard", False, "No auth token available")
            return
            
        response = self.make_request('GET', '/admin/dashboard', use_auth=True)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                required_fields = ['totalMembers', 'activeMembers', 'prospects', 'pendingApplications', 
                                 'totalRides', 'upcomingRides', 'totalEvents', 'unreadContacts', 'attendanceRate']
                
                if all(field in data for field in required_fields):
                    self.log_result("Admin Dashboard", True, f"Dashboard data retrieved: {data}", data)
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Admin Dashboard", False, f"Missing dashboard fields: {missing}")
            except json.JSONDecodeError:
                self.log_result("Admin Dashboard", False, "Invalid JSON response")
        else:
            self.log_result("Admin Dashboard", False, f"Dashboard API failed: {response.status_code if response else 'No response'}")

    def test_members_crud(self):
        """Test Members CRUD operations"""
        print("\n=== Testing Members CRUD APIs ===")
        
        if not self.token:
            self.log_result("Members CRUD", False, "No auth token available")
            return

        # Test GET all members
        response = self.make_request('GET', '/admin/members', use_auth=True)
        if response and response.status_code == 200:
            try:
                members = response.json()
                self.log_result("Members List", True, f"Retrieved {len(members)} members")
            except json.JSONDecodeError:
                self.log_result("Members List", False, "Invalid JSON response")
        else:
            self.log_result("Members List", False, f"Failed: {response.status_code if response else 'No response'}")

        # Test CREATE member
        member_data = {
            "name": "John Test Rider",
            "email": "john.test@iltmc.com",
            "phone": "+91-9876543210",
            "bike": "Royal Enfield Classic 350",
            "chapter": "Agartala",
            "rank": "Prospect",
            "status": "prospect"
        }
        
        response = self.make_request('POST', '/admin/members', member_data, use_auth=True)
        created_member_id = None
        
        if response and response.status_code == 201:
            try:
                data = response.json()
                created_member_id = data.get('id')
                self.log_result("Members Create", True, f"Member created with ID: {created_member_id}")
            except json.JSONDecodeError:
                self.log_result("Members Create", False, "Invalid JSON response")
        else:
            self.log_result("Members Create", False, f"Failed: {response.status_code if response else 'No response'}")

        # Test UPDATE member (if created successfully)
        if created_member_id:
            update_data = {
                "status": "active",
                "rank": "Member"
            }
            response = self.make_request('PUT', f'/admin/members/{created_member_id}', update_data, use_auth=True)
            
            if response and response.status_code == 200:
                self.log_result("Members Update", True, "Member updated successfully")
            else:
                self.log_result("Members Update", False, f"Failed: {response.status_code if response else 'No response'}")

            # Test DELETE member
            response = self.make_request('DELETE', f'/admin/members/{created_member_id}', use_auth=True)
            
            if response and response.status_code == 200:
                self.log_result("Members Delete", True, "Member deleted successfully")
            else:
                self.log_result("Members Delete", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_rides_crud(self):
        """Test Rides CRUD operations"""
        print("\n=== Testing Rides CRUD APIs ===")
        
        if not self.token:
            self.log_result("Rides CRUD", False, "No auth token available")
            return

        # Test GET all rides
        response = self.make_request('GET', '/admin/rides', use_auth=True)
        if response and response.status_code == 200:
            try:
                rides = response.json()
                self.log_result("Rides List", True, f"Retrieved {len(rides)} rides")
            except json.JSONDecodeError:
                self.log_result("Rides List", False, "Invalid JSON response")
        else:
            self.log_result("Rides List", False, f"Failed: {response.status_code if response else 'No response'}")

        # Test CREATE ride
        future_date = (datetime.now() + timedelta(days=30)).isoformat()
        ride_data = {
            "title": "Test Mountain Ride",
            "description": "A thrilling mountain adventure test ride",
            "date": future_date,
            "startPoint": "ILTMC Clubhouse",
            "endPoint": "Mountain Peak Resort",
            "distance": 150,
            "difficulty": "intermediate",
            "maxParticipants": 25,
            "isPublic": True
        }
        
        response = self.make_request('POST', '/admin/rides', ride_data, use_auth=True)
        created_ride_id = None
        
        if response and response.status_code == 201:
            try:
                data = response.json()
                created_ride_id = data.get('id')
                self.log_result("Rides Create", True, f"Ride created with ID: {created_ride_id}")
            except json.JSONDecodeError:
                self.log_result("Rides Create", False, "Invalid JSON response")
        else:
            self.log_result("Rides Create", False, f"Failed: {response.status_code if response else 'No response'}")

        # Test UPDATE ride (if created successfully)
        if created_ride_id:
            update_data = {
                "maxParticipants": 30,
                "difficulty": "advanced"
            }
            response = self.make_request('PUT', f'/admin/rides/{created_ride_id}', update_data, use_auth=True)
            
            if response and response.status_code == 200:
                self.log_result("Rides Update", True, "Ride updated successfully")
            else:
                self.log_result("Rides Update", False, f"Failed: {response.status_code if response else 'No response'}")

            # Test DELETE ride
            response = self.make_request('DELETE', f'/admin/rides/{created_ride_id}', use_auth=True)
            
            if response and response.status_code == 200:
                self.log_result("Rides Delete", True, "Ride deleted successfully")
            else:
                self.log_result("Rides Delete", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_public_forms(self):
        """Test public forms (applications, contact, newsletter)"""
        print("\n=== Testing Public Forms ===")
        
        # Test application submission
        app_data = {
            "name": "Mike Test Applicant",
            "email": "mike.test@email.com",
            "phone": "+91-9876543211",
            "age": 28,
            "bike": "Yamaha MT-15",
            "experience": "5 years",
            "whyJoin": "Love riding and community spirit",
            "chapter": "Agartala"
        }
        
        response = self.make_request('POST', '/applications', app_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'message' in data and data['message'] == 'Application submitted successfully':
                    self.log_result("Applications Form", True, "Application submitted successfully")
                else:
                    self.log_result("Applications Form", False, f"Unexpected response: {data}")
            except json.JSONDecodeError:
                self.log_result("Applications Form", False, "Invalid JSON response")
        else:
            self.log_result("Applications Form", False, f"Failed: {response.status_code if response else 'No response'}")

        # Test contact form
        contact_data = {
            "name": "Sarah Test Contact",
            "email": "sarah.test@email.com",
            "subject": "Test Inquiry",
            "message": "This is a test contact message"
        }
        
        response = self.make_request('POST', '/contact', contact_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'message' in data and data['message'] == 'Message sent successfully':
                    self.log_result("Contact Form", True, "Contact form submitted successfully")
                else:
                    self.log_result("Contact Form", False, f"Unexpected response: {data}")
            except json.JSONDecodeError:
                self.log_result("Contact Form", False, "Invalid JSON response")
        else:
            self.log_result("Contact Form", False, f"Failed: {response.status_code if response else 'No response'}")

        # Test newsletter signup
        newsletter_data = {
            "email": f"newsletter.test.{uuid.uuid4().hex[:8]}@email.com"
        }
        
        response = self.make_request('POST', '/newsletter', newsletter_data)
        if response and response.status_code == 200:
            try:
                data = response.json()
                if 'message' in data and 'subscribed' in data['message'].lower():
                    self.log_result("Newsletter Form", True, "Newsletter subscription successful")
                else:
                    self.log_result("Newsletter Form", False, f"Unexpected response: {data}")
            except json.JSONDecodeError:
                self.log_result("Newsletter Form", False, "Invalid JSON response")
        else:
            self.log_result("Newsletter Form", False, f"Failed: {response.status_code if response else 'No response'}")

    def test_attendance_api(self):
        """Test attendance tracking APIs"""
        print("\n=== Testing Attendance API ===")
        
        if not self.token:
            self.log_result("Attendance API", False, "No auth token available")
            return

        # Get attendance stats
        response = self.make_request('GET', '/admin/attendance/stats', use_auth=True)
        if response and response.status_code == 200:
            try:
                data = response.json()
                self.log_result("Attendance Stats", True, f"Retrieved attendance stats: {len(data)} member records")
            except json.JSONDecodeError:
                self.log_result("Attendance Stats", False, "Invalid JSON response")
        else:
            self.log_result("Attendance Stats", False, f"Failed: {response.status_code if response else 'No response'}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting ILTMC Backend API Test Suite")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Test in order of priority as specified
        self.test_auth_login()
        self.test_public_stats() 
        self.test_public_apis()
        self.test_admin_dashboard()
        self.test_members_crud()
        self.test_rides_crud()
        self.test_public_forms()
        self.test_attendance_api()
        
        # Print final summary
        print("\n" + "=" * 60)
        print("📊 FINAL TEST SUMMARY")
        print("=" * 60)
        
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