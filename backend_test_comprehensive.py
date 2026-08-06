#!/usr/bin/env python3
"""
ILTMC Backend API Comprehensive Test Suite
Tests specific features requested in review:
1. Member Management with password and memberType
2. Member login with captcha
3. Application APIs with document upload
4. RSVP/Registration APIs
5. Rides and Events with images
6. Captcha system
"""

import requests
import json
import base64
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://leones-admin.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@iltmc.com"
ADMIN_PASSWORD = "admin123"

class ILTMCComprehensiveTester:
    def __init__(self):
        self.admin_token = None
        self.member_token = None
        self.test_results = []
        self.created_resources = {
            'members': [],
            'rides': [],
            'events': [],
            'applications': []
        }

    def log_test(self, test_name, passed, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'passed': passed,
            'message': message,
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} | {test_name}")
        print(f"   {message}")
        if details and not passed:
            print(f"   Details: {details}")
        print()

    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request"""
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            
            return response
        except Exception as e:
            print(f"   ⚠️ Request error: {str(e)}")
            return None

    def test_admin_login(self):
        """Test admin login to get auth token"""
        print("\n" + "="*70)
        print("SETUP: Admin Authentication")
        print("="*70)
        
        response = self.make_request('POST', '/auth/login', {
            'email': ADMIN_EMAIL,
            'password': ADMIN_PASSWORD
        })
        
        if response and response.status_code == 200:
            data = response.json()
            self.admin_token = data.get('token')
            self.log_test("Admin Login", True, f"Admin authenticated successfully")
            return True
        else:
            self.log_test("Admin Login", False, f"Failed to authenticate admin", 
                         f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_captcha_system(self):
        """Test captcha generation and verification"""
        print("\n" + "="*70)
        print("TEST SUITE 1: Captcha System")
        print("="*70)
        
        # Test captcha generation
        response = self.make_request('GET', '/captcha/generate')
        
        if response and response.status_code == 200:
            data = response.json()
            if 'captchaId' in data and 'question' in data:
                captcha_id = data['captchaId']
                question = data['question']
                self.log_test("Captcha Generation", True, 
                             f"Captcha generated: {question}", data)
                
                # Try to solve the captcha for testing
                # Parse the question (e.g., "5 + 3 = ?")
                try:
                    parts = question.replace('?', '').strip().split()
                    num1 = int(parts[0])
                    operator = parts[1]
                    num2 = int(parts[2])
                    
                    if operator == '+':
                        answer = num1 + num2
                    elif operator == '-':
                        answer = num1 - num2
                    elif operator == '*':
                        answer = num1 * num2
                    
                    # Test captcha verification
                    verify_response = self.make_request('POST', '/captcha/verify', {
                        'captchaId': captcha_id,
                        'answer': str(answer)
                    })
                    
                    if verify_response and verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        if verify_data.get('valid'):
                            self.log_test("Captcha Verification", True, 
                                         f"Captcha verified successfully with answer: {answer}")
                        else:
                            self.log_test("Captcha Verification", False, 
                                         "Captcha verification returned invalid")
                    else:
                        self.log_test("Captcha Verification", False, 
                                     "Captcha verification endpoint failed")
                except Exception as e:
                    self.log_test("Captcha Verification", False, 
                                 f"Failed to parse/verify captcha: {str(e)}")
            else:
                self.log_test("Captcha Generation", False, 
                             "Missing captchaId or question in response", data)
        else:
            self.log_test("Captcha Generation", False, 
                         f"Captcha generation failed", 
                         f"Status: {response.status_code if response else 'No response'}")

    def test_member_management_with_password(self):
        """Test member creation with password and memberType"""
        print("\n" + "="*70)
        print("TEST SUITE 2: Member Management with Password & MemberType")
        print("="*70)
        
        if not self.admin_token:
            self.log_test("Member Management", False, "No admin token available")
            return
        
        # Test 1: Create prospect member with password
        prospect_data = {
            "name": "Alex Prospect Rider",
            "email": f"alex.prospect.{datetime.now().timestamp()}@iltmc.com",
            "password": "SecurePass123",
            "phone": "+91-9876543210",
            "bike": "Royal Enfield Himalayan",
            "chapter": "Agartala",
            "rank": "Rubble",
            "position": "Member",
            "memberType": "prospect",
            "status": "active"
        }
        
        response = self.make_request('POST', '/admin/members', prospect_data, self.admin_token)
        
        if response and response.status_code == 201:
            data = response.json()
            member_id = data.get('id')
            self.created_resources['members'].append(member_id)
            
            if data.get('memberType') == 'prospect':
                self.log_test("Create Prospect Member", True, 
                             f"Prospect member created with ID: {member_id}", data)
            else:
                self.log_test("Create Prospect Member", False, 
                             f"MemberType not set correctly: {data.get('memberType')}")
        else:
            self.log_test("Create Prospect Member", False, 
                         "Failed to create prospect member",
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 2: Create full member with password
        member_data = {
            "name": "Sarah Full Member",
            "email": f"sarah.member.{datetime.now().timestamp()}@iltmc.com",
            "password": "MemberPass456",
            "phone": "+91-9876543211",
            "bike": "KTM Duke 390",
            "chapter": "Agartala",
            "rank": "Iron",
            "position": "Member",
            "memberType": "member",
            "status": "active"
        }
        
        response = self.make_request('POST', '/admin/members', member_data, self.admin_token)
        
        if response and response.status_code == 201:
            data = response.json()
            member_id = data.get('id')
            self.created_resources['members'].append(member_id)
            
            if data.get('memberType') == 'member':
                self.log_test("Create Full Member", True, 
                             f"Full member created with ID: {member_id}", data)
                
                # Store credentials for login test
                self.test_member_email = member_data['email']
                self.test_member_password = member_data['password']
            else:
                self.log_test("Create Full Member", False, 
                             f"MemberType not set correctly: {data.get('memberType')}")
        else:
            self.log_test("Create Full Member", False, 
                         "Failed to create full member",
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Update member memberType
        if self.created_resources['members']:
            first_member_id = self.created_resources['members'][0]
            update_data = {
                "memberType": "member",
                "rank": "Iron"
            }
            
            response = self.make_request('PUT', f'/admin/members/{first_member_id}', 
                                        update_data, self.admin_token)
            
            if response and response.status_code == 200:
                self.log_test("Update Member Type", True, 
                             f"Member type updated from prospect to member")
            else:
                self.log_test("Update Member Type", False, 
                             "Failed to update member type",
                             f"Status: {response.status_code if response else 'No response'}")

    def test_member_login_with_captcha(self):
        """Test member login with captcha verification"""
        print("\n" + "="*70)
        print("TEST SUITE 3: Member Login with Captcha")
        print("="*70)
        
        if not hasattr(self, 'test_member_email'):
            self.log_test("Member Login with Captcha", False, 
                         "No test member created in previous test")
            return
        
        # Step 1: Generate captcha
        captcha_response = self.make_request('GET', '/captcha/generate')
        
        if not captcha_response or captcha_response.status_code != 200:
            self.log_test("Member Login - Captcha Generation", False, 
                         "Failed to generate captcha for login")
            return
        
        captcha_data = captcha_response.json()
        captcha_id = captcha_data['captchaId']
        question = captcha_data['question']
        
        # Solve captcha
        try:
            parts = question.replace('?', '').strip().split()
            num1 = int(parts[0])
            operator = parts[1]
            num2 = int(parts[2])
            
            if operator == '+':
                answer = num1 + num2
            elif operator == '-':
                answer = num1 - num2
            elif operator == '*':
                answer = num1 * num2
            
            # Step 2: Login with captcha
            login_data = {
                "email": self.test_member_email,
                "password": self.test_member_password,
                "captchaId": captcha_id,
                "captchaAnswer": str(answer)
            }
            
            response = self.make_request('POST', '/member/login', login_data)
            
            if response and response.status_code == 200:
                data = response.json()
                if 'token' in data and 'user' in data:
                    self.member_token = data['token']
                    self.log_test("Member Login with Captcha", True, 
                                 f"Member logged in successfully: {data['user']['email']}", data)
                else:
                    self.log_test("Member Login with Captcha", False, 
                                 "Login response missing token or user", data)
            else:
                self.log_test("Member Login with Captcha", False, 
                             "Member login failed",
                             f"Status: {response.status_code if response else 'No response'}")
            
            # Test 3: Login with wrong captcha
            wrong_captcha_response = self.make_request('GET', '/captcha/generate')
            if wrong_captcha_response and wrong_captcha_response.status_code == 200:
                wrong_captcha_data = wrong_captcha_response.json()
                wrong_login_data = {
                    "email": self.test_member_email,
                    "password": self.test_member_password,
                    "captchaId": wrong_captcha_data['captchaId'],
                    "captchaAnswer": "999"  # Wrong answer
                }
                
                response = self.make_request('POST', '/member/login', wrong_login_data)
                
                if response and response.status_code == 400:
                    self.log_test("Member Login - Invalid Captcha", True, 
                                 "Invalid captcha properly rejected")
                else:
                    self.log_test("Member Login - Invalid Captcha", False, 
                                 "Invalid captcha not properly handled",
                                 f"Status: {response.status_code if response else 'No response'}")
                    
        except Exception as e:
            self.log_test("Member Login with Captcha", False, 
                         f"Error during login test: {str(e)}")

    def test_application_with_documents(self):
        """Test application submission with document uploads"""
        print("\n" + "="*70)
        print("TEST SUITE 4: Application with Document Upload")
        print("="*70)
        
        # Create fake base64 documents (small test data)
        fake_aadhaar = base64.b64encode(b"FAKE_AADHAAR_CARD_IMAGE_DATA").decode('utf-8')
        fake_license = base64.b64encode(b"FAKE_DRIVING_LICENSE_IMAGE_DATA").decode('utf-8')
        
        # Test 1: Submit application with documents
        app_data = {
            "name": "Rahul Test Applicant",
            "email": f"rahul.test.{datetime.now().timestamp()}@email.com",
            "phone": "+91-9876543212",
            "bike": "Bajaj Dominar 400",
            "experience": "3 years of riding experience",
            "reason": "Want to join the brotherhood and explore new roads",
            "aadhaarCard": fake_aadhaar,
            "aadhaarFileName": "aadhaar_rahul.jpg",
            "drivingLicense": fake_license,
            "drivingLicenseFileName": "license_rahul.jpg"
        }
        
        response = self.make_request('POST', '/applications', app_data)
        
        if response and response.status_code == 200:
            data = response.json()
            app_id = data.get('id')
            if app_id:
                self.created_resources['applications'].append(app_id)
                self.log_test("Application with Documents", True, 
                             f"Application submitted with documents, ID: {app_id}", data)
                
                # Test 2: Verify admin can view application with documents
                if self.admin_token:
                    admin_response = self.make_request('GET', '/admin/applications', 
                                                      token=self.admin_token)
                    
                    if admin_response and admin_response.status_code == 200:
                        applications = admin_response.json()
                        submitted_app = next((app for app in applications if app['id'] == app_id), None)
                        
                        if submitted_app:
                            has_aadhaar = 'aadhaarCard' in submitted_app and submitted_app['aadhaarCard']
                            has_license = 'drivingLicense' in submitted_app and submitted_app['drivingLicense']
                            
                            if has_aadhaar and has_license:
                                self.log_test("Admin View Application Documents", True, 
                                             "Documents are stored and visible in admin view", 
                                             f"Aadhaar: {len(submitted_app['aadhaarCard'])} chars, License: {len(submitted_app['drivingLicense'])} chars")
                            else:
                                self.log_test("Admin View Application Documents", False, 
                                             "Documents not found in admin view",
                                             f"Has Aadhaar: {has_aadhaar}, Has License: {has_license}")
                        else:
                            self.log_test("Admin View Application Documents", False, 
                                         "Application not found in admin list")
                    else:
                        self.log_test("Admin View Application Documents", False, 
                                     "Failed to fetch applications as admin")
            else:
                self.log_test("Application with Documents", False, 
                             "Application submitted but no ID returned", data)
        else:
            self.log_test("Application with Documents", False, 
                         "Failed to submit application",
                         f"Status: {response.status_code if response else 'No response'}")
        
        # Test 3: Application without documents (should fail)
        incomplete_app = {
            "name": "Incomplete Applicant",
            "email": "incomplete@email.com",
            "phone": "+91-9876543213",
            "bike": "Honda CB350",
            "experience": "2 years",
            "reason": "Testing without documents"
        }
        
        response = self.make_request('POST', '/applications', incomplete_app)
        
        if response and response.status_code == 400:
            self.log_test("Application without Documents", True, 
                         "Application without documents properly rejected")
        else:
            self.log_test("Application without Documents", False, 
                         "Application without documents should be rejected",
                         f"Status: {response.status_code if response else 'No response'}")

    def test_rsvp_apis(self):
        """Test RSVP/Registration APIs for rides and events"""
        print("\n" + "="*70)
        print("TEST SUITE 5: RSVP/Registration APIs")
        print("="*70)
        
        # First, create a test ride
        if not self.admin_token:
            self.log_test("RSVP APIs", False, "No admin token available")
            return
        
        future_date = (datetime.now() + timedelta(days=15)).isoformat()
        ride_data = {
            "title": "Test RSVP Ride to Dambuk",
            "description": "Testing RSVP functionality",
            "date": future_date,
            "startPoint": "ILTMC Clubhouse",
            "endPoint": "Dambuk Valley",
            "distance": 200,
            "difficulty": "intermediate",
            "imageUrl": "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
            "isPublic": True
        }
        
        ride_response = self.make_request('POST', '/admin/rides', ride_data, self.admin_token)
        
        if ride_response and ride_response.status_code == 201:
            ride = ride_response.json()
            ride_id = ride['id']
            self.created_resources['rides'].append(ride_id)
            
            # Test 1: RSVP for ride
            rsvp_data = {
                "rideId": ride_id,
                "rideName": ride_data['title'],
                "name": "Vikram RSVP Tester",
                "email": f"vikram.rsvp.{datetime.now().timestamp()}@email.com",
                "phone": "+91-9876543214",
                "message": "Excited to join this ride!"
            }
            
            rsvp_response = self.make_request('POST', '/rsvp/ride', rsvp_data)
            
            if rsvp_response and rsvp_response.status_code == 200:
                rsvp_result = rsvp_response.json()
                self.log_test("RSVP for Ride", True, 
                             "Ride RSVP submitted successfully (email notification sent async)", 
                             rsvp_result)
            else:
                self.log_test("RSVP for Ride", False, 
                             "Failed to submit ride RSVP",
                             f"Status: {rsvp_response.status_code if rsvp_response else 'No response'}")
        else:
            self.log_test("RSVP for Ride", False, 
                         "Failed to create test ride for RSVP")
        
        # Create a test event
        event_data = {
            "title": "Test RSVP Event - Annual Meetup",
            "description": "Testing event registration functionality",
            "date": future_date,
            "venue": "ILTMC Clubhouse, Agartala",
            "type": "meetup",
            "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            "externalLink": "https://iltmc.com/events/annual-meetup",
            "isPublic": True
        }
        
        event_response = self.make_request('POST', '/admin/events', event_data, self.admin_token)
        
        if event_response and event_response.status_code == 201:
            event = event_response.json()
            event_id = event['id']
            self.created_resources['events'].append(event_id)
            
            # Test 2: Register for event
            registration_data = {
                "eventId": event_id,
                "eventName": event_data['title'],
                "name": "Priya Event Attendee",
                "email": f"priya.event.{datetime.now().timestamp()}@email.com",
                "phone": "+91-9876543215",
                "participants": 2,
                "message": "Looking forward to the event!"
            }
            
            reg_response = self.make_request('POST', '/rsvp/event', registration_data)
            
            if reg_response and reg_response.status_code == 200:
                reg_result = reg_response.json()
                self.log_test("Register for Event", True, 
                             "Event registration submitted successfully (email notification sent async)", 
                             reg_result)
            else:
                self.log_test("Register for Event", False, 
                             "Failed to submit event registration",
                             f"Status: {reg_response.status_code if reg_response else 'No response'}")
        else:
            self.log_test("Register for Event", False, 
                         "Failed to create test event for registration")

    def test_rides_events_with_images(self):
        """Test rides and events creation/update with images"""
        print("\n" + "="*70)
        print("TEST SUITE 6: Rides and Events with Images")
        print("="*70)
        
        if not self.admin_token:
            self.log_test("Rides/Events with Images", False, "No admin token available")
            return
        
        # Test 1: Create ride with imageUrl
        future_date = (datetime.now() + timedelta(days=20)).isoformat()
        ride_with_image = {
            "title": "Scenic Mountain Ride with Photo",
            "description": "Beautiful mountain route",
            "date": future_date,
            "startPoint": "Agartala",
            "endPoint": "Jampui Hills",
            "distance": 180,
            "difficulty": "advanced",
            "imageUrl": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800",
            "isPublic": True
        }
        
        response = self.make_request('POST', '/admin/rides', ride_with_image, self.admin_token)
        
        if response and response.status_code == 201:
            ride = response.json()
            ride_id = ride['id']
            self.created_resources['rides'].append(ride_id)
            
            if ride.get('imageUrl') == ride_with_image['imageUrl']:
                self.log_test("Create Ride with Image", True, 
                             f"Ride created with imageUrl: {ride['imageUrl']}", ride)
                
                # Test 2: Update ride imageUrl
                update_data = {
                    "imageUrl": "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800",
                    "description": "Updated description with new image"
                }
                
                update_response = self.make_request('PUT', f'/admin/rides/{ride_id}', 
                                                   update_data, self.admin_token)
                
                if update_response and update_response.status_code == 200:
                    self.log_test("Update Ride Image", True, 
                                 "Ride imageUrl updated successfully")
                else:
                    self.log_test("Update Ride Image", False, 
                                 "Failed to update ride imageUrl")
            else:
                self.log_test("Create Ride with Image", False, 
                             f"ImageUrl not saved correctly: {ride.get('imageUrl')}")
        else:
            self.log_test("Create Ride with Image", False, 
                         "Failed to create ride with image")
        
        # Test 3: Create event with imageUrl and externalLink
        event_with_image = {
            "title": "Annual Club Anniversary with Photo",
            "description": "Celebrating 13 years of ILTMC",
            "date": future_date,
            "venue": "ILTMC Headquarters",
            "type": "celebration",
            "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            "externalLink": "https://iltmc.com/anniversary-2024",
            "isPublic": True
        }
        
        response = self.make_request('POST', '/admin/events', event_with_image, self.admin_token)
        
        if response and response.status_code == 201:
            event = response.json()
            event_id = event['id']
            self.created_resources['events'].append(event_id)
            
            has_image = event.get('imageUrl') == event_with_image['imageUrl']
            has_link = event.get('externalLink') == event_with_image['externalLink']
            
            if has_image and has_link:
                self.log_test("Create Event with Image & Link", True, 
                             f"Event created with imageUrl and externalLink", event)
                
                # Test 4: Update event
                update_data = {
                    "imageUrl": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800",
                    "externalLink": "https://iltmc.com/anniversary-2024-updated"
                }
                
                update_response = self.make_request('PUT', f'/admin/events/{event_id}', 
                                                   update_data, self.admin_token)
                
                if update_response and update_response.status_code == 200:
                    self.log_test("Update Event Image & Link", True, 
                                 "Event imageUrl and externalLink updated successfully")
                else:
                    self.log_test("Update Event Image & Link", False, 
                                 "Failed to update event")
            else:
                self.log_test("Create Event with Image & Link", False, 
                             f"Image or link not saved correctly. Has image: {has_image}, Has link: {has_link}")
        else:
            self.log_test("Create Event with Image & Link", False, 
                         "Failed to create event with image and link")

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n" + "="*70)
        print("CLEANUP: Removing Test Resources")
        print("="*70)
        
        if not self.admin_token:
            print("⚠️ No admin token, skipping cleanup")
            return
        
        # Delete test members
        for member_id in self.created_resources['members']:
            response = self.make_request('DELETE', f'/admin/members/{member_id}', 
                                        token=self.admin_token)
            if response and response.status_code == 200:
                print(f"✅ Deleted test member: {member_id}")
            else:
                print(f"⚠️ Failed to delete member: {member_id}")
        
        # Delete test rides
        for ride_id in self.created_resources['rides']:
            response = self.make_request('DELETE', f'/admin/rides/{ride_id}', 
                                        token=self.admin_token)
            if response and response.status_code == 200:
                print(f"✅ Deleted test ride: {ride_id}")
            else:
                print(f"⚠️ Failed to delete ride: {ride_id}")
        
        # Delete test events
        for event_id in self.created_resources['events']:
            response = self.make_request('DELETE', f'/admin/events/{event_id}', 
                                        token=self.admin_token)
            if response and response.status_code == 200:
                print(f"✅ Deleted test event: {event_id}")
            else:
                print(f"⚠️ Failed to delete event: {event_id}")
        
        print()

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        
        total = len(self.test_results)
        passed = sum(1 for r in self.test_results if r['passed'])
        failed = total - passed
        
        print(f"\nTotal Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%\n")
        
        if failed > 0:
            print("FAILED TESTS:")
            print("-" * 70)
            for result in self.test_results:
                if not result['passed']:
                    print(f"❌ {result['test']}")
                    print(f"   {result['message']}")
                    if result['details']:
                        print(f"   {result['details']}")
            print()
        
        return passed == total

    def run_all_tests(self):
        """Run all comprehensive tests"""
        print("\n" + "🚀" * 35)
        print("ILTMC COMPREHENSIVE BACKEND API TEST SUITE")
        print(f"Testing: {BASE_URL}")
        print("🚀" * 35)
        
        # Setup
        if not self.test_admin_login():
            print("\n❌ Cannot proceed without admin authentication")
            return False
        
        # Run all test suites
        self.test_captcha_system()
        self.test_member_management_with_password()
        self.test_member_login_with_captcha()
        self.test_application_with_documents()
        self.test_rsvp_apis()
        self.test_rides_events_with_images()
        
        # Cleanup
        self.cleanup_resources()
        
        # Summary
        return self.print_summary()


if __name__ == "__main__":
    tester = ILTMCComprehensiveTester()
    success = tester.run_all_tests()
    
    if success:
        print("🎉 All comprehensive tests passed!")
        exit(0)
    else:
        print("⚠️ Some tests failed. Review the results above.")
        exit(1)
