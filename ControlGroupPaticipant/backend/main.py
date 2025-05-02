from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import random
from bson import ObjectId
from typing import List


app = FastAPI()

# config CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow React frontend  #sensitive data
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["job_db"]
jobs_collection = db["jobs"]


# valid companies and locations
valid_companies = ["GovTech", "DBS", "Shopee", "ST Engineering", "Sea Group", "Temasek"]
valid_locations = ["Central", "East", "West", "North", "Marina Bay"]

#batch generate mock jobs
def batch_generate_mock_jobs(n):
    job_titles = ["Software Engineer", "Data Scientist", "DevOps Engineer", "Product Manager"]
    salary_ranges = {"Software Engineer": (7000, 15000), "Data Scientist": (8000, 16000),
                     "DevOps Engineer": (7500, 14000), "Product Manager": (9000, 18000)}
    jobs = []
    for _ in range(n):
        title = random.choice(job_titles)
        company = random.choice(valid_companies)
        location = random.choice(valid_locations)
        salary_min, salary_max = salary_ranges[title]
        salary = random.randint(salary_min, salary_max)
        job = {"title": title, "company": company, "location": location, "salary": salary} #sensitive data
        jobs.append(job)
    return jobs

# endpoint tp retrieve all job data
@app.get("/")
def index():
    return {"message": "Welcome To FastAPI World"}

# endpoint to retrieve all job data
@app.get("/jobs")
def get_jobs(min_salary: int = Query(0), companies: List[str] = Query([]), locations: List[str] = Query([])):
    
    query = {"salary": {'$gte': min_salary}}
    if locations:
        query["location"] = {'$in':locations}
    if companies:
        query["company"] = {'$in':companies}
    results = list(jobs_collection.find(query, {"_id": 0}))  # consitent data
    return {"count": len(results), "jobs": results}

# endpoint to retrieve all job stats data
@app.get("/jobs/stats")
def get_stats():
    # stats avg salary
    avg_salary_pipeline = [
        {"$group": {"_id": "$title", "avg_salary": {"$avg": "$salary"}}}
    ]
    avg_salary_result = list(jobs_collection.aggregate(avg_salary_pipeline)) # can be divide by 0 
    
    # stats avg jobs count
    skill_counts_pipeline = [
        {"$group": {"_id": "$title", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    skill_counts = list(jobs_collection.aggregate(skill_counts_pipeline))
    
    #stats jobs by location
    geo_counts_pipeline = [
        {"$group": {"_id": {"location": "$location", "title": "$title"}, "count": {"$sum": 1}}},
        {"$group": {"_id": "$_id.location", "data": {"$push": {"title": "$_id.title", "count": "$count"}}}}
    ]
    
    geo_counts = list(jobs_collection.aggregate(geo_counts_pipeline))
    
    return {"average_salary": avg_salary_result, "top_skills": skill_counts, "distribution": geo_counts}

# endpoint to simulate LLM jobs scrape
@app.post("/jobs/scrape")
def scrape_jobs(query: str):
    try: 
    # generate 20 jobs
      jobs = batch_generate_mock_jobs(20)
      jobs_collection.insert_many(jobs)
    
      return {"message": "Mock jobs scraped", "jobs": jobs}
    except Exception as e:
      raise HTTPException(status_code=500, detail=f"MongoDB Error: {str(e)}")

# endpoint to update job flag data data
@app.put("/jobs/flag/{id}")
def flag_job(id: str, correction: dict):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid job ID")
    result = jobs_collection.update_one({"_id": ObjectId(id)}, {"$set": correction})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job corrected", "updated_fields": correction}


# create jobs collection
@app.get("/db/jobs")
def create_jobs_collection():
    try:
        if "jobs" not in db.list_collection_names():
          db.create_collection("jobs")

          collections = db.list_collection_names()

        # documents count in collection `jobs`
          job_count = jobs_collection.count_documents({})
          print("Collection 'jobs' created.")
        else:
          print("Collection 'jobs' is existed.")


        return {
            "status": "Connected to MongoDB",
            "collections": collections,
            "job_count": job_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB Error: {str(e)}")
    
