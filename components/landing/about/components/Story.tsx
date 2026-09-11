import React from "react";
import Container from "@/components/layout/container";
import aboutStory from "@/data/about/story";

const Story = () => {
  return (
    <section className="pt-12 border-b border-slate-100">
      <Container>
        <div className="">
          <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-medium">
            {aboutStory.paragraphs.map((text, idx) => (
              <p key={idx}>{text}</p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Story;
