import "./App.css";
import JobsTable from "./components/jobs-table/JobsTable";
import JobsDashboard from "./components/jobs-dashboard/JobsDashboard";
import { useState } from "react";

function App() {

  const [tab, setTab] = useState(0)
  const changeTab = (val) => {
    setTab(val)
  }

  
  return(
    <div className="">
      <h1 className="text-2xl font-bold">Job Aggregator</h1>
    <ul class="flex flex-wrap -mb-px">
      <li class="me-4" onClick={() => changeTab(0)}>
          <a href="#" className={!tab ? "text-blue-600" :"inline-block"}>Dashboard</a> 
      </li>
      <li class="me-4" onClick={() => changeTab(1)}>
          <a href="#"  className={tab ? "text-blue-600" :"inline-block"}>Job Searching</a>
      </li>
    </ul>
      {tab ? <JobsTable /> : <JobsDashboard />}
    </div>
  )
}

export default App;
