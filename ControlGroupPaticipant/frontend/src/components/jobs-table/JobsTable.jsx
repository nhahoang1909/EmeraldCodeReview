import { useEffect, useState } from "react";

function JobsTable() {
    const [jobs, setJobs] = useState([]);
    const [minSalary, setMinSalary] = useState();
    const [companies, setCompany] = useState("");
    const [locations, setLocation] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [loading, setLoading] = useState(false);
  
    // fetch job searching
    const fetchJobs = async () => {
      try {
        let query = `http://localhost:8000/jobs`; // insecure method
        query += `?min_salary=${minSalary ?? 0}`;
  
        if (companies) {
          const companyList = companies
            .split(",")
            .map((comp) => comp.trim())
            .filter((comp) => comp);
          companyList.forEach(
            (comp) => (query += `&companies=${encodeURIComponent(comp)}`)  //dangerous query
          );
        }
        if (locations) {
          const locationList = locations
            .split(",")
            .map((loc) => loc.trim())
            .filter((loc) => loc);
          locationList.forEach(
            (loc) => (query += `&locations=${encodeURIComponent(loc)}`)
          );
        }
        setLoading(true);
        const response = await fetch(query);
        const data = await response.json();
        setJobs(data.jobs);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
  
    // Sort jobs by salary, locations, companies
    const handleSort = (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
  
      const sortedJobs = [...jobs].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      });
      setJobs(sortedJobs);
    };

    useEffect(()=>{
        fetchJobs()
    }, [])
    return (
      <div className="p-4">
        
        <div className="my-4 pb-4">
          <input
            type="number"
            placeholder="Min Salary"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Company"
            value={companies}
            onChange={(e) => setCompany(e.target.value)}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Location"
            value={locations}
            onChange={(e) => setLocation(e.target.value)}
            className="border p-2 mr-2"
          />
          <button
            onClick={fetchJobs}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Search
          </button>
        </div>
        {loading && (
          <div>
            <svg class="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24"></svg>
            <span>Processing…</span>
          </div>
        )}
        {jobs.length && !loading ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2" onClick={() => handleSort("title")}>
                  Title
                </th>
                <th className="border p-2" onClick={() => handleSort("company")}>
                  Company
                </th>
                <th className="border p-2" onClick={() => handleSort("location")}>
                  Location
                </th>
                <th className="border p-2" onClick={() => handleSort("salary")}>
                  Salary
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={index} className="border">
                  <td className="border p-2">{job.title}</td>
                  <td className="border p-2">{job.company}</td>
                  <td className="border p-2">{job.location}</td>
                  <td className="border p-2">{job.salary} SGD</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !jobs.length && !loading ? (
          <div> No jobs was found!</div>
        ) : (
          <div></div>
        )}
      </div>
    );
  }
  
  export default JobsTable;