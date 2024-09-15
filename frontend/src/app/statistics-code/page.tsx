/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"; 
import React, { useEffect, useState } from "react";
import { StickyScroll } from "../../components/ui/sticky-scroll-reveal";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; 

// Random background generator function
const getRandomBackground = () => {
  const gradients = [
    "bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))]",
    "bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))]",
    "bg-[linear-gradient(to_bottom_right,var(--purple-500),var(--pink-500))]",
    "bg-[linear-gradient(to_bottom_right,var(--blue-500),var(--indigo-500))]",
    "bg-[linear-gradient(to_bottom_right,var(--red-500),var(--amber-500))]",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// Component for rendering the Pie Chart
const PieChartContent = ({ percentage }: { percentage: number }) => (
  <div className="flex flex-col items-center justify-center text-white">
    <div className="w-[150px] h-[150px]">
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
          textColor: "#fff",
          trailColor: "#d6d6d6",
          textSize: "22px",
        })}
      />
    </div>
  </div>
);

const StickyScrollRevealDemo = () => {
  const [content, setContent] = useState<any[]>([]);

  // Fetch content from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://f025-2620-101-f000-7c0-00-4a68.ngrok-free.app/api/review_code",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: "Provide code review feedback" }), // Replace with appropriate query if necessary
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch review data.");
        }

        const data = await response.json();

        // Transform the response into the required content structure
        const transformedContent = Object.keys(data).map((key) => {
          const feedbackData = data[key]; // Access the feedback and score for each key
          return {
            title: key, // The key is the title, e.g., 'correctness'
            description: feedbackData.feedback, // The feedback is the description
            percentage: feedbackData.score, // The score is used for the percentage
            background: getRandomBackground(), // Generate random background
          };
        });

        setContent(transformedContent);
      } catch (error) {
        console.error("Error fetching review data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-[100vh] w-screen flex flex-col">
      <StickyScroll
        content={content.map((item) => ({
          title: item.title,
          description: item.description,
          content: (
            <div className={`h-full w-full ${item.background} flex items-center justify-center text-white`}>
              <PieChartContent percentage={item.percentage} />
            </div>
          ),
        }))}
      />
    </div>
  );
};

export default StickyScrollRevealDemo;
