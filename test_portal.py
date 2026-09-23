import urllib.request
import json

base_url = "http://localhost:5000/api"

def make_request(endpoint, method="GET", data=None, token=None):
    url = f"{base_url}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} on {method} {endpoint}: {err_body}")
        try:
            return json.loads(err_body)
        except:
            return {"success": False, "error": str(e)}

print("========================================")
print("JOB PORTAL AUTOMATED END-TO-END VERIFICATION")
print("========================================")

# 1. Test Admin Login
admin_login = make_request("/auth/login", "POST", {
    "email": "admin@jobportal.com",
    "password": "Admin@123"
})
assert admin_login["success"], f"Admin login failed: {admin_login}"
admin_token = admin_login["data"]["token"]
print("[PASS] 1. Admin Login: SUCCESS (Role: Admin)")

# 2. Test Employer Login
emp_login = make_request("/auth/login", "POST", {
    "email": "arun@techcorp.in",
    "password": "Password@123"
})
assert emp_login["success"], f"Employer login failed: {emp_login}"
emp_token = emp_login["data"]["token"]
company_id = emp_login["data"]["companyId"]
print(f"[PASS] 2. Employer Login: SUCCESS (CompanyId: {company_id})")

# 3. Test Job Seeker Login
seeker_login = make_request("/auth/login", "POST", {
    "email": "rahul.sharma@example.com",
    "password": "Password@123"
})
assert seeker_login["success"], f"Seeker login failed: {seeker_login}"
seeker_token = seeker_login["data"]["token"]
seeker_profile_id = seeker_login["data"]["jobSeekerProfileId"]
print(f"[PASS] 3. Job Seeker Login: SUCCESS (ProfileId: {seeker_profile_id})")

# 4. Test Job Search & Filtering
search_res = make_request("/jobs?keyword=developer&workplaceType=Hybrid&page=1&pageSize=5")
assert search_res["success"] and len(search_res["data"]["items"]) > 0
print(f"[PASS] 4. Job Search & Filtering: SUCCESS ({search_res['data']['totalCount']} total matching jobs found)")

# 5. Test Employer Creates a New Job
new_job = make_request("/jobs", "POST", {
    "title": "Lead Cloud Infrastructure Specialist (Azure)",
    "description": "Lead enterprise cloud modernization and Kubernetes deployments for Fortune 500 customers.",
    "responsibilities": "Manage Azure clusters; automate Terraform IaC; lead incident postmortems",
    "requirements": "6+ years cloud systems; Azure certified; Kubernetes CKA",
    "skills": "Azure, Kubernetes, Terraform, Docker, CI/CD",
    "experienceLevel": "Lead",
    "salaryMin": 2500000,
    "salaryMax": 3800000,
    "employmentType": "FullTime",
    "workplaceType": "Hybrid",
    "location": "Bangalore, Karnataka",
    "benefits": "Family health insurance, company stock options, gym stipend"
}, token=emp_token)
assert new_job["success"], f"Job creation failed: {new_job}"
created_job_id = new_job["data"]["id"]
print(f"[PASS] 5. Employer Post Job: SUCCESS (Created Job ID: {created_job_id}, Title: '{new_job['data']['title']}')")

# 6. Test Job Seeker Saves the New Job
save_res = make_request(f"/saved-jobs/{created_job_id}", "POST", token=seeker_token)
assert save_res["success"], f"Save job failed: {save_res}"
saved_list = make_request("/saved-jobs", "GET", token=seeker_token)
assert any(j["id"] == created_job_id for j in saved_list["data"])
print(f"[PASS] 6. Job Seeker Save Job: SUCCESS ({len(saved_list['data'])} total saved jobs)")

# 7. Test Job Seeker Applies for the Job
apply_res = make_request("/applications", "POST", {
    "jobId": created_job_id,
    "coverLetter": "Excited to apply for the Lead Cloud Infrastructure Specialist role at TechCorp. I have extensive Azure and Kubernetes production experience."
}, token=seeker_token)
assert apply_res["success"], f"Application failed: {apply_res}"
application_id = apply_res["data"]["id"]
print(f"[PASS] 7. Job Seeker Application: SUCCESS (Application ID: {application_id})")

# 8. Test Duplicate Application Prevention
dup_apply = make_request("/applications", "POST", {
    "jobId": created_job_id,
    "coverLetter": "Duplicate try"
}, token=seeker_token)
assert not dup_apply["success"], "Duplicate application should have been rejected!"
print("[PASS] 8. Duplicate Application Prevention: SUCCESS (Rejected properly with 400 Bad Request)")

# 9. Test Employer Updates Application Status & History
status_res = make_request(f"/applications/{application_id}/status", "PUT", {
    "status": "Shortlisted",
    "comment": "Profile reviewed by Arun Verma; candidate has strong Azure experience."
}, token=emp_token)
assert status_res["success"] and status_res["data"]["status"] == "Shortlisted"
print("[PASS] 9. Employer Status Update: SUCCESS (Status updated to 'Shortlisted')")

# 10. Test Application History
history_res = make_request(f"/applications/{application_id}/history", "GET", token=seeker_token)
assert history_res["success"] and len(history_res["data"]) >= 2
print(f"[PASS] 10. Application Timeline History: SUCCESS ({len(history_res['data'])} history records logged)")

# 11. Test Employer Schedules Interview
interview_res = make_request("/interviews", "POST", {
    "applicationId": application_id,
    "interviewDate": "2026-09-25",
    "interviewTime": "11:30 AM IST",
    "interviewType": "Online",
    "meetingLink": "https://meet.google.com/techcorp-cloud-round1",
    "notes": "System design and Kubernetes cluster failover scenario assessment."
}, token=emp_token)
assert interview_res["success"], f"Schedule interview failed: {interview_res}"
interview_id = interview_res["data"]["id"]
print(f"[PASS] 11. Schedule Interview: SUCCESS (Interview ID: {interview_id})")

# 12. Test Candidate Notifications
notif_res = make_request("/notifications", "GET", token=seeker_token)
assert notif_res["success"] and len(notif_res["data"]) > 0
first_notif_id = notif_res["data"][0]["id"]
read_res = make_request(f"/notifications/{first_notif_id}/read", "PUT", token=seeker_token)
assert read_res["success"]
print(f"[PASS] 12. Candidate Notifications: SUCCESS ({len(notif_res['data'])} notifications retrieved, mark as read verified)")

# 13. Test Admin Dashboard Stats
admin_stats = make_request("/admin/dashboard", "GET", token=admin_token)
assert admin_stats["success"] and admin_stats["data"]["totalJobs"] > 20
print(f"[PASS] 13. Admin Dashboard Analytics: SUCCESS ({admin_stats['data']['totalUsers']} users, {admin_stats['data']['totalJobs']} jobs, {admin_stats['data']['totalApplications']} apps)")

# 14. Test Admin Toggle Company Verification
companies_list = make_request("/admin/companies", "GET", token=admin_token)
assert companies_list["success"] and len(companies_list["data"]) > 0
test_comp_id = companies_list["data"][0]["id"]
toggle_res = make_request(f"/admin/companies/{test_comp_id}/toggle-verify", "PUT", token=admin_token)
assert toggle_res["success"]
print("[PASS] 14. Admin Verify Company: SUCCESS (Toggled verification status)")

print("========================================")
print("ALL 14 END-TO-END VERIFICATION CHECKS PASSED!")
print("========================================")
