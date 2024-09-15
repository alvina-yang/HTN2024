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
  // Randomly select a gradient from the list
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// Simulating a dynamic response from the backend
const fetchContent = () => [
  {
    title: "Collaborative Editing", 
    description:
      "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
    percentage: 60, 
  },
  {
    title: "Real time changes",
    description:
      "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    percentage: 22,
  },
  {
    title: "Version control",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
    percentage: 80,
  },
  {
    title: "Running out of content",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates.",
    percentage: 20,
  },
];

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

  // Simulate fetching content from the backend
  useEffect(() => {
    const data = fetchContent();
    // Add random backgrounds to each content item
    const contentWithBackground = data.map((item) => ({
      ...item,
      background: getRandomBackground(),
    }));
    setContent(contentWithBackground);
  }, []);

  return (
    <div className="min-h-[100vh] w-screen flex flex-col">
      <StickyScroll
        content={content.map((item) => ({
          title: item.title,
          description: item.description,
          content: (
            <div className={`h-full w-full ${item.background} flex items-center justify-center text-white`}>
              {/* Display Pie Chart for each section */}
              <PieChartContent percentage={item.percentage} />
            </div>
          ),
        }))}
      />
    </div>
  );
};

export default StickyScrollRevealDemo;
