import requests

BASE_URL = "http://localhost:5000/api"

print("========================================")
print("AI / ML / LLM ENDPOINTS VERIFICATION")
print("========================================")

# 1. Job Seeker Login
seeker_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "rahul.sharma@example.com",
    "password": "Password@123"
})
assert seeker_login.status_code == 200, f"Seeker login failed: {seeker_login.text}"
seeker_token = seeker_login.json()["data"]["token"]
seeker_headers = {"Authorization": f"Bearer {seeker_token}", "Content-Type": "application/json"}
print("[PASS] 1. Job Seeker Login successful")

# 2. AI Match Analysis
match_res = requests.post(f"{BASE_URL}/ai/match-analysis", headers=seeker_headers, json={"jobId": 1})
assert match_res.status_code == 200, f"Match analysis failed: {match_res.text}"
match_data = match_res.json()["data"]
print(f"[PASS] 2. AI Match Analysis: Score = {match_data['matchPercentage']}%, Level = '{match_data['matchLevel']}'")
print(f"       Matched Skills: {match_data['matchingSkills']}")
print(f"       Missing Skills: {match_data['missingSkills']}")
assert match_data['matchPercentage'] > 0
assert len(match_data['strengths']) > 0

# 3. AI Cover Letter Generation
letter_res = requests.post(f"{BASE_URL}/ai/generate-cover-letter", headers=seeker_headers, json={
    "jobId": 1,
    "tone": "Confident",
    "customHighlights": "Led migration of legacy systems to microservices."
})
assert letter_res.status_code == 200, f"Cover letter failed: {letter_res.text}"
letter_data = letter_res.json()["data"]
print(f"[PASS] 3. AI Cover Letter Generated: Length = {len(letter_data['coverLetter'])} chars")
assert "TechCorp" in letter_data['coverLetter'] or "Hiring Team" in letter_data['coverLetter']

# 4. AI Profile Optimization
opt_res = requests.post(f"{BASE_URL}/ai/optimize-profile", headers=seeker_headers, json={
    "bio": "I write backend services in C# and React. 5 years experience.",
    "currentSkills": "C#, React, SQL Server",
    "targetJobTitle": "Senior Full-Stack Engineer"
})
assert opt_res.status_code == 200, f"Profile optimize failed: {opt_res.text}"
opt_data = opt_res.json()["data"]
print(f"[PASS] 4. AI Profile Optimization: Headline = '{opt_data['suggestedHeadline']}'")
print(f"       Extracted Skills: {opt_data['extractedSkills']}")

# 5. Employer Login
employer_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "arun@techcorp.in",
    "password": "Password@123"
})
assert employer_login.status_code == 200, f"Employer login failed: {employer_login.text}"
employer_token = employer_login.json()["data"]["token"]
employer_headers = {"Authorization": f"Bearer {employer_token}", "Content-Type": "application/json"}
print("[PASS] 5. Employer Login successful")

# 6. AI Job Description Generator
job_gen_res = requests.post(f"{BASE_URL}/ai/generate-job-description", headers=employer_headers, json={
    "jobTitle": "Lead Cloud Infrastructure Specialist (Azure)",
    "experienceLevel": "Lead",
    "workplaceType": "Remote"
})
assert job_gen_res.status_code == 200, f"Job generation failed: {job_gen_res.text}"
job_gen_data = job_gen_res.json()["data"]
print(f"[PASS] 6. AI Job Description Generated: Suggested Skills = '{job_gen_data['suggestedSkills']}'")
assert len(job_gen_data['description']) > 50
assert "•" in job_gen_data['responsibilities']

# 7. Candidate AI Match Review (Employer)
cand_match_res = requests.get(f"{BASE_URL}/ai/candidate-match/1", headers=employer_headers)
assert cand_match_res.status_code == 200, f"Candidate match failed: {cand_match_res.text}"
cand_match_data = cand_match_res.json()["data"]
print(f"[PASS] 7. Employer Candidate Match Review: Fit = {cand_match_data['matchPercentage']}%, Level = '{cand_match_data['matchLevel']}'")

# 8. AI Chatbot - Job Search Intent (Anonymous guest)
chat_res_1 = requests.post(f"{BASE_URL}/ai/chat", json={
    "message": "Find .NET developer jobs in Bangalore"
})
assert chat_res_1.status_code == 200, f"Chatbot job search failed: {chat_res_1.text}"
chat_data_1 = chat_res_1.json()["data"]
print(f"[PASS] 8. AI Chatbot Job Search: Reply preview = '{chat_data_1['reply'][:60]}...'")
print(f"       Found {len(chat_data_1['recommendedJobs'])} recommended job cards")
assert len(chat_data_1['recommendedJobs']) > 0 or "/jobs/" in chat_data_1['reply']
assert len(chat_data_1['suggestedPrompts']) > 0

# 9. AI Chatbot - Interview Prep Intent (Authenticated seeker)
chat_res_2 = requests.post(f"{BASE_URL}/ai/chat", headers=seeker_headers, json={
    "message": "What are the top React interview questions?",
    "conversationHistory": [
        {"role": "user", "content": "Find .NET jobs"},
        {"role": "assistant", "content": "Here are some jobs"}
    ]
})
assert chat_res_2.status_code == 200, f"Chatbot interview prep failed: {chat_res_2.text}"
chat_data_2 = chat_res_2.json()["data"]
print(f"[PASS] 9. AI Chatbot Interview Prep: Reply preview = '{chat_data_2['reply'][:60]}...'")
assert "interview" in chat_data_2['reply'].lower() or "react" in chat_data_2['reply'].lower() or "hooks" in chat_data_2['reply'].lower()

print("========================================")
print("ALL 9 AI VERIFICATION TESTS PASSED SUCCESSFULLY!")
print("========================================")

