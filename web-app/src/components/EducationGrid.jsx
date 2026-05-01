import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Users, BookOpen } from 'lucide-react';

const EducationGrid = () => {
  const cards = [
    {
      icon: <Globe className="text-cyan-400" size={32} />,
      title: "Universal Communication",
      description: "Sign language bridges the gap between the hearing and deaf communities, fostering global inclusivity and understanding."
    },
    {
      icon: <Users className="text-cyan-400" size={32} />,
      title: "Community & Culture",
      description: "ASL is more than just hand signs; it encompasses a rich culture, history, and community that deserves recognition."
    },
    {
      icon: <BookOpen className="text-cyan-400" size={32} />,
      title: "Cognitive Benefits",
      description: "Learning sign language enhances cognitive functions, spatial awareness, and provides bilingual advantages."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -5 }}
          className="glass-panel p-8 rounded-2xl flex flex-col gap-4 border border-white/5 transition-colors hover:border-cyan-500/30"
        >
          <div className="p-4 bg-slate-900/50 rounded-xl w-fit border border-white/5">
            {card.icon}
          </div>
          <h3 className="text-xl font-semibold text-white mt-2">{card.title}</h3>
          <p className="text-slate-400 leading-relaxed">
            {card.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default EducationGrid;
