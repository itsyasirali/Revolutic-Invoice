import React from "react";
import { Star } from "lucide-react";

export const SetupNotes: React.FC = () => {
  return (
    <div className="space-y-2.5 text-[13px] text-slate-600">
      <p className="font-semibold text-slate-800 text-sm">Note:</p>
      <ul className="space-y-1.5 list-disc list-outside pl-4 leading-relaxed">
        <li>You can update some of these preferences from Settings anytime.</li>
        <li>
          The language you select on this page will be the default language for the following features even if you change the language later:
        </li>
      </ul>

      {/* Feature tags with orange stars */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-1 pl-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Email Templates</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Template Customizations</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Payment Modes</span>
        </div>
      </div>
    </div>
  );
};

export default SetupNotes;
