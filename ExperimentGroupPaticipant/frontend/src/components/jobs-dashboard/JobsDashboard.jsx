
import { useState, useEffect } from "react";
import * as echarts from 'echarts';
import { useRef } from 'react';


export default function JobsDashboard() {

  const [jobStats, setJobStats] = useState({});
  const [jobDistribution, setJobDistribution] = useState(null);
  const skillChartRef = useRef(null);

  const fetchJobStats = async () => {
    const response = await fetch("http://localhost:8000/jobs/stats");
    const data = await response.json();
    console.log(data);
    setJobStats(data);
    const transformedData = {};
      data.distribution.forEach(region => {
        transformedData[region._id] = region.data;
      });
      setJobDistribution(transformedData);

  };

  useEffect(() => {
    fetchJobStats();
  }, []);


  useEffect(() => {
    if (jobStats?.geo_distribution && skillChartRef.current) {
      const skillChart = echarts.init(skillChartRef.current);
      skillChart.setOption({
        title: { text: "Skill Trends Over Time" },
        tooltip: {},
        xAxis: { type: "category", data: jobStats.skill_trends ? Object.keys(jobStats.skill_trends) : [] },
        yAxis: { type: "value" },
        series: [
          {
            data: jobStats.skill_trends ? Object.values(jobStats.skill_trends) : [],
            type: "line"
          }
        ]
      });
    }
  }, [jobStats]);

  function EChartsComponent({ data }) {
    const chartRef = useRef(null);
  
    useEffect(() => {
      if (chartRef.current) {
        const chart = echarts.init(chartRef.current);
        const seriesData = data.map(job => ({
          name: job.title,
          value: job.count
        }));
  
        chart.setOption({
          title: { text: "Job Distribution" },
          tooltip: { trigger: "item" },
          xAxis: { type: "category", data: seriesData.map(d => d.name) },
          yAxis: { type: "value" },
          series: [{ type: "bar", data: seriesData }]
        });
      }
    }, [data]);
  
    return <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>;
  }

  return (

    <div className="p-4">
      <h1 className="text-2xl font-bold">Geographic Distribution of Jobs</h1>
      <div className="flex flex-wrap">
      {jobDistribution && Object.keys(jobDistribution).map(region => (
        <div key={region} className="my-4" style={{width: '50%'}}>
          <h2 className="text-xl font-bold">{region}</h2>
          <EChartsComponent data={jobDistribution[region]} />
        </div>
      ))}

      </div>
    </div>

  );
}


